import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Pills Mes/Semana (calendario, heatmap, etc.). */
export const pillTabsListClass = "h-9 shrink-0 rounded-full p-1";

export const pillTabsTriggerClass =
  "touch-pill relative z-10 inline-flex items-center justify-center rounded-full px-5 text-sm outline-none focus:outline-none focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none";

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
}

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  AnimatedTabsListProps
>(({ className, value, children, ...props }, ref) => {
  const listRef = React.useRef<React.ElementRef<typeof TabsPrimitive.List>>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const activeEl = list.querySelector<HTMLElement>('[data-state="active"]');
    if (!activeEl) return;

    setIndicator({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  }, []);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [value, children, updateIndicator]);

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
      {indicator.width > 0 && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-background shadow-xs"
          animate={{
            left: indicator.left,
            width: indicator.width,
          }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
