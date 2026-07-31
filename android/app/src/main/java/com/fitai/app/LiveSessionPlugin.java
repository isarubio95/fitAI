package com.fitai.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

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
        )
    }
)
public class LiveSessionPlugin extends Plugin {

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
