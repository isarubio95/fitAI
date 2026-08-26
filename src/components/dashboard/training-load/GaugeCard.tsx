import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PAGE_CARD } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

/**
 * Card compacta del dashboard: solo el anillo y su leyenda.
 * Todo el bloque es el área táctil que abre el detalle a pantalla completa.
 * Padding `px-3` (y no `px-5`) para que el anillo conserve el tamaño que tenía
 * cuando ambos compartían una sola card en un `grid-cols-2`.
 */
export function GaugeCard({
  onOpen,
  ariaLabel,
  interactive = true,
  className,
  children,
}: {
  onOpen: () => void;
  ariaLabel: string;
  /** En modo ordenar del dashboard la card no debe abrir nada, ni por teclado. */
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(PAGE_CARD, "min-w-0", className)}>
      <button
        type="button"
        onClick={onOpen}
        disabled={!interactive}
        tabIndex={interactive ? undefined : -1}
        aria-label={ariaLabel}
        className="touch-styled relative block w-full px-3 pb-4 pt-5 text-left"
      >
        <ChevronRight
          aria-hidden
          className="absolute right-2 top-3 h-4 w-4 text-muted-foreground/60"
        />
        {children}
      </button>
    </Card>
  );
}
