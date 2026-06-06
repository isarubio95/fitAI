import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function GymWorkoutIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="2" y="7" width="5" height="10" rx="1.5" />
      <rect x="7" y="11" width="10" height="2" rx="0.75" />
      <rect x="17" y="7" width="5" height="10" rx="1.5" />
    </svg>
  );
}
