import { useCallback, useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Ventana creciente sobre una lista en memoria (infinite scroll local).
 * `resetKey` reinicia a la primera página al cambiar filtro/tab.
 */
export function usePagedWindow<T>(
  items: T[],
  opts?: { pageSize?: number; resetKey?: string | number | null },
) {
  const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE;
  const resetKey = opts?.resetKey ?? "";
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
  }, [pageSize, items.length]);

  return { visible, hasMore, loadMore, total: items.length, visibleCount };
}
