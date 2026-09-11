import * as React from "react";

import { FIELD_FOCUS_RING, FIELD_INVALID_RING } from "@/lib/fieldStyles";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none transition-[color,box-shadow] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          FIELD_FOCUS_RING,
          FIELD_INVALID_RING,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
