import { describe, expect, it } from "vitest";
import {
  getRouteThumbSnapshot,
  routeThumbCacheKey,
  setRouteThumbSnapshot,
} from "@/lib/routeMapThumbCache";

describe("routeMapThumbCache", () => {
  it("stores and retrieves snapshots by route key", () => {
    const key = routeThumbCacheKey([
      { lat: 42.1, lng: -2.1 },
      { lat: 42.2, lng: -2.0 },
      { lat: 42.3, lng: -1.9 },
    ]);
    expect(getRouteThumbSnapshot(key)).toBeUndefined();
    setRouteThumbSnapshot(key, "data:image/jpeg;base64,abc");
    expect(getRouteThumbSnapshot(key)).toBe("data:image/jpeg;base64,abc");
  });
});
