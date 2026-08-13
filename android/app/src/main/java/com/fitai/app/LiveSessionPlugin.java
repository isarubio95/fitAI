package com.fitai.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONObject;

@CapacitorPlugin(
    name = "LiveSession",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        ),
        @Permission(
            alias = "activity",
            strings = { Manifest.permission.ACTIVITY_RECOGNITION }
        ),
        @Permission(
            alias = "location",
            strings = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }
        )
    }
)
public class LiveSessionPlugin extends Plugin {

    private static final String EVENT_TRACK_UPDATE = "cardioTrackUpdate";

    private CardioTrackRecorder.Listener trackListener;

    @Override
    public void load() {
        trackListener = payload -> {
            try {
                notifyListeners(EVENT_TRACK_UPDATE, JSObject.fromJSONObject(payload));
            } catch (Exception ignored) {
                // A malformed payload must never break recording.
            }
        };
        CardioTrackRecorder.getInstance().addListener(trackListener);
    }

    @Override
    protected void handleOnDestroy() {
        if (trackListener != null) {
            CardioTrackRecorder.getInstance().removeListener(trackListener);
        }
        super.handleOnDestroy();
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (needsRuntimePermissions()) {
            call.setKeepAlive(true);
            requestPermissionForAliases(
                new String[] { "notifications", "activity" },
                call,
                "onStartPermissions"
            );
            return;
        }
        doStart(call);
    }

    @PermissionCallback
    private void onStartPermissions(PluginCall call) {
        // Proceed even if ACTIVITY_RECOGNITION was denied — notification still posts.
        doStart(call);
    }

    private void doStart(PluginCall call) {
        try {
            LiveSessionState state = stateFromCall(call);
            LiveSessionForegroundService.startSession(getContext(), state);
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to start live session: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void update(PluginCall call) {
        try {
            LiveSessionState state = stateFromCall(call);
            LiveSessionForegroundService.updateSession(getContext(), state);
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to update live session: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            String kind = call.getString("kind", LiveSessionNotifier.KIND_WORKOUT);
            LiveSessionForegroundService.stopSession(getContext(), kind);
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to stop live session: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopAll(PluginCall call) {
        try {
            LiveSessionForegroundService.stopAll(getContext());
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to stop live sessions: " + e.getMessage(), e);
        }
    }

    // ------------------------------------------------------- cardio GPS tracking

    @PluginMethod
    public void startTracking(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.setKeepAlive(true);
            requestPermissionForAlias("location", call, "onLocationPermission");
            return;
        }
        doStartTracking(call);
    }

    @PermissionCallback
    private void onLocationPermission(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Location permission denied");
            return;
        }
        doStartTracking(call);
    }

    private void doStartTracking(PluginCall call) {
        try {
            String sessionId = call.getString("sessionId", "");
            if (sessionId == null || sessionId.isEmpty()) {
                call.reject("sessionId is required");
                return;
            }
            String title = call.getString("title", "Cardio");
            long startedAtMs = readLong(call, "startedAtMs", 0L);
            JSObject config = call.getObject("config");

            LiveSessionForegroundService.startTracking(
                getContext(),
                sessionId,
                title,
                startedAtMs,
                config == null ? null : config.toString()
            );

            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to start cardio tracking: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        try {
            LiveSessionForegroundService.stopTracking(getContext());
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to stop cardio tracking: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getTrackSnapshot(PluginCall call) {
        try {
            JSONObject snapshot = CardioTrackRecorder.getInstance().snapshot();
            call.resolve(JSObject.fromJSONObject(snapshot));
        } catch (Exception e) {
            call.reject("Failed to read cardio track: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void setPaused(PluginCall call) {
        try {
            boolean paused = readBoolean(call, "paused", false);
            String source = call.getString("source", paused ? "manual" : null);
            CardioTrackRecorder.getInstance().setPaused(paused, source);
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to set pause state: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void setAutoPauseEnabled(PluginCall call) {
        try {
            CardioTrackRecorder.getInstance().setAutoPauseEnabled(readBoolean(call, "enabled", true));
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to set auto-pause: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void clearTrack(PluginCall call) {
        try {
            LiveSessionForegroundService.stopTracking(getContext());
            CardioTrackRecorder.getInstance().clear(call.getString("sessionId", null));
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to clear cardio track: " + e.getMessage(), e);
        }
    }

    private boolean needsRuntimePermissions() {
        boolean needNotif = Build.VERSION.SDK_INT >= 33
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED;
        boolean needActivity = Build.VERSION.SDK_INT >= 29
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION)
                != PackageManager.PERMISSION_GRANTED;
        return needNotif || needActivity;
    }

    private LiveSessionState stateFromCall(PluginCall call) {
        LiveSessionState state = new LiveSessionState();
        state.kind = call.getString("kind", LiveSessionNotifier.KIND_WORKOUT);
        state.sessionId = call.getString("sessionId", "");
        state.title = call.getString("title", "");
        state.exerciseName = call.getString("exerciseName", "");
        state.setLabel = call.getString("setLabel", "");
        state.distanceLabel = call.getString("distanceLabel", "");
        state.paused = readBoolean(call, "paused", false);
        state.resting = readBoolean(call, "resting", false);
        state.restFinished = readBoolean(call, "restFinished", false);
        state.wantsLocation = readBoolean(call, "wantsLocation", false);
        state.startedAtMs = readLong(call, "startedAtMs", 0L);
        state.restEndAtMs = readLong(call, "restEndAtMs", 0L);
        state.pausedAccumMs = readLong(call, "pausedAccumMs", 0L);
        state.restDurationSec = (int) readLong(call, "restDurationSec", 0L);
        state.normalizeRestWindow();
        return state;
    }

    private static boolean readBoolean(PluginCall call, String key, boolean fallback) {
        Boolean boxed = call.getBoolean(key, fallback);
        if (boxed != null) return boxed;
        JSObject data = call.getData();
        if (data != null && data.has(key)) {
            return data.optBoolean(key, fallback);
        }
        return fallback;
    }

    /**
     * JS numbers arrive as Double in JSON — getInt() often returns null.
     * Accept Double / Integer / Long / String.
     */
    private static long readLong(PluginCall call, String key, long fallback) {
        Double asDouble = call.getDouble(key);
        if (asDouble != null && !asDouble.isNaN()) {
            return asDouble.longValue();
        }
        Integer asInt = call.getInt(key);
        if (asInt != null) {
            return asInt.longValue();
        }
        String asString = call.getString(key);
        if (asString != null && !asString.isEmpty()) {
            try {
                return (long) Double.parseDouble(asString);
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        JSObject data = call.getData();
        if (data != null && data.has(key)) {
            Object raw = data.opt(key);
            if (raw instanceof Number) {
                return ((Number) raw).longValue();
            }
            if (raw instanceof String) {
                try {
                    return (long) Double.parseDouble((String) raw);
                } catch (NumberFormatException ignored) {
                    // fall through
                }
            }
            return data.optLong(key, fallback);
        }
        return fallback;
    }
}
