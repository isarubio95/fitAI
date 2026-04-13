import { useEffect, useId, useMemo, useRef } from "react";

type LayerEntry = {
  id: string;
  close: () => void;
};

const LAYER_STATE_KEY = "__gym_log_overlay_layer__";
const layerStack: LayerEntry[] = [];
let popstateBound = false;

function isMobileLikeEnvironment() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const small = window.matchMedia?.("(max-width: 768px)")?.matches ?? false;
  return coarse || small;
}

function bindPopstateOnce() {
  if (popstateBound || typeof window === "undefined") return;
  window.addEventListener("popstate", () => {
    const top = layerStack[layerStack.length - 1];
    if (!top) return;
    top.close();
  });
  popstateBound = true;
}

function upsertLayer(entry: LayerEntry) {
  const idx = layerStack.findIndex((x) => x.id === entry.id);
  if (idx >= 0) layerStack[idx] = entry;
  else layerStack.push(entry);
}

function removeLayer(id: string) {
  const idx = layerStack.findIndex((x) => x.id === id);
  if (idx >= 0) layerStack.splice(idx, 1);
}

export function useBackCloseLayer({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  kind: "sheet" | "dialog" | "alert-dialog" | "popover" | "drawer";
}) {
  const reactId = useId();
  const id = useMemo(() => `${kind}:${reactId}`, [kind, reactId]);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) {
      removeLayer(id);
      return;
    }
    if (!isMobileLikeEnvironment()) return;
    if (!onOpenChangeRef.current) return;

    bindPopstateOnce();
    upsertLayer({
      id,
      close: () => onOpenChangeRef.current?.(false),
    });
    window.history.pushState({ [LAYER_STATE_KEY]: id }, "", window.location.href);

    return () => {
      removeLayer(id);
    };
  }, [open, id]);
}

