import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { accentSurfaceRing } from "@/lib/filter-pill-styles";

const buttonVariants = cva(
  "touch-styled inline-flex items-center justify-center gap-2 whitespace-nowrap border-0 transition-transform duration-150 active:scale-95 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: cn(
          "h-11 rounded-xl ring-1 ring-inset px-4 text-sm font-semibold leading-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] active:translate-y-[1px] active:scale-[0.99]",
          accentSurfaceRing,
          "bg-primary-solid text-primary-foreground [@media(hover:hover)]:hover:bg-primary-solid/90",
        ),
        once: "h-11 rounded-xl ring-1 ring-inset ring-emerald-600/22 bg-linear-to-b from-[#d8f5e4] to-[#6ee7b7] px-4 text-sm font-medium leading-none text-stone-800 shadow-[0_8px_20px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(16,185,129,0.16)] transform-gpu will-change-transform transition-all duration-300 ease-out hover:-translate-y-1 hover:ring-emerald-600/30 hover:text-stone-800 hover:from-[#b8e8cc] hover:to-[#4ec489] hover:shadow-[0_14px_28px_rgba(0,0,0,0.14),0_0_0_1px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.32)] focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-0 active:duration-150 active:translate-y-[1.5px] active:scale-100 active:from-[#a7f3d0] active:to-[#34d399] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.07),0_0_0_1px_rgba(16,185,129,0.14)] dark:ring-emerald-500/25 dark:from-[#2d3d36] dark:to-[#24302a] dark:text-stone-100 dark:shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(16,185,129,0.2)] dark:hover:ring-emerald-400/50 dark:hover:text-stone-100 dark:hover:from-[#354a42] dark:hover:to-[#2c3832] dark:hover:shadow-[0_14px_28px_rgba(0,0,0,0.38),0_0_0_1px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] dark:focus-visible:ring-emerald-400/35 dark:active:from-[#283530] dark:active:to-[#202a26] dark:active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.42),0_0_0_1px_rgba(16,185,129,0.18)]",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-[0.92] dark:hover:brightness-100 dark:hover:bg-destructive/90",
        outline: "ring-1 ring-inset ring-input bg-background hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        filter:
          "ring-1 ring-inset ring-border/20 bg-background hover:ring-border/35 hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent/55 dark:hover:bg-accent/30",
        ghost: "hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline",
        new: "min-h-9 !h-9 shrink-0 gap-1.5 rounded-full ring-1 ring-inset ring-primary/20 bg-primary-solid px-4 py-0 text-sm font-semibold text-primary-foreground shadow-xs transition-[colors,box-shadow] hover:ring-primary/48 hover:bg-primary-solid/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-[1.1rem] dark:ring-primary/30 dark:bg-primary-solid dark:text-primary-foreground dark:shadow-sm dark:hover:ring-primary/40 dark:hover:bg-primary-solid/90 dark:hover:text-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { onPointerUp, ...restProps } = props;

    const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
      onPointerUp?.(event);
      if (event.pointerType === "touch") {
        event.currentTarget.blur();
      }
    };

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} onPointerUp={handlePointerUp} {...restProps} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
