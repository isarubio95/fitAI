import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY_ROUTE_DRAFT,
  appendWaypoint,
  draftDistanceM,
  draftElevationGainM,
  draftPolyline,
  draftStorablePoints,
  legsTouchingWaypoint,
  loopClosingPoint,
  moveWaypoint,
  removeLastWaypoint,
  removeWaypoint,
  setLegPoints,
  unsnapAllLegs,
  type DraftPoint,
  type RouteDraft,
  type RouteLeg,
} from "@/lib/routeDraft";
import { snapRouteLeg, type SnapProfile, type SnapSurface } from "@/lib/routeSnapping";

export type UseRouteDraftResult = {
  draft: RouteDraft;
  /** Polilínea a dibujar en el mapa. */
  path: DraftPoint[];
  waypoints: DraftPoint[];
  distanceM: number;
  elevationGainM: number;
  /** Puntos a guardar (sin coordenadas repetidas). */
  storablePoints: DraftPoint[];
  /** Hay tramos esperando respuesta del enrutador. */
  routing: boolean;
  snapEnabled: boolean;
  /** Preferencia de superficie al ajustar a caminos. */
  surfacePreference: SnapSurface;
  /** El enrutador no respondió y el tramo quedó recto. */
  snapUnavailable: boolean;
  canUndo: boolean;
  canCloseLoop: boolean;
  addPoint: (point: DraftPoint) => void;
  moveWaypointTo: (index: number, point: DraftPoint) => void;
  removeWaypointAt: (index: number) => void;
  undo: () => void;
  clear: () => void;
  closeLoop: () => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSurfacePreference: (surface: SnapSurface) => void;
};

/**
 * Trazado manual de una ruta sobre el mapa. Cada tramo nuevo se pinta recto al
 * instante y se sustituye por el camino real cuando responde el enrutador.
 */
export function useRouteDraft(profile: SnapProfile | null): UseRouteDraftResult {
  const [draft, setDraft] = useState<RouteDraft>(EMPTY_ROUTE_DRAFT);
  const [snapEnabled, setSnapEnabledState] = useState(true);
  const [surfacePreference, setSurfacePreferenceState] = useState<SnapSurface>("any");
  const [routingCount, setRoutingCount] = useState(0);
  const [snapUnavailable, setSnapUnavailable] = useState(false);

  const draftRef = useRef(draft);
  const snapEnabledRef = useRef(snapEnabled);
  const surfaceRef = useRef(surfacePreference);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const commit = useCallback((next: RouteDraft) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const abortPending = useCallback(() => {
    for (const controller of controllersRef.current) controller.abort();
    controllersRef.current.clear();
    setRoutingCount(0);
  }, []);

  useEffect(() => abortPending, [abortPending]);

  const snapLeg = useCallback(
    async (leg: RouteLeg) => {
      const activeProfile = profileRef.current;
      if (!snapEnabledRef.current || !activeProfile) return;

      const controller = new AbortController();
      controllersRef.current.add(controller);
      setRoutingCount((n) => n + 1);

      try {
        const snapped = await snapRouteLeg(
          leg.from,
          leg.to,
          activeProfile,
          controller.signal,
          surfaceRef.current,
        );
        if (controller.signal.aborted) return;

        if (!snapped) {
          setSnapUnavailable(true);
          return;
        }

        // Si el tramo ya no existe, `setLegPoints` devuelve el draft intacto.
        const next = setLegPoints(draftRef.current, leg.id, snapped);
        if (next !== draftRef.current) {
          commit(next);
          setSnapUnavailable(false);
        }
      } finally {
        controllersRef.current.delete(controller);
        setRoutingCount((n) => Math.max(0, n - 1));
      }
    },
    [commit],
  );

  const resnapAllLegs = useCallback(() => {
    abortPending();
    setSnapUnavailable(false);
    const reset = unsnapAllLegs(draftRef.current);
    commit(reset);
    for (const leg of draftRef.current.legs) {
      void snapLeg(leg);
    }
  }, [abortPending, commit, snapLeg]);

  const addPoint = useCallback(
    (point: DraftPoint) => {
      const next = appendWaypoint(draftRef.current, point);
      commit(next);
      const created = next.legs[next.legs.length - 1];
      if (created) void snapLeg(created);
    },
    [commit, snapLeg],
  );

  const moveWaypointTo = useCallback(
    (index: number, point: DraftPoint) => {
      const next = moveWaypoint(draftRef.current, index, point);
      if (next === draftRef.current) return;
      commit(next);
      for (const leg of legsTouchingWaypoint(next, index)) void snapLeg(leg);
    },
    [commit, snapLeg],
  );

  const removeWaypointAt = useCallback(
    (index: number) => {
      const prev = draftRef.current;
      const next = removeWaypoint(prev, index);
      if (next === prev) return;
      commit(next);

      // Punto intermedio: el tramo nuevo que une vecinos está en index - 1.
      if (index > 0 && index < prev.waypoints.length - 1) {
        const bridged = next.legs[index - 1];
        if (bridged) void snapLeg(bridged);
      }
    },
    [commit, snapLeg],
  );

  const undo = useCallback(() => {
    commit(removeLastWaypoint(draftRef.current));
  }, [commit]);

  const clear = useCallback(() => {
    abortPending();
    setSnapUnavailable(false);
    commit(EMPTY_ROUTE_DRAFT);
  }, [abortPending, commit]);

  const closeLoop = useCallback(() => {
    const closing = loopClosingPoint(draftRef.current);
    if (closing) addPoint(closing);
  }, [addPoint]);

  const setSnapEnabled = useCallback(
    (enabled: boolean) => {
      snapEnabledRef.current = enabled;
      setSnapEnabledState(enabled);
      abortPending();
      setSnapUnavailable(false);

      if (!enabled) {
        commit(unsnapAllLegs(draftRef.current));
        return;
      }
      for (const leg of draftRef.current.legs) {
        if (!leg.snapped) void snapLeg(leg);
      }
    },
    [abortPending, commit, snapLeg],
  );

  const setSurfacePreference = useCallback(
    (surface: SnapSurface) => {
      if (surface === surfaceRef.current) return;
      surfaceRef.current = surface;
      setSurfacePreferenceState(surface);
      if (!snapEnabledRef.current || !profileRef.current) return;
      if (draftRef.current.legs.length === 0) return;
      resnapAllLegs();
    },
    [resnapAllLegs],
  );

  const path = useMemo(() => draftPolyline(draft), [draft]);
  const storablePoints = useMemo(() => draftStorablePoints(draft), [draft]);

  return {
    draft,
    path,
    waypoints: draft.waypoints,
    distanceM: useMemo(() => draftDistanceM(draft), [draft]),
    elevationGainM: useMemo(() => draftElevationGainM(draft), [draft]),
    storablePoints,
    routing: routingCount > 0,
    snapEnabled,
    surfacePreference,
    snapUnavailable,
    canUndo: draft.waypoints.length > 0,
    canCloseLoop: loopClosingPoint(draft) != null,
    addPoint,
    moveWaypointTo,
    removeWaypointAt,
    undo,
    clear,
    closeLoop,
    setSnapEnabled,
    setSurfacePreference,
  };
}
