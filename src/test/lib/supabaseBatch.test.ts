import { describe, expect, it, vi } from "vitest";
import { chunkIds, fetchAllPages } from "@/lib/supabaseBatch";

describe("supabaseBatch", () => {
  it("divide ids en trozos del tamaño indicado", () => {
    const ids = Array.from({ length: 450 }, (_, i) => `id-${i}`);
    const chunks = chunkIds(ids, 200);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(200);
    expect(chunks[2]).toHaveLength(50);
  });

  it("pagina resultados hasta agotar filas", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: Array.from({ length: 1000 }, (_, i) => i), error: null })
      .mockResolvedValueOnce({ data: [1000, 1001], error: null });

    const rows = await fetchAllPages<number>(fetchPage);
    expect(rows).toHaveLength(1002);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 999);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 1000, 1999);
  });
});
