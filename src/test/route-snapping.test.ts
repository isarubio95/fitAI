import { afterEach, describe, expect, it, vi } from "vitest";
import { snapProfileForDiscipline, snapRouteLeg } from "@/lib/routeSnapping";

const FROM = { lat: 40.4168, lng: -3.7038 };
const TO = { lat: 40.42, lng: -3.7 };

function geojsonResponse(coordinates: number[][]) {
  return {
    ok: true,
    text: async () =>
      JSON.stringify({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "LineString", coordinates } }],
      }),
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("snapProfileForDiscipline", () => {
  it("bici y a pie tienen perfil propio", () => {
    expect(snapProfileForDiscipline("cycling")).toBe("bike");
    expect(snapProfileForDiscipline("running")).toBe("foot");
    expect(snapProfileForDiscipline("walking")).toBe("foot");
  });

  it("sin caminos en agua", () => {
    expect(snapProfileForDiscipline("rowing")).toBeNull();
    expect(snapProfileForDiscipline("swimming")).toBeNull();
  });

  it("sin disciplina elegida asume a pie", () => {
    expect(snapProfileForDiscipline(null)).toBe("foot");
    expect(snapProfileForDiscipline(undefined)).toBe("foot");
    expect(snapProfileForDiscipline("other")).toBeNull();
  });
});

describe("snapRouteLeg", () => {
  it("convierte lng,lat,ele en puntos con altitud", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        geojsonResponse([
          [-3.7038, 40.4168, 648],
          [-3.702, 40.418, 650],
          [-3.7, 40.42],
        ]),
      ),
    );

    const points = await snapRouteLeg(FROM, TO, "foot");
    expect(points).toEqual([
      { lat: 40.4168, lng: -3.7038, elevacion_m: 648 },
      { lat: 40.418, lng: -3.702, elevacion_m: 650 },
      { lat: 40.42, lng: -3.7, elevacion_m: null },
    ]);
  });

  it("pide el perfil correspondiente", async () => {
    const fetchMock = vi.fn(async () =>
      geojsonResponse([
        [-3.7038, 40.4168],
        [-3.7, 40.42],
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await snapRouteLeg(FROM, TO, "bike");
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("profile=trekking");
    expect(url).toContain("lonlats=-3.703800%2C40.416800%7C-3.700000%2C40.420000");
  });

  it("null si BRouter responde texto de error con 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, text: async () => "target island detected" }) as Response),
    );
    expect(await snapRouteLeg(FROM, TO, "foot")).toBeNull();
  });

  it("null si el servicio falla", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    expect(await snapRouteLeg(FROM, TO, "foot")).toBeNull();
  });

  it("null si la respuesta no trae una línea utilizable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => geojsonResponse([[-3.7038, 40.4168]])),
    );
    expect(await snapRouteLeg(FROM, TO, "foot")).toBeNull();
  });

  it("no llama al servicio para tramos larguísimos", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await snapRouteLeg(FROM, { lat: 51.5, lng: -0.12 }, "foot")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
