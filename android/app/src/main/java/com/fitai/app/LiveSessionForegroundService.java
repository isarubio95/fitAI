package com.fitai.app;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.ActivityCompat;
import androidx.core.app.ServiceCompat;
import androidx.core.content.ContextCompat;

import java.util.HashMap;
import java.util.Map;

/**
 * Keeps the process alive and hosts promoted ongoing notifications for live sessions.
 * While resting, ticks every second so the emptying rest bar matches the in-app drawer.
 */
public class LiveSessionForegroundService extends Service {
    public static final String ACTION_START = "com.fitai.app.live.START";
    public static final String ACTION_UPDATE = "com.fitai.app.live.UPDATE";
    public static final String ACTION_STOP = "com.fitai.app.live.STOP";
    public static final String ACTION_STOP_ALL = "com.fitai.app.live.STOP_ALL";

    private static final Map<String, LiveSessionState> ACTIVE = new HashMap<>();

    private final Handler restTicker = new Handler(Looper.getMainLooper());
    private final Runnable restTickRunnable = new Runnable() {
        @Override
        public void run() {
            LiveSessionState workout = ACTIVE.get(LiveSessionNotifier.KIND_WORKOUT);
            if (workout == null || !LiveSessionNotifier.isRestMode(workout)) {
                return;
            }
            if (workout.isRestComplete() && !workout.restFinished) {
                workout.restFinished = true;
                workout.resting = false;
            }
            LiveSessionNotifier.notify(LiveSessionForegroundService.this, workout);
            promotePrimary();
            if (LiveSessionNotifier.isRestMode(workout) && !workout.restFinished) {
                restTicker.postDelayed(this, 1000L);
            }
        }
    };

    public static void startSession(Context context, LiveSessionState state) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_START);
        intent.putExtras(state.toBundle());
        ContextCompat.startForegroundService(context, intent);
    }

    public static void updateSession(Context context, LiveSessionState state) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_UPDATE);
        intent.putExtras(state.toBundle());
        try {
            ContextCompat.startForegroundService(context, intent);
        } catch (Throwable t) {
            context.startService(intent);
        }
    }

    public static void stopSession(Context context, String kind) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_STOP);
        intent.putExtra("kind", kind);
        try {
            context.startService(intent);
        } catch (Throwable ignored) {
            // Service not running
        }
    }

    public static void stopAll(Context context) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_STOP_ALL);
        try {
            context.startService(intent);
        } catch (Throwable ignored) {
            // Service not running
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            if (ACTIVE.isEmpty()) {
                stopSelf();
            }
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (ACTION_STOP_ALL.equals(action)) {
            stopRestTicker();
            ACTIVE.clear();
            LiveSessionNotifier.cancelAll(this);
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }

        if (ACTION_STOP.equals(action)) {
            String kind = intent.getStringExtra("kind");
            if (kind != null) {
                ACTIVE.remove(kind);
                LiveSessionNotifier.cancel(this, kind);
            }
            if (ACTIVE.isEmpty()) {
                stopRestTicker();
                stopForeground(STOP_FOREGROUND_REMOVE);
                stopSelf();
            } else {
                syncRestTicker();
                promotePrimary();
            }
            return START_STICKY;
        }

        LiveSessionState incoming = LiveSessionState.fromBundle(intent.getExtras());
        if (incoming.kind == null || incoming.kind.isEmpty()) {
            incoming.kind = LiveSessionNotifier.KIND_WORKOUT;
        }

        if (ACTION_START.equals(action) || ACTION_UPDATE.equals(action)) {
            LiveSessionState existing = ACTIVE.get(incoming.kind);
            if (existing != null && ACTION_UPDATE.equals(action)) {
                existing.mergeFrom(incoming);
                incoming = existing;
            }
            ACTIVE.put(incoming.kind, incoming);
            LiveSessionNotifier.notify(this, incoming);
            promotePrimary();
            syncRestTicker();
        }

        return START_STICKY;
    }

    private void syncRestTicker() {
        stopRestTicker();
        LiveSessionState workout = ACTIVE.get(LiveSessionNotifier.KIND_WORKOUT);
        if (workout != null && LiveSessionNotifier.isRestMode(workout) && !workout.restFinished) {
            restTicker.postDelayed(restTickRunnable, 1000L);
        }
    }

    private void stopRestTicker() {
        restTicker.removeCallbacks(restTickRunnable);
    }

    private void promotePrimary() {
        LiveSessionState primary = ACTIVE.get(LiveSessionNotifier.KIND_WORKOUT);
        if (primary == null) {
            primary = ACTIVE.get(LiveSessionNotifier.KIND_CARDIO);
        }
        if (primary == null) {
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return;
        }

        Notification notification = LiveSessionNotifier.build(this, primary);
        int notifId = LiveSessionNotifier.notificationIdForKind(primary.kind);
        int fgsType = resolveFgsType(primary);

        try {
            ServiceCompat.startForeground(
                this,
                notifId,
                notification,
                fgsType
            );
        } catch (Throwable t) {
            startForeground(notifId, notification);
        }

        for (LiveSessionState state : ACTIVE.values()) {
            if (!state.kind.equals(primary.kind)) {
                LiveSessionNotifier.notify(this, state);
            }
        }
    }

    private int resolveFgsType(LiveSessionState state) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            return 0;
        }

        int type = 0;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH;
            if (state.wantsLocation && hasLocationPermission()) {
                type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION;
            }
        } else if (state.wantsLocation && hasLocationPermission()) {
            type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION;
        }
        return type;
    }

    private boolean hasLocationPermission() {
        return ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED
            || ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onDestroy() {
        stopRestTicker();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
