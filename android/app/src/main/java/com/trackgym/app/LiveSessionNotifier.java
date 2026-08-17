package com.trackgym.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

/**
 * Builds and posts promoted ongoing notifications for active gym/cardio sessions.
 * During rest, shows an emptying progress bar matching the in-app RestProgressBar
 * (blue → amber as it empties, green when finished).
 */
public final class LiveSessionNotifier {
    /** v2: canal silencioso (sin sonido/vibración). */
    public static final String CHANNEL_ID = "live-session-silent";
    private static final String LEGACY_CHANNEL_ID = "live-session";
    public static final int WORKOUT_NOTIFICATION_ID = 9101;
    public static final int CARDIO_NOTIFICATION_ID = 9102;

    public static final String KIND_WORKOUT = "workout";
    public static final String KIND_CARDIO = "cardio";

    private LiveSessionNotifier() {}

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;

        // Quitar el canal antiguo (con sonido por defecto) si sigue registrado.
        try {
            manager.deleteNotificationChannel(LEGACY_CHANNEL_ID);
        } catch (Throwable ignored) {
            // ignore
        }

        NotificationChannel existing = manager.getNotificationChannel(CHANNEL_ID);
        if (existing != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Sesión en curso",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Entrenamiento, cardio o descanso activo");
        channel.setShowBadge(false);
        channel.enableVibration(false);
        channel.setVibrationPattern(null);
        channel.setSound(null, null);
        channel.enableLights(false);
        manager.createNotificationChannel(channel);
    }

    public static int notificationIdForKind(String kind) {
        return KIND_CARDIO.equals(kind) ? CARDIO_NOTIFICATION_ID : WORKOUT_NOTIFICATION_ID;
    }

    public static Notification build(Context context, LiveSessionState state) {
        ensureChannel(context);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            notificationIdForKind(state.kind),
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        boolean showRestBar = isRestMode(state);
        String title = resolveTitle(state, showRestBar);
        String body = resolveBody(state, showRestBar);
        String chip = resolveChip(state, showRestBar);
        int accent = showRestBar ? restBarColor(state) : ContextCompat.getColor(context, android.R.color.holo_green_light);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setSubText(showRestBar ? "Descanso" : (KIND_CARDIO.equals(state.kind) ? "Cardio" : "Entrenamiento"))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setSound(null)
            .setVibrate(null)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(contentIntent)
            .setColor(accent)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE);

        try {
            if (Build.VERSION.SDK_INT >= 36) {
                builder.setRequestPromotedOngoing(true);
            }
        } catch (Throwable ignored) {
            // Older androidx without Live Updates helpers
        }

        if (chip != null && !chip.isEmpty()) {
            try {
                builder.setShortCriticalText(chip);
            } catch (Throwable ignored) {
                // API not available on this androidx build
            }
        }

        applyChronometer(builder, state, showRestBar);
        if (showRestBar) {
            applyRestProgressBar(builder, state, accent);
        }

        return builder.build();
    }

    public static void notify(Context context, LiveSessionState state) {
        ensureChannel(context);
        Notification notification = build(context, state);
        NotificationManagerCompat.from(context).notify(notificationIdForKind(state.kind), notification);
    }

    public static void cancel(Context context, String kind) {
        NotificationManagerCompat.from(context).cancel(notificationIdForKind(kind));
    }

    public static void cancelAll(Context context) {
        NotificationManagerCompat.from(context).cancel(WORKOUT_NOTIFICATION_ID);
        NotificationManagerCompat.from(context).cancel(CARDIO_NOTIFICATION_ID);
    }

    static boolean isRestMode(LiveSessionState state) {
        return KIND_WORKOUT.equals(state.kind)
            && (state.resting || state.restFinished)
            && state.restDurationSec > 0;
    }

    /**
     * Same hue logic as RestProgressBar in WorkoutLogger:
     * blue (212) when full → amber (28) when almost empty; green (152) when finished.
     */
    static int restBarColor(LiveSessionState state) {
        if (state.isRestComplete()) {
            return Color.HSVToColor(new float[] { 152f, 0.70f, 0.42f });
        }
        float ratio = state.restDurationSec > 0
            ? Math.min(1f, Math.max(0f, state.restRemainingSec() / (float) state.restDurationSec))
            : 0f;
        float hue = 28f + ratio * (212f - 28f);
        return Color.HSVToColor(new float[] { hue, 0.88f, 0.56f });
    }

    private static String resolveTitle(LiveSessionState state, boolean showRestBar) {
        if (showRestBar) return "Descanso";
        if (state.title != null && !state.title.isEmpty()) return state.title;
        return KIND_CARDIO.equals(state.kind) ? "Cardio" : "Entrenamiento";
    }

    private static String resolveBody(LiveSessionState state, boolean showRestBar) {
        if (state.paused && !showRestBar) {
            return "Pausado";
        }
        if (showRestBar) {
            if (state.isRestComplete()) {
                return "¡Listo!";
            }
            StringBuilder sb = new StringBuilder();
            if (state.exerciseName != null && !state.exerciseName.isEmpty()) {
                sb.append(state.exerciseName);
            }
            if (state.setLabel != null && !state.setLabel.isEmpty()) {
                if (sb.length() > 0) sb.append(" · ");
                sb.append(state.setLabel);
            }
            if (sb.length() > 0) return sb.toString();
            return formatMSS(state.restRemainingSec());
        }
        if (KIND_WORKOUT.equals(state.kind)) {
            StringBuilder sb = new StringBuilder();
            if (state.exerciseName != null && !state.exerciseName.isEmpty()) {
                sb.append(state.exerciseName);
            }
            if (state.setLabel != null && !state.setLabel.isEmpty()) {
                if (sb.length() > 0) sb.append(" · ");
                sb.append(state.setLabel);
            }
            if (sb.length() > 0) return sb.toString();
            return "En curso";
        }
        if (state.distanceLabel != null && !state.distanceLabel.isEmpty()) {
            return state.distanceLabel;
        }
        return "En curso";
    }

    private static String resolveChip(LiveSessionState state, boolean showRestBar) {
        if (showRestBar) {
            if (state.isRestComplete()) return "Listo";
            return formatMSS(state.restRemainingSec());
        }
        if (state.paused) return "Pause";
        if (KIND_CARDIO.equals(state.kind)) return "Cardio";
        return "Gym";
    }

    private static void applyChronometer(
        NotificationCompat.Builder builder,
        LiveSessionState state,
        boolean showRestBar
    ) {
        if (state.paused && !showRestBar) {
            builder.setShowWhen(false);
            builder.setUsesChronometer(false);
            return;
        }
        if (showRestBar && !state.isRestComplete() && state.restEndAtMs > 0) {
            builder.setWhen(state.restEndAtMs);
            builder.setUsesChronometer(true);
            builder.setChronometerCountDown(true);
            builder.setShowWhen(true);
            return;
        }
        if (showRestBar) {
            builder.setShowWhen(false);
            builder.setUsesChronometer(false);
            return;
        }
        if (state.startedAtMs > 0) {
            long when = state.startedAtMs + Math.max(0, state.pausedAccumMs);
            builder.setWhen(when);
            builder.setUsesChronometer(true);
            builder.setChronometerCountDown(false);
            builder.setShowWhen(true);
            return;
        }
        builder.setShowWhen(false);
        builder.setUsesChronometer(false);
    }

    /**
     * Emptying bar: remaining / duration — same semantics as RestProgressBar in the drawer.
     */
    private static void applyRestProgressBar(
        NotificationCompat.Builder builder,
        LiveSessionState state,
        int accent
    ) {
        int max = Math.max(1, state.restDurationSec);
        int remaining = state.restRemainingSec();
        // Drawer: width = remaining/duration while running; 100% green when finished.
        int progress = state.isRestComplete() ? max : remaining;

        try {
            NotificationCompat.ProgressStyle.Segment segment =
                new NotificationCompat.ProgressStyle.Segment(max).setColor(accent);
            NotificationCompat.ProgressStyle style = new NotificationCompat.ProgressStyle()
                .setProgress(Math.max(0, progress))
                .setStyledByProgress(true)
                .setProgressSegments(java.util.Collections.singletonList(segment));
            builder.setStyle(style);
        } catch (Throwable ignored) {
            builder.setProgress(max, Math.max(0, progress), false);
            builder.setColor(accent);
        }
    }

    static String formatMSS(int totalSeconds) {
        int s = Math.max(0, totalSeconds);
        int m = s / 60;
        int r = s % 60;
        return m + ":" + (r < 10 ? "0" : "") + r;
    }
}
