import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Silueta de persona corriendo en trazo Lucide (cabeza + torso + zancada).
 * Inspirada en el icono «run» de Tabler Icons (MIT).
 */
export function RunningIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="13" cy="4" r="1" />
      <path d="M4 17l5 1 .75-1.5" />
      <path d="M15 21v-4l-4-3 1-6" />
      <path d="M7 12V9l5-1 3 3 3 1" />
    </svg>
  );
}
