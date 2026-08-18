import { describe, expect, it } from "vitest";
import {
  COMMUNITY_PUBLISH_HINT_ON,
  communityFeedAuthorIds,
  communityFeedEmptyMessage,
} from "@/lib/communityFeedVisibility";

describe("communityFeedAuthorIds", () => {
  it("devuelve vacío si no hay follows", () => {
    expect(communityFeedAuthorIds([], "me")).toEqual([]);
    expect(communityFeedAuthorIds(new Set(), "me")).toEqual([]);
  });

  it("excluye al propio usuario y ordena", () => {
    expect(communityFeedAuthorIds(["c", "me", "a"], "me")).toEqual(["a", "c"]);
  });
});

describe("communityFeedEmptyMessage", () => {
  it("pide seguir a alguien si no hay follows", () => {
    expect(communityFeedEmptyMessage(0)).toBe("Sigue a alguien para ver sus entrenos aquí.");
  });

  it("explica que los seguidos aún no han publicado", () => {
    expect(communityFeedEmptyMessage(2)).toBe(
      "Las personas que sigues aún no han publicado entrenos.",
    );
  });
});

describe("COMMUNITY_PUBLISH_HINT_ON", () => {
  it("habla de seguidores, no de un feed global", () => {
    expect(COMMUNITY_PUBLISH_HINT_ON).toMatch(/sigan/);
    expect(COMMUNITY_PUBLISH_HINT_ON).not.toMatch(/público/);
  });
});
