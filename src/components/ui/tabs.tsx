import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Pills Mes/Semana (calendario, heatmap, etc.). */
export const pillTabsListClass =
  "h-9 shrink-0 rounded-full bg-muted p-1 dark:bg-background";

export const pillTabsTriggerClass =
  "touch-pill relative z-10 inline-flex items-center justify-center rounded-full px-5 text-sm font-medium outline-none focus:outline-none focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground";

export const pillTabsIndicatorClass =
  "pointer-events-none absolute bottom-1 top-1 rounded-full bg-card shadow-xs dark:bg-muted dark:shadow-none";

/** Texto con subrayado bajo el activo (periodos, filtros secundarios). */
export const underlineTabsListClass =
  "h-auto shrink-0 gap-4 rounded-none bg-transparent p-0 text-muted-foreground";

export const underlineTabsTriggerClass =
  "relative z-10 h-auto rounded-none border-0 bg-transparent px-0 pb-1.5 pt-0 text-sm font-medium shadow-none outline-none focus:outline-none focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface AnimatedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  value: string;
  /** `pill` = fondo deslizante; `underline` = barra bajo el activo. */
  variant?: "pill" | "underline";
}

const INDICATOR_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as const;

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  AnimatedTabsListProps
>(({ className, value, variant = "pill", children, ...props }, ref) => {
  const listRef = React.useRef<React.ElementRef<typeof TabsPrimitive.List>>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });
  /** Evita animar el primer colocamiento al montar (p. ej. al abrir el dashboard). */
  const canAnimateRef = React.useRef(false);

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const activeEl = list.querySelector<HTMLElement>('[data-state="active"]');
    if (!activeEl) return;

    let next: { left: number; width: number };

    if (variant === "underline") {
      // Ancho intermedio: más que el texto, menos que el trigger completo.
      const listRect = list.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(activeEl);
      const textRect = range.getBoundingClientRect();
      const textWidth = Math.max(textRect.width, 1);
      const tabWidth = activeEl.offsetWidth;
      const width = Math.min(tabWidth * 0.58, Math.max(textWidth * 2.35, 52));
      const textCenter = textRect.left - listRect.left + textWidth / 2;
      next = { left: textCenter - width / 2, width };
    } else {
      next = { left: activeEl.offsetLeft, width: activeEl.offsetWidth };
    }

    setIndicator((prev) =>
      prev.left === next.left && prev.width === next.width ? prev : next,
    );
  }, [variant]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [value, children, updateIndicator]);

  React.useEffect(() => {
    if (indicator.width > 0) {
      canAnimateRef.current = true;
    }
  }, [indicator.width]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);

    return () => observer.disconnect();
  }, [updateIndicator]);

  const setListRef = React.useCallback(
    (node: React.ElementRef<typeof TabsPrimitive.List> | null) => {
      listRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  return (
    <TabsPrimitive.List
      ref={setListRef}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {variant === "underline" ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-foreground"
          initial={false}
          animate={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.width > 0 ? 1 : 0,
          }}
          transition={canAnimateRef.current ? INDICATOR_TRANSITION : { duration: 0 }}
        />
      ) : (
        <motion.span
          aria-hidden="true"
          className={pillTabsIndicatorClass}
          initial={false}
          animate={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.width > 0 ? 1 : 0,
          }}
          transition={canAnimateRef.current ? INDICATOR_TRANSITION : { duration: 0 }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
});
AnimatedTabsList.displayName = "AnimatedTabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "touch-pill inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.25 text-sm font-medium ring-offset-background border border-transparent transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, AnimatedTabsList, TabsTrigger, TabsContent };
