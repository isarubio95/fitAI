import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockToggleFollow } = vi.hoisted(() => ({
  mockToggleFollow: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));

vi.mock("@/hooks/useFollows", () => ({
  useFollows: () => ({
    followingIds: new Set<string>(),
    toggleFollow: mockToggleFollow,
    isToggling: new Set<string>(),
    isFetched: true,
  }),
}));

import { FollowButton } from "@/components/community/FollowButton";

describe("FollowButton", () => {
  beforeEach(() => {
    mockToggleFollow.mockReset();
    mockToggleFollow.mockResolvedValue(undefined);
  });

  it("no se renderiza en el perfil propio", () => {
    const { container } = render(<FollowButton userId="me" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("sigue a otra persona", () => {
    render(<FollowButton userId="other" />);

    fireEvent.click(screen.getByRole("button", { name: "Seguir" }));
    expect(mockToggleFollow).toHaveBeenCalledWith("other");
  });
});
