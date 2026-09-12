import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEq, mockSelect, mockDelete, mockInsert, mockFrom, mockToast } = vi.hoisted(() => ({
  mockEq: vi.fn(),
  mockSelect: vi.fn(),
  mockDelete: vi.fn(),
  mockInsert: vi.fn(),
  mockFrom: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: mockToast,
}));

import { useFollows } from "@/hooks/useFollows";

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useFollows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ data: [], error: null });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockInsert.mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table !== "seguimiento") throw new Error(table);
      return {
        select: mockSelect,
        delete: mockDelete,
        insert: mockInsert,
      };
    });
  });

  it("no se sigue a sí mismo", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useFollows(), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    await act(async () => {
      await result.current.toggleFollow("me");
    });

    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("sigue a otro usuario y actualiza el recuento", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["follow-counts", "other"], { seguidores: 2, seguidos: 4 });
    const { result } = renderHook(() => useFollows(), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    await act(async () => {
      await result.current.toggleFollow("other");
    });

    expect(mockInsert).toHaveBeenCalledWith({ seguidor_id: "me", seguido_id: "other" });
    expect(queryClient.getQueryData(["follow-counts", "other"])).toEqual({
      seguidores: 3,
      seguidos: 4,
    });
  });
});
