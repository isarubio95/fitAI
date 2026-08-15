import { describe, expect, it } from "vitest";
import {
  buildRouteThumbGeometry,
  downsampleRoutePoints,
} from "@/lib/routeMapThumb";
import { filterPredefinedByDiscipline } from "@/lib/predefinedCardioRoutes";
import { usePagedWindow } from "@/hooks/usePagedWindow";
import { renderHook, act } from "@testing-library/react";

describe("routeMapThumb", () => {
  it("downsamples keeping endpoints", () => {
    const points = Array.from({ length: 200 }, (_, i) => ({ lat: i / 100, lng: i / 50 }));
    const out = downsampleRoutePoints(points, 10);
    expect(out).toHaveLength(10);
    expect(out[0]).toEqual(points[0]);
    expect(out[out.length - 1]).toEqual(points[points.length - 1]);
  });

  it("builds an svg path from a polyline", () => {
    const geo = buildRouteThumbGeometry([
      { lat: 42.4, lng: -2.5 },
      { lat: 42.5, lng: -2.4 },
      { lat: 42.45, lng: -2.3 },
    ]);
    expect(geo).not.toBeNull();
    expect(geo!.pathD.startsWith("M")).toBe(true);
    expect(geo!.pathD.includes(" L")).toBe(true);
    expect(geo!.start).toBeTruthy();
    expect(geo!.end).toBeTruthy();
  });
});

describe("filterPredefinedByDiscipline", () => {
  const tours = [
    {
      id: "1",
      discoverId: "1",
      name: "A",
      sport: "jogging",
      distanceM: 5000,
      elevationUpM: 100,
      visitors: 10,
      ratingScore: 4,
      difficulty: null,
      gpx: "gpx/a.gpx",
      popularityRank: 1,
      url: null,
    },
    {
      id: "2",
      discoverId: "2",
      name: "B",
      sport: "jogging",
      distanceM: 8000,
      elevationUpM: 200,
      visitors: 50,
      ratingScore: 5,
      difficulty: null,
      gpx: "gpx/b.gpx",
      popularityRank: 2,
      url: null,
    },
    {
      id: "3",
      discoverId: "3",
      name: "C",
      sport: "hike",
      distanceM: 10000,
      elevationUpM: 300,
      visitors: 100,
      ratingScore: 5,
      difficulty: null,
      gpx: "gpx/c.gpx",
      popularityRank: 3,
      url: null,
    },
  ] as const;

  it("returns all matching sports when limit is omitted", () => {
    const out = filterPredefinedByDiscipline([...tours], "running");
    expect(out.map((t) => t.id)).toEqual(["2", "1"]);
  });

  it("respects an explicit limit", () => {
    const out = filterPredefinedByDiscipline([...tours], "running", 1);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("2");
  });
});

describe("usePagedWindow", () => {
  it("reveals items in pages of 10", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { result, rerender } = renderHook(
      ({ list }) => usePagedWindow(list, { pageSize: 10, resetKey: "a" }),
      { initialProps: { list: items } },
    );

    expect(result.current.visible).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(20);

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);

    rerender({ list: items });
  });
});
