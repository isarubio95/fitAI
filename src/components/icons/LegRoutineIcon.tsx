import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Silueta de pierna en contorno (Game Icons · delapouite · CC BY 3.0).
 * Misma forma que el icono original, renderizada con trazo para alinearla con Lucide.
 * @see https://game-icons.net/1x1/delapouite/leg.html
 */
const LEG_PATH =
  "M19.09 16.96V170.7C73.51 193.5 202.7 200 259.8 189.4c-18.1 105.6 34 177.3 31.1 226.5-2 33.3-22.9 39-13.5 69.3 4.9 15.6 193 5.1 201.1 4.9 7.7-.3 5.4-19.2-13.3-27.2-35.2-15.1-80.2-10.7-110.1-47-9.7-14.6 6.9-180.3 10-241.4.8-15.7 4.7-78.91-60-100.5C225 47.24 123 27.32 19.09 16.96z";

const SOURCE_VIEWBOX = 512;
const LUCIDE_VIEWBOX = 24;

function toSourceStrokeWidth(strokeWidth: SVGProps<SVGSVGElement>["strokeWidth"]) {
  const value = typeof strokeWidth === "number" ? strokeWidth : Number(strokeWidth ?? 2);
  return value * (SOURCE_VIEWBOX / LUCIDE_VIEWBOX);
}

export function LegRoutineIcon({
  className,
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SOURCE_VIEWBOX} ${SOURCE_VIEWBOX}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={toSourceStrokeWidth(strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d={LEG_PATH} />
    </svg>
  );
}
