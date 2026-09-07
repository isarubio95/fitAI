import { ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { PAGE_CARD } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

/**
 * Card compacta del dashboard: solo el anillo y su leyenda.
 * Todo el bloque es el área táctil que abre el detalle a pantalla completa.
 * El título sigue el `px-5` del resto de cabeceras; el anillo usa `px-3` para
 * conservar el tamaño que tenía cuando ambos compartían una sola card.
 */
export function GaugeCard({
  title,
  onOpen,
  ariaLabel,
  interactive = true,
  className,
  children,
}: {
  title: string;
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
        className="touch-styled block w-full pb-4 pt-5 text-left"
      >
        <div className="flex items-center justify-between gap-1 px-5">
          <CardTitle asChild className="min-w-0 truncate text-base font-bold">
            <h2>{title}</h2>
          </CardTitle>
          <ChevronRight aria-hidden className="h-4 w-4 shrink-0" />
        </div>
        <div className="px-3">{children}</div>
      </button>
    </Card>
  );
}
