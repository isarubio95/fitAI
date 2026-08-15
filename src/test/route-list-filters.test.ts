import { describe, expect, it } from "vitest";
import {
  applyRouteListFilters,
  DEFAULT_ROUTE_LIST_FILTERS,
  matchesDistanceBucket,
} from "@/lib/routeListFilters";

describe("routeListFilters", () => {
  it("matches distance buckets", () => {
    expect(matchesDistanceBucket(5_000, "short")).toBe(true);
    expect(matchesDistanceBucket(15_000, "medium")).toBe(true);
    expect(matchesDistanceBucket(40_000, "long")).toBe(true);
    expect(matchesDistanceBucket(60_000, "xl")).toBe(true);
    expect(matchesDistanceBucket(15_000, "short")).toBe(false);
  });

  it("filters by name, difficulty and sorts by distance", () => {
    const items = [
      {
        name: "Circular Ezcaray",
        distanceM: 12_000,
        elevationUpM: 400,
        difficulty: "moderate",
        visitors: 10,
      },
      {
        name: "Panorama Sansol",
        distanceM: 30_000,
        elevationUpM: 600,
        difficulty: "difficult",
        visitors: 50,
      },
      {
        name: "Paseo corto",
        distanceM: 6_000,
        elevationUpM: 50,
        difficulty: "easy",
        visitors: 5,
      },
    ];

    const filtered = applyRouteListFilters(
      items,
      {
        ...DEFAULT_ROUTE_LIST_FILTERS,
        q: "sansol",
        difficulty: "difficult",
        sort: "distance_desc",
      },
      { useDifficulty: true },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Panorama Sansol");
  });
});
