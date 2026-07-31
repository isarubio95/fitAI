package com.fitai.app;

import android.os.Bundle;

/**
 * Snapshot of an active gym or cardio session for the ongoing notification.
 */
public final class LiveSessionState {
    public String kind = LiveSessionNotifier.KIND_WORKOUT;
    public String sessionId = "";
    public String title = "";
    public String exerciseName = "";
    public String setLabel = "";
    public String distanceLabel = "";
    public boolean paused = false;
    public boolean resting = false;
    public boolean restFinished = false;
    public long startedAtMs = 0L;
    public long restEndAtMs = 0L;
    /** Total rest duration in seconds (for emptying progress bar). */
    public int restDurationSec = 0;
    public long pausedAccumMs = 0L;
    public boolean wantsLocation = false;

    public static LiveSessionState fromBundle(Bundle extras) {
        LiveSessionState state = new LiveSessionState();
        if (extras == null) return state;
        state.kind = extras.getString("kind", LiveSessionNotifier.KIND_WORKOUT);
        state.sessionId = extras.getString("sessionId", "");
        state.title = extras.getString("title", "");
        state.exerciseName = extras.getString("exerciseName", "");
        state.setLabel = extras.getString("setLabel", "");
        state.distanceLabel = extras.getString("distanceLabel", "");
        state.paused = extras.getBoolean("paused", false);
        state.resting = extras.getBoolean("resting", false);
        state.restFinished = extras.getBoolean("restFinished", false);
        state.startedAtMs = extras.getLong("startedAtMs", 0L);
        state.restEndAtMs = extras.getLong("restEndAtMs", 0L);
        state.restDurationSec = extras.getInt("restDurationSec", 0);
        state.pausedAccumMs = extras.getLong("pausedAccumMs", 0L);
        state.wantsLocation = extras.getBoolean("wantsLocation", false);
        state.normalizeRestWindow();
        return state;
    }

    public Bundle toBundle() {
        Bundle b = new Bundle();
        b.putString("kind", kind);
        b.putString("sessionId", sessionId);
        b.putString("title", title);
        b.putString("exerciseName", exerciseName);
        b.putString("setLabel", setLabel);
        b.putString("distanceLabel", distanceLabel);
        b.putBoolean("paused", paused);
        b.putBoolean("resting", resting);
        b.putBoolean("restFinished", restFinished);
        b.putLong("startedAtMs", startedAtMs);
        b.putLong("restEndAtMs", restEndAtMs);
        b.putInt("restDurationSec", restDurationSec);
        b.putLong("pausedAccumMs", pausedAccumMs);
        b.putBoolean("wantsLocation", wantsLocation);
        return b;
    }

    public void mergeFrom(LiveSessionState other) {
        if (other.kind != null && !other.kind.isEmpty()) kind = other.kind;
        if (other.sessionId != null && !other.sessionId.isEmpty()) sessionId = other.sessionId;
        if (other.title != null) title = other.title;
        if (other.exerciseName != null) exerciseName = other.exerciseName;
        if (other.setLabel != null) setLabel = other.setLabel;
        if (other.distanceLabel != null) distanceLabel = other.distanceLabel;
        paused = other.paused;
        wantsLocation = other.wantsLocation;
        if (other.startedAtMs > 0) startedAtMs = other.startedAtMs;
        pausedAccumMs = other.pausedAccumMs;

        // Avoid wiping an active rest with a stale non-rest update (React race).
        boolean incomingClearsRest = !other.resting && !other.restFinished && other.restDurationSec <= 0;
        boolean keepExistingRest = resting && !restFinished && restEndAtMs > System.currentTimeMillis() && incomingClearsRest;
        if (!keepExistingRest) {
            resting = other.resting;
            restFinished = other.restFinished;
            restDurationSec = other.restDurationSec;
            if (other.restEndAtMs > 0 || !other.resting) {
                restEndAtMs = other.restEndAtMs;
            }
        }

        normalizeRestWindow();
    }

    /**
     * If JS said resting but forgot/lost restEndAtMs, synthesize it from duration.
     */
    public void normalizeRestWindow() {
        if (restFinished) {
            resting = false;
            return;
        }
        if (resting && restDurationSec > 0 && restEndAtMs <= 0) {
            restEndAtMs = System.currentTimeMillis() + restDurationSec * 1000L;
        }
        if (resting && restEndAtMs > 0 && restDurationSec <= 0) {
            long left = Math.max(1L, (restEndAtMs - System.currentTimeMillis() + 999L) / 1000L);
            restDurationSec = (int) left;
        }
    }

    /** Remaining rest seconds while countdown is active. */
    public int restRemainingSec() {
        if (restFinished) return 0;
        if (!resting) return 0;
        if (restEndAtMs <= 0) {
            return Math.max(0, restDurationSec);
        }
        long leftMs = restEndAtMs - System.currentTimeMillis();
        if (leftMs <= 0) return 0;
        return (int) Math.ceil(leftMs / 1000.0);
    }

    public boolean isRestComplete() {
        if (restFinished) return true;
        return resting && restEndAtMs > 0 && System.currentTimeMillis() >= restEndAtMs;
    }
}
