import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";

vi.mock("@/components/community/ActivitySocialActions", () => ({
  ActivitySocialActions: () => <div>acciones-sociales</div>,
}));

vi.mock("@/components/cardio/CardioStartMetaRow", () => ({
  CardioStartMetaRow: () => <div>meta</div>,
}));

import { CardioFeedCard } from "@/components/cardio/CardioFeedCard";

function session(overrides: Partial<CardioSesionWithDetails> = {}): CardioSesionWithDetails {
  return {
    id: "s1",
    usuario_id: "u1",
    titulo: "Ciclismo de mañana",
    fecha_inicio: "2026-08-16T09:02:00.000Z",
    fecha_fin: "2026-08-16T11:39:00.000Z",
    comentarios: null,
    es_publica: false,
    rpe: null,
    cardio_disciplina_id: null,
    created_at: "2026-08-16T09:02:00.000Z",
    cardio_track: null,
    ...overrides,
  };
}

const social = {
  likeCount: 2,
  liked: false,
  commentCount: 1,
  commented: false,
  onToggleLike: vi.fn(),
  isTogglingLike: false,
};

describe("CardioFeedCard", () => {
  it("muestra like, comentar y compartir cuando el padre inyecta social", () => {
    render(
      <CardioFeedCard
        session={session({ es_publica: false })}
        author={{ id: "u1", username: "isarubio95", avatar_url: null }}
        onSelectSession={() => undefined}
        social={social}
      />,
    );

    expect(screen.getByText("Ciclismo de mañana")).toBeInTheDocument();
    expect(screen.getByText("acciones-sociales")).toBeInTheDocument();
  });

  it("oculta las acciones si el padre no pasa social", () => {
    render(
      <CardioFeedCard
        session={session({ es_publica: true })}
        onSelectSession={() => undefined}
      />,
    );

    expect(screen.queryByText("acciones-sociales")).not.toBeInTheDocument();
  });
});
