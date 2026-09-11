import { describe, expect, it } from "vitest";
import { profileHasUsername } from "@/hooks/useProfileSetup";

describe("profileHasUsername", () => {
  it("solo cuenta un nick recortable", () => {
    expect(profileHasUsername(undefined)).toBe(false);
    expect(profileHasUsername(null)).toBe(false);
    expect(profileHasUsername({ username: null })).toBe(false);
    expect(profileHasUsername({ username: "   " })).toBe(false);
    expect(profileHasUsername({ username: "isa" })).toBe(true);
  });
});
