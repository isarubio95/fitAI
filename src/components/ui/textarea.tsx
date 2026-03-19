import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-emerald-500/30 focus-visible:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_0_0_1px_rgba(16,185,129,0.18),0_0_0_3px_rgba(16,185,129,0.13),0_0_0_5px_rgba(16,185,129,0.10),0_0_0_11px_rgba(52,211,153,0.06)] transition-[box-shadow,border-color] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
