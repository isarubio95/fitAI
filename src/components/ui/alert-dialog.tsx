import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { DIALOG_CONTENT_BASE_CLASS, DIALOG_SURFACE_CLASS } from "@/lib/dialogStyles";

const AlertDialogDismissContext = React.createContext<(() => void) | undefined>(undefined);

const AlertDialog = ({
  open,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) => {
  useBackCloseLayer({ open: !!open, onOpenChange, kind: "alert-dialog" });

  const requestDismiss = React.useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  return (
    <AlertDialogDismissContext.Provider value={requestDismiss}>
      <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props} />
    </AlertDialogDismissContext.Provider>
  );
};

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, onPointerDown, ...props }, ref) => {
  const requestDismiss = React.useContext(AlertDialogDismissContext);

  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
      ref={ref}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (e.defaultPrevented) return;
        if (e.target === e.currentTarget) requestDismiss?.();
      }}
    />
  );
});
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** Añade o sustituye clases del overlay (p. ej. z-index por encima de capas full-screen). */
  overlayClassName?: string;
}

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, overlayClassName, onOpenAutoFocus, onCloseAutoFocus, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay className={overlayClassName} />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        DIALOG_CONTENT_BASE_CLASS,
        DIALOG_SURFACE_CLASS,
        className,
      )}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        onOpenAutoFocus?.(e);
      }}
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        onCloseAutoFocus?.(e);
      }}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "destructive" }), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
