import { describe, expect, it } from "vitest";
import {
  ACTIVITY_COMMENT_MAX_LENGTH,
  normalizeActivityCommentText,
} from "@/lib/activitySocial";

describe("normalizeActivityCommentText", () => {
  it("recorta espacios y acepta texto válido", () => {
    expect(normalizeActivityCommentText("  buen entreno  ")).toBe("buen entreno");
  });

  it("rechaza vacío o solo espacios", () => {
    expect(normalizeActivityCommentText("")).toBeNull();
    expect(normalizeActivityCommentText("   ")).toBeNull();
  });

  it("rechaza textos demasiado largos", () => {
    const tooLong = "a".repeat(ACTIVITY_COMMENT_MAX_LENGTH + 1);
    expect(normalizeActivityCommentText(tooLong)).toBeNull();
  });

  it("acepta exactamente el máximo de caracteres", () => {
    const exact = "b".repeat(ACTIVITY_COMMENT_MAX_LENGTH);
    expect(normalizeActivityCommentText(exact)).toBe(exact);
  });
});
