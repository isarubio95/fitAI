import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Salida al descartar: desliza de derecha a izquierda (x negativo) con ligera escala y fade.
 */
export function InAppNotificationItemMotion({ children, className }: Props) {
  return (
    <motion.div
      className={cn("min-w-0 w-full", className)}
      layout
      initial={false}
      exit={{
        x: "-100%",
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.34, ease: easeOut },
      }}
    >
      {children}
    </motion.div>
  );
}
