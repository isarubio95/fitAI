import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSignOut,
  mockGetSession,
  mockOnAuthStateChange,
  mockUnsubscribe,
} = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));
let authListener: ((event: string, session: any) => void) | null = null;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

import { AuthProvider, useAuth } from "@/hooks/useAuth";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authListener = null;
    mockOnAuthStateChange.mockImplementation((cb: typeof authListener) => {
      authListener = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
  });

  it("carga la sesion inicial y actualiza el contexto", async () => {
    const session = { user: { id: "user-1", email: "u@test.com" } };
    mockGetSession.mockResolvedValue({ data: { session } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("user-1");
    expect(result.current.session).toEqual(session);
  });

  it("reacciona a cambios de auth y permite signOut", async () => {
    const initialSession = { user: { id: "user-2", email: "a@test.com" } };
    mockGetSession.mockResolvedValue({ data: { session: initialSession } });
    mockSignOut.mockResolvedValue({ error: null });

    const { result, unmount } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      authListener?.("SIGNED_OUT", null);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();

    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});

