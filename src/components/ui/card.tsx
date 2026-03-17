import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      className,
      [
        // Force the same “Once-like” glass style everywhere.
        "relative overflow-hidden rounded-2xl text-card-foreground",
        "*:relative *:z-10",
        "border border-black/5 dark:border-white/10",
        "bg-white/55 dark:bg-zinc-950/35",
        "supports-backdrop-filter:backdrop-blur-2xl",
        "transition-shadow duration-200 ease-out",
        "shadow-[0_10px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_34px_rgba(0,0,0,0.45)]",
        /* Once-style card glow (suave para no restar contraste al texto) */
        "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
        "before:[background:radial-gradient(390px_circle_at_90%_10%,hsl(var(--primary)/0.07),transparent_51%),radial-gradient(725px_circle_at_85%_15%,hsl(var(--primary)/0.04),transparent_61%)]",
        "dark:before:[background:radial-gradient(390px_circle_at_90%_10%,hsl(var(--primary)/0.22),transparent_51%),radial-gradient(725px_circle_at_85%_15%,hsl(var(--primary)/0.12),transparent_61%)]",
        // Subtle inset highlight.
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
        "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.40)] dark:after:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
      ].join(" "),
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "h3";
    return <Comp ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
