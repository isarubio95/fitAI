package com.trackgym.app;

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
import android.os.PowerManager;

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
    public static final String ACTION_START = "com.trackgym.app.live.START";
    public static final String ACTION_UPDATE = "com.trackgym.app.live.UPDATE";
    public static final String ACTION_STOP = "com.trackgym.app.live.STOP";
    public static final String ACTION_STOP_ALL = "com.trackgym.app.live.STOP_ALL";
    public static final String ACTION_TRACK_START = "com.trackgym.app.live.TRACK_START";
    public static final String ACTION_TRACK_STOP = "com.trackgym.app.live.TRACK_STOP";

    private static final Map<String, LiveSessionState> ACTIVE = new HashMap<>();

    /** A run longer than this is not a run; the lock is a safety net, not a lease. */
    private static final long WAKE_LOCK_TIMEOUT_MS = 12 * 60 * 60 * 1000L;

    private PowerManager.WakeLock trackingWakeLock;

    private final Handler cardioTicker = new Handler(Looper.getMainLooper());
    private final Runnable cardioTickRunnable = new Runnable() {
        @Override
        public void run() {
            CardioTrackRecorder recorder = CardioTrackRecorder.getInstance();
            if (!recorder.isTracking()) {
                return;
            }
            recorder.tick();
            if (syncCardioFromRecorder()) {
                promotePrimary();
            }
            cardioTicker.postDelayed(this, 1000L);
        }
    };

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

    /**
     * Background GPS needs a foreground service of type location, and Android needs a
     * notification to attach it to — so this promotes the cardio session even when the user
     * turned live notifications off.
     */
    public static void startTracking(
        Context context,
        String sessionId,
        String title,
        long startedAtMs,
        String configJson
    ) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_TRACK_START);
        intent.putExtra("sessionId", sessionId);
        intent.putExtra("title", title);
        intent.putExtra("startedAtMs", startedAtMs);
        intent.putExtra("configJson", configJson);
        ContextCompat.startForegroundService(context, intent);
    }

    public static void stopTracking(Context context) {
        Intent intent = new Intent(context, LiveSessionForegroundService.class);
        intent.setAction(ACTION_TRACK_STOP);
        try {
            context.startService(intent);
        } catch (Throwable ignored) {
            // Service not running
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            // Recreated by START_STICKY after a process kill: pick the persisted track back up.
            if (restoreTrackingAfterRestart()) {
                return START_STICKY;
            }
            if (ACTIVE.isEmpty()) {
                stopSelf();
            }
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (ACTION_TRACK_START.equals(action)) {
            handleTrackStart(intent);
            return START_STICKY;
        }

        if (ACTION_TRACK_STOP.equals(action)) {
            handleTrackStop();
            return START_STICKY;
        }

        if (ACTION_STOP_ALL.equals(action)) {
            stopRestTicker();
            // Solo deja de grabar: el recorrido ya hecho se conserva hasta que se guarde o
            // se descarte la sesión (clearTrack).
            handleTrackStop();
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
                if (LiveSessionNotifier.KIND_CARDIO.equals(kind)) {
                    handleTrackStop();
                }
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
            // The recorder owns distance and pause while tracking, so a stale JS update
            // must not roll them back.
            syncCardioFromRecorder();
            LiveSessionNotifier.notify(this, ACTIVE.get(incoming.kind));
            promotePrimary();
            syncRestTicker();
        }

        return START_STICKY;
    }

    private void handleTrackStart(Intent intent) {
        String sessionId = intent.getStringExtra("sessionId");
        String title = intent.getStringExtra("title");
        long startedAtMs = intent.getLongExtra("startedAtMs", 0L);
        String configJson = intent.getStringExtra("configJson");

        LiveSessionState cardio = ACTIVE.get(LiveSessionNotifier.KIND_CARDIO);
        if (cardio == null) {
            cardio = new LiveSessionState();
            cardio.kind = LiveSessionNotifier.KIND_CARDIO;
            ACTIVE.put(cardio.kind, cardio);
        }
        cardio.sessionId = sessionId == null ? "" : sessionId;
        if (title != null && !title.isEmpty()) cardio.title = title;
        if (cardio.title == null || cardio.title.isEmpty()) cardio.title = "Cardio";
        if (startedAtMs > 0) cardio.startedAtMs = startedAtMs;
        cardio.wantsLocation = true;

        // Promote before asking for fixes: the location FGS type must be live first.
        promotePrimary();
        acquireTrackingWakeLock();

        CardioTrackRecorder.Config config = null;
        if (configJson != null && !configJson.isEmpty()) {
            try {
                config = CardioTrackRecorder.Config.fromJson(new org.json.JSONObject(configJson));
            } catch (Throwable ignored) {
                // Fall back to the built-in defaults.
            }
        }
        CardioTrackRecorder.getInstance().start(this, sessionId, title, startedAtMs, config);

        syncCardioFromRecorder();
        promotePrimary();
        startCardioTicker();
    }

    private void handleTrackStop() {
        stopCardioTicker();
        CardioTrackRecorder.getInstance().stop();
        releaseTrackingWakeLock();
    }

    private boolean restoreTrackingAfterRestart() {
        CardioTrackRecorder recorder = CardioTrackRecorder.getInstance();
        if (!recorder.resumePersisted(this)) return false;

        LiveSessionState cardio = ACTIVE.get(LiveSessionNotifier.KIND_CARDIO);
        if (cardio == null) {
            cardio = new LiveSessionState();
            cardio.kind = LiveSessionNotifier.KIND_CARDIO;
            ACTIVE.put(cardio.kind, cardio);
        }
        cardio.sessionId = recorder.getSessionId();
        String restoredTitle = recorder.getTitle();
        cardio.title = restoredTitle == null || restoredTitle.isEmpty() ? "Cardio" : restoredTitle;
        cardio.startedAtMs = recorder.getStartedAtMs();
        cardio.wantsLocation = true;

        syncCardioFromRecorder();
        promotePrimary();
        acquireTrackingWakeLock();
        startCardioTicker();
        return true;
    }

    /**
     * Copies the recorder's authoritative distance and pause state onto the cardio
     * notification. Returns true when something the notification shows actually changed.
     */
    private boolean syncCardioFromRecorder() {
        CardioTrackRecorder recorder = CardioTrackRecorder.getInstance();
        if (!recorder.isTracking()) return false;
        LiveSessionState cardio = ACTIVE.get(LiveSessionNotifier.KIND_CARDIO);
        if (cardio == null) return false;

        String label = CardioTrackRecorder.formatDistanceLabel(recorder.getDistanceM());
        boolean paused = recorder.isPaused();
        long accumMs = recorder.getPausedAccumMs();
        long startedAtMs = recorder.getStartedAtMs();

        boolean changed = !label.equals(cardio.distanceLabel == null ? "" : cardio.distanceLabel)
            || paused != cardio.paused;
        // While paused the chronometer is hidden, so its growing base is not worth a redraw.
        if (!paused && Math.abs(accumMs - cardio.pausedAccumMs) >= 1000L) changed = true;

        cardio.distanceLabel = label;
        cardio.paused = paused;
        cardio.pausedAccumMs = accumMs;
        if (startedAtMs > 0) cardio.startedAtMs = startedAtMs;
        return changed;
    }

    private void startCardioTicker() {
        cardioTicker.removeCallbacks(cardioTickRunnable);
        cardioTicker.postDelayed(cardioTickRunnable, 1000L);
    }

    private void stopCardioTicker() {
        cardioTicker.removeCallbacks(cardioTickRunnable);
    }

    @SuppressWarnings("deprecation")
    private void acquireTrackingWakeLock() {
        if (trackingWakeLock == null) {
            PowerManager pm = getSystemService(PowerManager.class);
            if (pm == null) return;
            trackingWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "trackgym:cardio-track");
            trackingWakeLock.setReferenceCounted(false);
        }
        if (!trackingWakeLock.isHeld()) {
            trackingWakeLock.acquire(WAKE_LOCK_TIMEOUT_MS);
        }
    }

    private void releaseTrackingWakeLock() {
        if (trackingWakeLock != null && trackingWakeLock.isHeld()) {
            try {
                trackingWakeLock.release();
            } catch (Throwable ignored) {
                // Already released
            }
        }
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

        // A gym session can be primary while cardio records in parallel, so the location type
        // has to follow any active session — not just the promoted one.
        boolean wantsLocation = state.wantsLocation || CardioTrackRecorder.getInstance().isTracking();
        if (!wantsLocation) {
            for (LiveSessionState active : ACTIVE.values()) {
                if (active.wantsLocation) {
                    wantsLocation = true;
                    break;
                }
            }
        }

        int type = 0;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH;
        }
        if (wantsLocation && hasLocationPermission()) {
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
        stopCardioTicker();
        releaseTrackingWakeLock();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
