package com.trackgym.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Looper;

import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Owns the cardio GPS track while the app is in the background: requests fused location
 * updates, filters and accumulates points, distance and elevation, and runs the auto-pause
 * state machine. The WebView is a consumer — it drains deltas via listener events and
 * re-syncs the full buffer when it comes back to the foreground.
 *
 * All thresholds arrive from JS (see nativeCardioTracker.ts) so cardioGpsMotion.ts and
 * cardioTrackPoints.ts stay the single source of truth for the numbers.
 */
public final class CardioTrackRecorder {

    public interface Listener {
        void onCardioTrackUpdate(JSONObject payload);
    }

    private static final String STATE_FILE = "cardio_track.json";
    private static final long PERSIST_MIN_INTERVAL_MS = 5_000L;

    private static CardioTrackRecorder instance;

    public static synchronized CardioTrackRecorder getInstance() {
        if (instance == null) {
            instance = new CardioTrackRecorder();
        }
        return instance;
    }

    /** Tunables mirrored from cardioGpsMotion.ts / cardioTrackPoints.ts. */
    public static final class Config {
        public long minIntervalMs = 2_000L;
        public double minDeltaM = 4d;
        public double maxAccuracyM = 85d;
        public double idleSpeedMps = 0.6d;
        public long idleBeforePauseMs = 12_000L;
        public long moveBeforeResumeMs = 4_000L;
        public long startGraceMs = 30_000L;
        public double minSpacingM = 12d;
        public int maxPoints = 2_500;
        public double elevationMinStepM = 1.5d;
        public boolean autoPauseEnabled = true;

        JSONObject toJson() {
            JSONObject o = new JSONObject();
            try {
                o.put("minIntervalMs", minIntervalMs);
                o.put("minDeltaM", minDeltaM);
                o.put("maxAccuracyM", maxAccuracyM);
                o.put("idleSpeedMps", idleSpeedMps);
                o.put("idleBeforePauseMs", idleBeforePauseMs);
                o.put("moveBeforeResumeMs", moveBeforeResumeMs);
                o.put("startGraceMs", startGraceMs);
                o.put("minSpacingM", minSpacingM);
                o.put("maxPoints", maxPoints);
                o.put("elevationMinStepM", elevationMinStepM);
                o.put("autoPauseEnabled", autoPauseEnabled);
            } catch (Exception ignored) {
                // JSONObject.put only throws on NaN keys we never produce
            }
            return o;
        }

        static Config fromJson(JSONObject o) {
            Config c = new Config();
            if (o == null) return c;
            c.minIntervalMs = o.optLong("minIntervalMs", c.minIntervalMs);
            c.minDeltaM = o.optDouble("minDeltaM", c.minDeltaM);
            c.maxAccuracyM = o.optDouble("maxAccuracyM", c.maxAccuracyM);
            c.idleSpeedMps = o.optDouble("idleSpeedMps", c.idleSpeedMps);
            c.idleBeforePauseMs = o.optLong("idleBeforePauseMs", c.idleBeforePauseMs);
            c.moveBeforeResumeMs = o.optLong("moveBeforeResumeMs", c.moveBeforeResumeMs);
            c.startGraceMs = o.optLong("startGraceMs", c.startGraceMs);
            c.minSpacingM = o.optDouble("minSpacingM", c.minSpacingM);
            c.maxPoints = o.optInt("maxPoints", c.maxPoints);
            c.elevationMinStepM = o.optDouble("elevationMinStepM", c.elevationMinStepM);
            c.autoPauseEnabled = o.optBoolean("autoPauseEnabled", c.autoPauseEnabled);
            return c;
        }
    }

    private static final class Point {
        final double lat;
        final double lng;
        final long t;
        final Double elevation;

        Point(double lat, double lng, long t, Double elevation) {
            this.lat = lat;
            this.lng = lng;
            this.t = t;
            this.elevation = elevation;
        }

        JSONObject toJson() {
            JSONObject o = new JSONObject();
            try {
                o.put("lat", lat);
                o.put("lng", lng);
                o.put("timestamp_utc", Instant.ofEpochMilli(t).toString());
                o.put("t", t);
                if (elevation != null) {
                    o.put("elevacion_m", elevation.doubleValue());
                } else {
                    o.put("elevacion_m", JSONObject.NULL);
                }
            } catch (Exception ignored) {
                // ignore
            }
            return o;
        }

        static Point fromJson(JSONObject o) {
            if (o == null) return null;
            if (!o.has("lat") || !o.has("lng")) return null;
            Double elev = null;
            if (o.has("elevacion_m") && !o.isNull("elevacion_m")) {
                double e = o.optDouble("elevacion_m", Double.NaN);
                if (!Double.isNaN(e)) elev = e;
            }
            return new Point(
                o.optDouble("lat", 0d),
                o.optDouble("lng", 0d),
                o.optLong("t", 0L),
                elev
            );
        }
    }

    private final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
    private final List<Point> points = new ArrayList<>();
    private final List<Point> pendingEmit = new ArrayList<>();
    private final Object clientLock = new Object();

    private Context appContext;
    private volatile FusedLocationProviderClient client;
    private volatile LocationCallback callback;

    private Config config = new Config();
    private String sessionId = "";
    private String title = "";
    private long startedAtMs = 0L;
    private boolean tracking = false;

    private double distanceM = 0d;
    private double elevationGainM = 0d;
    private Double lastElevation = null;
    private Point lastAccepted = null;
    /** Set on resume so the first point after a pause opens a new segment instead of
     *  adding the straight-line distance the user covered while paused. */
    private boolean segmentBreak = false;

    private boolean hasFix = false;
    private Double speedMps = null;
    private Long stationarySince = null;
    private Long movingSince = null;
    private double[] lastMotionPos = null;
    private long lastMotionAt = 0L;

    private boolean paused = false;
    /** "manual" | "auto" | null */
    private String pauseSource = null;
    private long pausedAccumMs = 0L;
    private long pauseStartedAtMs = 0L;

    private long revision = 0L;
    private boolean needsResync = false;
    private long lastPersistAtMs = 0L;

    private CardioTrackRecorder() {}

    // ---------------------------------------------------------------- listeners

    public void addListener(Listener listener) {
        if (listener != null && !listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    public void removeListener(Listener listener) {
        listeners.remove(listener);
    }

    // ------------------------------------------------------------------ control

    /**
     * Starts (or reconfigures) tracking for a session. Restarting with the same session id
     * keeps the accumulated track so a JS remount never loses the route.
     */
    public void start(
        Context context,
        String newSessionId,
        String newTitle,
        long newStartedAtMs,
        Config newConfig
    ) {
        JSONObject payload;
        synchronized (this) {
            appContext = context.getApplicationContext();
            if (newConfig != null) config = newConfig;

            boolean sameSession = sessionId != null
                && !sessionId.isEmpty()
                && sessionId.equals(newSessionId);
            if (!sameSession) {
                restoreOrReset(newSessionId, newStartedAtMs);
            }
            sessionId = newSessionId == null ? "" : newSessionId;
            if (newTitle != null && !newTitle.isEmpty()) title = newTitle;
            if (newStartedAtMs > 0) startedAtMs = newStartedAtMs;
            tracking = true;
            persistLocked(true);
            payload = buildPayload();
        }
        requestUpdates();
        emit(payload);
    }

    /**
     * Called when the service is recreated by START_STICKY: picks the persisted track back up
     * and resumes location updates so a process kill mid-run does not end the recording.
     */
    public boolean resumePersisted(Context context) {
        synchronized (this) {
            appContext = context.getApplicationContext();
            if (tracking) return true;
            if (points.isEmpty() && (sessionId == null || sessionId.isEmpty())) {
                readStateFileLocked();
            }
            if (sessionId == null || sessionId.isEmpty()) return false;
            tracking = true;
        }
        requestUpdates();
        return true;
    }

    public void stop() {
        JSONObject payload;
        synchronized (this) {
            tracking = false;
            hasFix = false;
            speedMps = null;
            stationarySince = null;
            movingSince = null;
            lastMotionPos = null;
            persistLocked(true);
            payload = buildPayload();
        }
        removeUpdates();
        emit(payload);
    }

    public void clear(String forSessionId) {
        JSONObject payload;
        synchronized (this) {
            if (forSessionId != null && !forSessionId.isEmpty()
                && sessionId != null && !sessionId.isEmpty()
                && !forSessionId.equals(sessionId)) {
                return;
            }
            tracking = false;
            resetStateLocked();
            deleteStateFileLocked();
            payload = buildPayload();
        }
        removeUpdates();
        emit(payload);
    }

    public void setPaused(boolean nextPaused, String source) {
        JSONObject payload;
        synchronized (this) {
            applyPausedLocked(nextPaused, source, System.currentTimeMillis());
            persistLocked(true);
            payload = buildPayload();
        }
        emit(payload);
    }

    public void setAutoPauseEnabled(boolean enabled) {
        JSONObject payload;
        synchronized (this) {
            config.autoPauseEnabled = enabled;
            // Disabling mid auto-pause requires a manual resume, same as the TS preference.
            if (!enabled && paused && "auto".equals(pauseSource)) {
                pauseSource = "manual";
            }
            persistLocked(true);
            payload = buildPayload();
        }
        emit(payload);
    }

    public synchronized boolean isTracking() {
        return tracking;
    }

    public synchronized String getSessionId() {
        return sessionId;
    }

    public synchronized String getTitle() {
        return title;
    }

    public synchronized boolean isPaused() {
        return paused;
    }

    public synchronized long getPausedAccumMs() {
        return pausedAccumMs + (paused && pauseStartedAtMs > 0
            ? Math.max(0L, System.currentTimeMillis() - pauseStartedAtMs)
            : 0L);
    }

    public synchronized long getStartedAtMs() {
        return startedAtMs;
    }

    public synchronized double getDistanceM() {
        return distanceM;
    }

    /** Mirrors formatDistanceLabel() in liveSessionNotifications.ts. */
    public static String formatDistanceLabel(double meters) {
        if (Double.isNaN(meters) || Double.isInfinite(meters) || meters <= 0d) return "";
        if (meters < 1000d) return Math.round(meters) + " m";
        return String.format(Locale.US, "%.2f km", meters / 1000d);
    }

    /**
     * Clock-driven half of the auto-pause machine: the idle/moving thresholds are measured
     * in wall time, so they must be re-evaluated even when no fix arrives.
     */
    public void tick() {
        JSONObject payload = null;
        synchronized (this) {
            if (!tracking) return;
            if (evaluateAutoPauseLocked(System.currentTimeMillis())) {
                payload = buildPayload();
            }
        }
        if (payload != null) emit(payload);
    }

    /** Full buffer, used by JS on mount and whenever it returns to the foreground. */
    public JSONObject snapshot() {
        synchronized (this) {
            JSONObject o = baseStateLocked();
            JSONArray arr = new JSONArray();
            for (Point p : points) arr.put(p.toJson());
            try {
                o.put("points", arr);
                o.put("full", true);
                o.put("resync", false);
            } catch (Exception ignored) {
                // ignore
            }
            pendingEmit.clear();
            needsResync = false;
            return o;
        }
    }

    // ------------------------------------------------------------- persistence

    /** Rebuilds in-memory state after a process kill so START_STICKY can resume the track. */
    public void restore(Context context) {
        synchronized (this) {
            appContext = context.getApplicationContext();
            if (!points.isEmpty() || (sessionId != null && !sessionId.isEmpty())) return;
            readStateFileLocked();
        }
    }

    /**
     * Picks up a persisted track when it belongs to the same session (process was killed
     * mid-run); otherwise starts clean.
     */
    private void restoreOrReset(String newSessionId, long newStartedAtMs) {
        resetStateLocked();
        readStateFileLocked();
        boolean restoredMatches = newSessionId != null
            && !newSessionId.isEmpty()
            && newSessionId.equals(sessionId);
        if (!restoredMatches) {
            resetStateLocked();
            deleteStateFileLocked();
            sessionId = newSessionId == null ? "" : newSessionId;
            startedAtMs = newStartedAtMs;
        }
        needsResync = true;
    }

    private void resetStateLocked() {
        points.clear();
        pendingEmit.clear();
        sessionId = "";
        title = "";
        startedAtMs = 0L;
        distanceM = 0d;
        elevationGainM = 0d;
        lastElevation = null;
        lastAccepted = null;
        segmentBreak = false;
        hasFix = false;
        speedMps = null;
        stationarySince = null;
        movingSince = null;
        lastMotionPos = null;
        lastMotionAt = 0L;
        paused = false;
        pauseSource = null;
        pausedAccumMs = 0L;
        pauseStartedAtMs = 0L;
        revision = 0L;
        needsResync = false;
    }

    private File stateFileLocked() {
        if (appContext == null) return null;
        return new File(appContext.getFilesDir(), STATE_FILE);
    }

    private void persistLocked(boolean force) {
        long now = System.currentTimeMillis();
        if (!force && now - lastPersistAtMs < PERSIST_MIN_INTERVAL_MS) return;
        File file = stateFileLocked();
        if (file == null) return;
        lastPersistAtMs = now;

        JSONObject root = new JSONObject();
        try {
            root.put("sessionId", sessionId);
            root.put("title", title);
            root.put("startedAtMs", startedAtMs);
            root.put("distanceM", distanceM);
            root.put("elevationGainM", elevationGainM);
            if (lastElevation != null) root.put("lastElevation", lastElevation.doubleValue());
            root.put("paused", paused);
            if (pauseSource != null) root.put("pauseSource", pauseSource);
            root.put("pausedAccumMs", pausedAccumMs);
            root.put("pauseStartedAtMs", pauseStartedAtMs);
            root.put("revision", revision);
            root.put("config", config.toJson());
            JSONArray arr = new JSONArray();
            for (Point p : points) arr.put(p.toJson());
            root.put("points", arr);
        } catch (Exception e) {
            return;
        }

        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(root.toString().getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) {
            // Losing a snapshot is survivable; the in-memory track is authoritative.
        }
    }

    private void readStateFileLocked() {
        File file = stateFileLocked();
        if (file == null || !file.exists()) return;
        String raw;
        try (InputStream in = new java.io.FileInputStream(file)) {
            java.io.ByteArrayOutputStream sink = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int read;
            while ((read = in.read(buf)) > 0) {
                sink.write(buf, 0, read);
            }
            if (sink.size() == 0) return;
            raw = sink.toString(StandardCharsets.UTF_8.name());
        } catch (IOException e) {
            return;
        }

        try {
            JSONObject root = new JSONObject(raw);
            sessionId = root.optString("sessionId", "");
            title = root.optString("title", "");
            startedAtMs = root.optLong("startedAtMs", 0L);
            distanceM = root.optDouble("distanceM", 0d);
            elevationGainM = root.optDouble("elevationGainM", 0d);
            if (root.has("lastElevation") && !root.isNull("lastElevation")) {
                lastElevation = root.optDouble("lastElevation", Double.NaN);
                if (lastElevation.isNaN()) lastElevation = null;
            }
            paused = root.optBoolean("paused", false);
            String restoredSource = root.optString("pauseSource", "");
            pauseSource = restoredSource.isEmpty() ? null : restoredSource;
            pausedAccumMs = root.optLong("pausedAccumMs", 0L);
            pauseStartedAtMs = root.optLong("pauseStartedAtMs", 0L);
            revision = root.optLong("revision", 0L);
            config = Config.fromJson(root.optJSONObject("config"));

            points.clear();
            JSONArray arr = root.optJSONArray("points");
            if (arr != null) {
                for (int i = 0; i < arr.length(); i++) {
                    Point p = Point.fromJson(arr.optJSONObject(i));
                    if (p != null) points.add(p);
                }
            }
            lastAccepted = points.isEmpty() ? null : points.get(points.size() - 1);
            // The process died mid-run: whatever happened in between is not ours to draw.
            segmentBreak = !points.isEmpty();
            needsResync = true;
        } catch (Exception e) {
            resetStateLocked();
        }
    }

    private void deleteStateFileLocked() {
        File file = stateFileLocked();
        if (file != null && file.exists()) {
            //noinspection ResultOfMethodCallIgnored
            file.delete();
        }
    }

    // ------------------------------------------------------------ location feed

    private boolean hasLocationPermission() {
        if (appContext == null) return false;
        return ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
    }

    @SuppressLint("MissingPermission")
    private void requestUpdates() {
        Context context;
        long intervalMs;
        synchronized (this) {
            if (!tracking) return;
            context = appContext;
            // Sample faster than the accept threshold so the motion machine stays responsive.
            intervalMs = Math.max(1_000L, config.minIntervalMs / 2);
        }
        if (context == null || !hasLocationPermission()) return;

        synchronized (clientLock) {
            if (client == null) {
                client = LocationServices.getFusedLocationProviderClient(context);
            }
            if (callback == null) {
                callback = new LocationCallback() {
                    @Override
                    public void onLocationResult(LocationResult result) {
                        for (Location location : result.getLocations()) {
                            handleLocation(location);
                        }
                    }

                    @Override
                    public void onLocationAvailability(LocationAvailability availability) {
                        if (availability != null && !availability.isLocationAvailable()) {
                            JSONObject payload;
                            synchronized (CardioTrackRecorder.this) {
                                hasFix = false;
                                payload = buildPayload();
                            }
                            emit(payload);
                        }
                    }
                };
            } else {
                try {
                    client.removeLocationUpdates(callback);
                } catch (Throwable ignored) {
                    // ignore
                }
            }

            LocationRequest request =
                new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, intervalMs)
                    .setMinUpdateIntervalMillis(1_000L)
                    .setMinUpdateDistanceMeters(0f)
                    .setWaitForAccurateLocation(false)
                    .build();

            try {
                client.requestLocationUpdates(request, callback, Looper.getMainLooper());
                client.getLastLocation().addOnSuccessListener(location -> {
                    if (location != null) handleLocation(location);
                });
            } catch (Throwable ignored) {
                // Play Services unavailable: nothing to record until it recovers.
            }
        }
    }

    private void removeUpdates() {
        synchronized (clientLock) {
            if (client != null && callback != null) {
                try {
                    client.removeLocationUpdates(callback);
                } catch (Throwable ignored) {
                    // ignore
                }
            }
        }
    }

    private void handleLocation(Location location) {
        if (location == null) return;
        JSONObject payload;
        synchronized (this) {
            if (!tracking) return;

            long now = System.currentTimeMillis();
            double lat = location.getLatitude();
            double lng = location.getLongitude();
            Double accuracy = location.hasAccuracy() ? (double) location.getAccuracy() : null;
            Double deviceSpeed = location.hasSpeed() ? (double) location.getSpeed() : null;

            hasFix = true;
            reduceMotionLocked(lat, lng, now, accuracy, deviceSpeed);

            boolean accepted = false;
            if (!paused && !(accuracy != null && accuracy > config.maxAccuracyM)) {
                accepted = appendPointLocked(lat, lng, now, location);
            }

            boolean pauseChanged = evaluateAutoPauseLocked(now);
            if (!accepted && !pauseChanged) {
                persistLocked(false);
                return;
            }
            persistLocked(pauseChanged);
            payload = buildPayload();
        }
        emit(payload);
    }

    private boolean appendPointLocked(double lat, double lng, long now, Location location) {
        if (lastAccepted != null && !segmentBreak) {
            long dt = now - lastAccepted.t;
            double dM = haversineM(lastAccepted.lat, lastAccepted.lng, lat, lng);
            if (dt < config.minIntervalMs && dM < config.minDeltaM) return false;
        }

        Double elevation = null;
        if (location.hasAltitude()) {
            double alt = location.getAltitude();
            if (!Double.isNaN(alt) && !Double.isInfinite(alt)) elevation = alt;
        }

        Point point = new Point(lat, lng, now, elevation);
        if (lastAccepted != null && !segmentBreak) {
            distanceM += haversineM(lastAccepted.lat, lastAccepted.lng, lat, lng);
        }
        if (elevation != null) {
            if (lastElevation != null && !segmentBreak) {
                double d = elevation - lastElevation;
                if (d >= config.elevationMinStepM) elevationGainM += d;
            }
            lastElevation = elevation;
        }
        segmentBreak = false;

        points.add(point);
        pendingEmit.add(point);
        lastAccepted = point;
        revision++;

        if (points.size() > config.maxPoints) {
            thinPointsLocked();
        }
        return true;
    }

    // -------------------------------------------------------- motion machine

    /** Port of reduceGpsMotion() in cardioGpsMotion.ts. */
    private void reduceMotionLocked(
        double lat,
        double lng,
        long t,
        Double accuracy,
        Double deviceSpeed
    ) {
        if (accuracy != null && accuracy > config.maxAccuracyM) return;

        Double speed = estimateSpeedMps(lat, lng, t, deviceSpeed);
        lastMotionPos = new double[] { lat, lng };
        lastMotionAt = t;

        if (speed == null) {
            speedMps = null;
            return;
        }

        speedMps = speed;
        if (speed < config.idleSpeedMps) {
            if (stationarySince == null) stationarySince = t;
            movingSince = null;
        } else {
            stationarySince = null;
            if (movingSince == null) movingSince = t;
        }
    }

    /** Port of estimateSpeedMps(): trust whichever of path speed / device speed is higher. */
    private Double estimateSpeedMps(double lat, double lng, long t, Double deviceSpeed) {
        Double fromPath = null;
        if (lastMotionPos != null) {
            double dtSec = (t - lastMotionAt) / 1000d;
            if (dtSec > 0) {
                fromPath = haversineM(lastMotionPos[0], lastMotionPos[1], lat, lng) / dtSec;
            }
        }
        Double device = deviceSpeed != null
            && !Double.isNaN(deviceSpeed)
            && !Double.isInfinite(deviceSpeed)
            && deviceSpeed >= 0d
            ? deviceSpeed
            : null;

        if (fromPath == null && device == null) return null;
        if (fromPath == null) return device;
        if (device == null) return fromPath;
        return Math.max(fromPath, device);
    }

    private long stationaryMsLocked(long now) {
        return stationarySince == null ? 0L : Math.max(0L, now - stationarySince);
    }

    private long movingMsLocked(long now) {
        return movingSince == null ? 0L : Math.max(0L, now - movingSince);
    }

    /** Ports shouldAutoPause() / shouldAutoResume(). Returns true when the pause flipped. */
    private boolean evaluateAutoPauseLocked(long now) {
        if (!config.autoPauseEnabled) return false;
        if (startedAtMs <= 0) return false;

        if (!paused) {
            boolean shouldPause = hasFix
                && stationarySince != null
                && now - startedAtMs >= config.startGraceMs
                && stationaryMsLocked(now) >= config.idleBeforePauseMs;
            if (shouldPause) {
                applyPausedLocked(true, "auto", now);
                return true;
            }
            return false;
        }

        boolean shouldResume = "auto".equals(pauseSource)
            && hasFix
            && movingSince != null
            && movingMsLocked(now) >= config.moveBeforeResumeMs;
        if (shouldResume) {
            applyPausedLocked(false, null, now);
            return true;
        }
        return false;
    }

    private void applyPausedLocked(boolean nextPaused, String source, long now) {
        if (nextPaused == paused) {
            if (nextPaused && source != null) pauseSource = source;
            return;
        }
        if (nextPaused) {
            paused = true;
            pauseSource = source == null ? "manual" : source;
            pauseStartedAtMs = now;
        } else {
            if (pauseStartedAtMs > 0) {
                pausedAccumMs += Math.max(0L, now - pauseStartedAtMs);
            }
            pauseStartedAtMs = 0L;
            paused = false;
            pauseSource = null;
            // A resume must not inherit the idle streak that caused the pause, nor charge the
            // distance covered while paused to the track.
            stationarySince = null;
            segmentBreak = true;
        }
    }

    // ------------------------------------------------------------- thinning

    /** Ports thinByMinDistanceM() + limitTrackPoints() from cardioTrackPoints.ts. */
    private void thinPointsLocked() {
        List<Point> thinned = thinByMinDistance(points, config.minSpacingM);
        List<Point> limited = limitPoints(thinned, config.maxPoints);
        points.clear();
        points.addAll(limited);
        lastAccepted = points.isEmpty() ? null : points.get(points.size() - 1);
        pendingEmit.clear();
        needsResync = true;
    }

    private static List<Point> thinByMinDistance(List<Point> input, double minSpacingM) {
        if (input.size() <= 2 || minSpacingM <= 0) return new ArrayList<>(input);
        List<Point> out = new ArrayList<>();
        Point lastKept = input.get(0);
        out.add(lastKept);
        for (int i = 1; i < input.size() - 1; i++) {
            Point p = input.get(i);
            if (haversineM(lastKept.lat, lastKept.lng, p.lat, p.lng) >= minSpacingM) {
                out.add(p);
                lastKept = p;
            }
        }
        Point last = input.get(input.size() - 1);
        if (out.get(out.size() - 1) != last) out.add(last);
        return out;
    }

    private static List<Point> limitPoints(List<Point> input, int maxPoints) {
        if (maxPoints < 2 || input.size() <= maxPoints) return new ArrayList<>(input);

        int lastIdx = input.size() - 1;
        LinkedHashSet<Integer> indices = new LinkedHashSet<>();
        indices.add(0);
        indices.add(lastIdx);
        int middleSlots = maxPoints - 2;
        for (int i = 1; i <= middleSlots; i++) {
            indices.add((int) Math.round((double) i * lastIdx / (middleSlots + 1)));
        }
        for (int i = 1; i < lastIdx && indices.size() < maxPoints; i++) {
            indices.add(i);
        }

        List<Integer> sorted = new ArrayList<>(indices);
        java.util.Collections.sort(sorted);
        List<Point> out = new ArrayList<>(sorted.size());
        for (Iterator<Integer> it = sorted.iterator(); it.hasNext(); ) {
            out.add(input.get(it.next()));
        }
        return out;
    }

    // --------------------------------------------------------------- payloads

    private JSONObject baseStateLocked() {
        long now = System.currentTimeMillis();
        JSONObject o = new JSONObject();
        try {
            o.put("sessionId", sessionId);
            o.put("title", title);
            o.put("tracking", tracking);
            o.put("startedAtMs", startedAtMs);
            o.put("distanceM", distanceM);
            o.put("elevationGainM", elevationGainM);
            o.put("hasFix", hasFix);
            o.put("paused", paused);
            o.put("pauseSource", pauseSource == null ? JSONObject.NULL : pauseSource);
            o.put("pausedAccumMs", pausedAccumMs + (paused && pauseStartedAtMs > 0
                ? Math.max(0L, now - pauseStartedAtMs)
                : 0L));
            o.put("autoPauseEnabled", config.autoPauseEnabled);
            o.put("revision", revision);
            o.put("totalPoints", points.size());

            JSONObject motion = new JSONObject();
            motion.put("speedMps", speedMps == null ? JSONObject.NULL : speedMps.doubleValue());
            motion.put("isStationary", stationarySince != null);
            motion.put("isMoving", movingSince != null);
            motion.put("stationaryMs", stationaryMsLocked(now));
            motion.put("movingMs", movingMsLocked(now));
            o.put("motion", motion);
        } catch (Exception ignored) {
            // ignore
        }
        return o;
    }

    /**
     * Delta payload: only the points appended since the last emit. When the buffer was
     * thinned the indices no longer line up, so JS is told to pull a full snapshot.
     */
    private JSONObject buildPayload() {
        JSONObject o = baseStateLocked();
        JSONArray arr = new JSONArray();
        for (Point p : pendingEmit) arr.put(p.toJson());
        try {
            o.put("points", arr);
            o.put("full", false);
            o.put("resync", needsResync);
        } catch (Exception ignored) {
            // ignore
        }
        pendingEmit.clear();
        needsResync = false;
        return o;
    }

    private void emit(JSONObject payload) {
        if (payload == null) return;
        for (Listener listener : listeners) {
            try {
                listener.onCardioTrackUpdate(payload);
            } catch (Throwable ignored) {
                // A dead bridge must not break recording.
            }
        }
    }

    // ----------------------------------------------------------------- helpers

    /** Same formula as haversineM() in cardioGpsMotion.ts. */
    static double haversineM(double lat1, double lng1, double lat2, double lng2) {
        double r = 6371000d;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a1 = Math.toRadians(lat1);
        double a2 = Math.toRadians(lat2);
        double s = Math.pow(Math.sin(dLat / 2), 2)
            + Math.cos(a1) * Math.cos(a2) * Math.pow(Math.sin(dLng / 2), 2);
        return 2 * r * Math.atan2(Math.sqrt(s), Math.sqrt(Math.max(0d, 1 - s)));
    }
}
