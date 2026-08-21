import { MapPin } from "lucide-react";
import { formatActivityAbsoluteDate } from "@/lib/formatActivityRelativeDate";
import { cn } from "@/lib/utils";

type Props = {
  dateTime?: string | null;
  gymName?: string | null;
  className?: string;
};

/**
 * Fecha absoluta + gimnasio (pin + nombre), misma pila que la ciudad de salida en cardio.
 */
export function GymStartMetaRow({ dateTime, gymName, className }: Props) {
  const hasDate = !!dateTime;
  const hasGym = !!gymName?.trim();
  if (!hasDate && !hasGym) return null;

  const pin = (
    <MapPin
      className="h-3 w-3 shrink-0 text-muted-foreground"
      aria-hidden
      strokeWidth={1.75}
    />
  );

  if (hasDate && !hasGym) {
    return (
      <time
        dateTime={dateTime}
        className={cn("block text-xs leading-none text-muted-foreground", className)}
      >
        {formatActivityAbsoluteDate(dateTime)}
      </time>
    );
  }

  return (
    <div className={cn(hasDate ? "space-y-1.5" : undefined, className)}>
      {hasDate ? (
        <time
          dateTime={dateTime}
          className="block text-xs leading-none text-muted-foreground"
        >
          {formatActivityAbsoluteDate(dateTime)}
        </time>
      ) : null}
      <p className="flex min-w-0 items-center gap-1.5 text-xs leading-none text-muted-foreground">
        {pin}
        <span className="truncate leading-none">{gymName}</span>
      </p>
    </div>
  );
}
