import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockUseMountAfterPaint,
  mockUseProfileActivityHistory,
  mockUseAuth,
} = vi.hoisted(() => ({
  mockUseMountAfterPaint: vi.fn(),
  mockUseProfileActivityHistory: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock("@/hooks/useMountAfterPaint", () => ({
  useMountAfterPaint: mockUseMountAfterPaint,
}));

vi.mock("@/hooks/useProfileActivityHistory", () => ({
  useProfileActivityHistory: mockUseProfileActivityHistory,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/components/layout/ProfileDrawer", () => ({
  useProfileDrawer: () => ({
    openMyProfile: vi.fn(),
    openUserProfile: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({ data: { username: "isa", avatar_url: null } }),
  };
});

vi.mock("@/hooks/useActivityLikes", () => ({
  useActivityLikes: () => ({
    likeCounts: {},
    likedIds: new Set(),
    toggleLike: vi.fn(),
    isToggling: new Set(),
  }),
}));

vi.mock("@/hooks/useActivityComments", () => ({
  useActivityCommentCounts: () => ({ commentCounts: {}, commentedIds: new Set() }),
}));

vi.mock("@/hooks/useCardioSessionLikes", () => ({
  useCardioSessionLikes: () => ({
    likeCounts: {},
    likedIds: new Set(),
    toggleLike: vi.fn(),
    isToggling: new Set(),
  }),
}));

vi.mock("@/hooks/useCardioSessionComments", () => ({
  useCardioSessionCommentCounts: () => ({ commentCounts: {}, commentedIds: new Set() }),
}));

vi.mock("@/components/dashboard/WorkoutFeedCard", () => ({
  WorkoutFeedCard: ({ workout }: { workout: { titulo: string } }) => <article>{workout.titulo}</article>,
}));

vi.mock("@/components/cardio/CardioFeedCard", () => ({
  CardioFeedCard: ({ session }: { session: { titulo: string } }) => <article>{session.titulo}</article>,
}));

vi.mock("@/components/dashboard/WorkoutDetailsSheet", () => ({
  WorkoutDetailsSheet: () => null,
}));

vi.mock("@/components/cardio/CardioDetailsSheet", () => ({
  CardioDetailsSheet: () => null,
}));

import YouActivities from "@/pages/YouActivities";

const CACHED_GYM = {
  type: "gym" as const,
  fecha: "2026-08-01",
  workout: {
    id: "w1",
    titulo: "Press banca",
    es_publica: false,
  },
};

describe("YouActivities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "user-1", email: "a@b.c" } });
    mockUseProfileActivityHistory.mockReturnValue({
      items: [CACHED_GYM],
      isLoading: false,
    });
  });

  it("muestra skeleton en el primer pintado aunque el historial ya esté en caché", () => {
    mockUseMountAfterPaint.mockReturnValue(false);

    render(<YouActivities />);

    expect(screen.getByLabelText("Cargando actividades")).toBeInTheDocument();
    expect(screen.queryByText("Press banca")).not.toBeInTheDocument();
  });

  it("muestra las tarjetas cuando el panel ya se ha pintado y hay datos", () => {
    mockUseMountAfterPaint.mockReturnValue(true);

    render(<YouActivities />);

    expect(screen.queryByLabelText("Cargando actividades")).not.toBeInTheDocument();
    expect(screen.getByText("Press banca")).toBeInTheDocument();
  });
});
