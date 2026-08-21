import { describe, expect, it } from "vitest";
import {
  computeRouteProgress,
  MAX_BACKTRACK_M,
  ON_ROUTE_MAX_M,
  polylineLengthM,
  resolveRecordedDistanceM,
} from "@/lib/cardioRouteProgress";
import { haversineM } from "@/lib/cardioGpsMotion";

describe("cardioRouteProgress", () => {
  const route = [
    { lat: 40.0, lng: -3.0 },
    { lat: 40.001, lng: -3.0 },
    { lat: 40.002, lng: -3.0 },
  ];

  it("calcula longitud de polilínea", () => {
    const len = polylineLengthM(route);
    expect(len).toBeGreaterThan(200);
    expect(len).toBeLessThan(250);
  });

  it("resuelve distancia 0 en vivo con la polilínea de los puntos", () => {
    expect(resolveRecordedDistanceM(0, route)).toBeGreaterThan(200);
    expect(resolveRecordedDistanceM(null, route)).toBeGreaterThan(200);
    expect(resolveRecordedDistanceM(1500, route)).toBe(1500);
  });

  it("progreso 0 sin posición", () => {
    const p = computeRouteProgress(route, null);
    expect(p).not.toBeNull();
    expect(p!.percent).toBe(0);
    expect(p!.remainingM).toBeCloseTo(p!.totalM, 0);
  });

  it("progreso cerca del final", () => {
    const p = computeRouteProgress(route, { lat: 40.002, lng: -3.0 });
    expect(p).not.toBeNull();
    expect(p!.percent).toBeGreaterThan(90);
    expect(p!.remainingM).toBeLessThan(20);
  });

  it("progreso a mitad del primer tramo", () => {
    const mid = { lat: 40.0005, lng: -3.0 };
    const p = computeRouteProgress(route, mid);
    expect(p).not.toBeNull();
    expect(p!.percent).toBeGreaterThan(10);
    expect(p!.percent).toBeLessThan(40);
  });

  /**
   * Ida ~1 km al norte + retorno paralelo ~20 m al oeste.
   * Sin estado, un GPS cerca del retorno engancha el tramo de vuelta.
   */
  function buildOutAndBack() {
    const lat0 = 40.0;
    const lngOut = -3.0;
    // ~20 m al oeste a lat 40°
    const lngRet = lngOut - 20 / (111_320 * Math.cos((lat0 * Math.PI) / 180));
    const lat1 = lat0 + 1000 / 111_320;
    return [
      { lat: lat0, lng: lngOut },
      { lat: lat1, lng: lngOut },
      { lat: lat1, lng: lngRet },
      { lat: lat0, lng: lngRet },
    ];
  }

  it("ida-vuelta: con estado no salta al retorno paralelo", () => {
    const outAndBack = buildOutAndBack();
    const total = polylineLengthM(outAndBack);
    expect(total).toBeGreaterThan(2000);
    expect(total).toBeLessThan(2100);

    // ~800 m en la ida
    const prevAlong = 800;
    const latAt800 = 40.0 + 800 / 111_320;
    // GPS 15 m hacia el retorno (más cerca del retorno que de la ida)
    const lngShift = 15 / (111_320 * Math.cos((40.0 * Math.PI) / 180));
    const gps = { lat: latAt800, lng: -3.0 - lngShift };

    const withoutState = computeRouteProgress(outAndBack, gps);
    expect(withoutState).not.toBeNull();
    // Sin memoria engancha el retorno (along >> 1000)
    expect(withoutState!.alongM).toBeGreaterThan(1000);

    const withState = computeRouteProgress(outAndBack, gps, { previousAlongM: prevAlong });
    expect(withState).not.toBeNull();
    expect(withState!.alongM).toBeGreaterThan(prevAlong - MAX_BACKTRACK_M - 1);
    expect(withState!.alongM).toBeLessThan(950);
    expect(withState!.remainingM).toBeGreaterThan(total - 950);
  });

  it("ida-vuelta: en el retorno no retrocede a la ida paralela", () => {
    const outAndBack = buildOutAndBack();
    const total = polylineLengthM(outAndBack);
    const crossM = haversineM(outAndBack[1], outAndBack[2]);
    const outM = haversineM(outAndBack[0], outAndBack[1]);
    // ~1800 m = bien entrados en el retorno hacia el sur
    const prevAlong = 1800;
    const alongOnReturn = prevAlong - (outM + crossM);
    const fracDown = alongOnReturn / outM;
    const lat1 = outAndBack[1].lat;
    const lat0 = outAndBack[0].lat;
    const gpsLat = lat1 + (lat0 - lat1) * fracDown;
    // Empujar hacia la ida (este): geométricamente más cerca del outbound
    const lngShift = 15 / (111_320 * Math.cos((40.0 * Math.PI) / 180));
    const gps = { lat: gpsLat, lng: outAndBack[3].lng + lngShift };

    const withoutState = computeRouteProgress(outAndBack, gps);
    expect(withoutState!.alongM).toBeLessThan(500);

    const withState = computeRouteProgress(outAndBack, gps, { previousAlongM: prevAlong });
    expect(withState!.alongM).toBeGreaterThan(prevAlong - MAX_BACKTRACK_M - 1);
    expect(withState!.remainingM).toBeLessThan(total - (prevAlong - MAX_BACKTRACK_M) + 1);
  });

  it("circular: cerca del final no resetea al inicio", () => {
    const lat0 = 40.0;
    const lng0 = -3.0;
    const d = 500 / 111_320;
    const circular = [
      { lat: lat0, lng: lng0 },
      { lat: lat0 + d, lng: lng0 },
      { lat: lat0 + d, lng: lng0 + d },
      { lat: lat0, lng: lng0 + d },
      { lat: lat0, lng: lng0 },
    ];
    const total = polylineLengthM(circular);
    const prevAlong = total - 30;
    // GPS casi en el inicio/cierre
    const gps = { lat: lat0 + 0.00002, lng: lng0 + 0.00002 };

    const withoutState = computeRouteProgress(circular, gps);
    expect(withoutState!.alongM).toBeLessThan(80);

    const withState = computeRouteProgress(circular, gps, { previousAlongM: prevAlong });
    expect(withState!.alongM).toBeGreaterThan(total - 80);
    expect(withState!.percent).toBeGreaterThan(90);
  });

  it("monotonía: secuencia a lo largo de la ruta no retrocede más de MAX_BACKTRACK_M", () => {
    let prev: number | null = null;
    const positions = [
      { lat: 40.0, lng: -3.0 },
      { lat: 40.0004, lng: -3.0 },
      { lat: 40.0008, lng: -3.0 },
      { lat: 40.0012, lng: -3.0 },
      { lat: 40.0016, lng: -3.0 },
      { lat: 40.002, lng: -3.0 },
    ];
    let lastAlong = 0;
    for (const pos of positions) {
      const p = computeRouteProgress(route, pos, { previousAlongM: prev });
      expect(p).not.toBeNull();
      expect(p!.alongM).toBeGreaterThanOrEqual(lastAlong - MAX_BACKTRACK_M);
      lastAlong = p!.alongM;
      prev = p!.alongM;
    }
    expect(lastAlong).toBeGreaterThan(200);
  });

  it("dentro del margen (25 m) avanza progreso", () => {
    const mid = { lat: 40.0005, lng: -3.0 };
    const boot = computeRouteProgress(route, mid);
    expect(boot).not.toBeNull();

    const lngShift = 25 / (111_320 * Math.cos((40.0 * Math.PI) / 180));
    const offset = { lat: 40.0012, lng: -3.0 + lngShift };
    const p = computeRouteProgress(route, offset, { previousAlongM: boot!.alongM });
    expect(p).not.toBeNull();
    expect(p!.offRouteM).toBeLessThanOrEqual(ON_ROUTE_MAX_M);
    expect(p!.alongM).toBeGreaterThan(boot!.alongM - MAX_BACKTRACK_M);
    expect(p!.alongM).toBeGreaterThan(100);
  });

  it("off-route fuerte congela alongM", () => {
    const mid = { lat: 40.001, lng: -3.0 };
    const boot = computeRouteProgress(route, mid);
    expect(boot).not.toBeNull();
    const prev = boot!.alongM;

    const lngShift = 120 / (111_320 * Math.cos((40.0 * Math.PI) / 180));
    const far = { lat: 40.001, lng: -3.0 + lngShift };
    const p = computeRouteProgress(route, far, { previousAlongM: prev });
    expect(p).not.toBeNull();
    expect(p!.alongM).toBeCloseTo(prev, 0);
    expect(p!.offRouteM).toBeGreaterThan(ON_ROUTE_MAX_M);
  });

  it("sin posición pero con previousAlongM conserva progreso", () => {
    const p = computeRouteProgress(route, null, { previousAlongM: 100 });
    expect(p).not.toBeNull();
    expect(p!.alongM).toBe(100);
    expect(p!.remainingM).toBeCloseTo(p!.totalM - 100, 0);
  });
});
