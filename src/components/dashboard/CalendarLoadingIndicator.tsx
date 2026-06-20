import { AnimatePresence, motion } from "framer-motion";

interface CalendarLoadingIndicatorProps {
  show: boolean;
}

export function CalendarLoadingIndicator({ show }: CalendarLoadingIndicatorProps) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mb-2 overflow-hidden px-2"
          role="status"
          aria-live="polite"
          aria-label="Cargando actividades del calendario"
        >
          <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-muted/50">
            <motion.div
              className="absolute inset-y-0 w-1/3 rounded-full bg-primary/40"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 1.25, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
