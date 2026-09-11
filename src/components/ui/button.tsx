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
          "rounded-xl ring-1 ring-inset px-4 text-sm font-semibold leading-none shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-none active:translate-y-[1px] active:scale-[0.99]",
          accentSurfaceRing,
          "bg-primary-solid text-primary-foreground hover:bg-primary-solid/90",
        ),
        destructive: "bg-destructive text-destructive-foreground hover:brightness-[0.92] dark:hover:brightness-100 dark:hover:bg-destructive/90",
        outline: "ring-1 ring-inset ring-input bg-background hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        filter:
          "ring-1 ring-inset ring-border/20 bg-background hover:ring-border/35 hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent/55 dark:hover:bg-accent/30",
        ghost: "hover:bg-accent/55 hover:text-accent-foreground dark:hover:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline",
        new: "shrink-0 gap-1.5 rounded-full ring-1 ring-inset ring-primary/20 bg-primary-solid px-4 text-sm font-semibold text-primary-foreground shadow-none transition-[colors,box-shadow] hover:ring-primary/48 hover:bg-primary-solid/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-[1.1rem] dark:ring-primary/30 dark:bg-primary-solid dark:text-primary-foreground dark:hover:ring-primary/40 dark:hover:bg-primary-solid/90 dark:hover:text-primary-foreground",
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
    compoundVariants: [
      {
        variant: "new",
        class: "h-9 rounded-full px-4 py-0",
      },
    ],
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
