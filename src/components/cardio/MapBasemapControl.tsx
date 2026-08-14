import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Layers } from "lucide-react";
import type { MapBasemapId } from "@/lib/mapBasemap";
import { cn } from "@/lib/utils";

const CONTROL_CLASS = cn(
  "touch-styled flex h-10 w-10 items-center justify-center rounded-full text-white",
  "border border-white/15 bg-[#1a1f21]/90 shadow-lg backdrop-blur-sm",
  "transition-colors active:scale-95",
);

const OPTIONS: Array<{ id: MapBasemapId; label: string }> = [
  { id: "map", label: "Mapa" },
  { id: "satellite", label: "Satélite" },
  { id: "hybrid", label: "Híbrido" },
];

type Props = {
  value: MapBasemapId;
  onChange: (id: MapBasemapId) => void;
  className?: string;
  style?: CSSProperties;
  /** Abre el menú hacia arriba (útil cuando el botón está abajo). */
  menuPlacement?: "above" | "below";
};

/**
 * Botón de capas típico: abre un menú compacto Mapa / Satélite / Híbrido.
 */
export function MapBasemapControl({
  value,
  onChange,
  className,
  style,
  menuPlacement = "above",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)} style={style}>
      {open ? (
        <div
          role="menu"
          aria-label="Tipo de mapa"
          className={cn(
            "absolute right-0 z-20 min-w-36 overflow-hidden rounded-xl border border-white/15",
            "bg-[#1a1f21]/95 py-1 shadow-lg backdrop-blur-sm",
            menuPlacement === "above" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {OPTIONS.map((option) => {
            const selected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={cn(
                  "touch-styled flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm",
                  "transition-colors active:bg-white/10",
                  selected ? "text-white" : "text-white/70 hover:text-white",
                )}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    selected ? "border-white" : "border-white/35",
                  )}
                  aria-hidden
                >
                  {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Cambiar tipo de mapa"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Tipo de mapa"
        className={CONTROL_CLASS}
      >
        <Layers className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
