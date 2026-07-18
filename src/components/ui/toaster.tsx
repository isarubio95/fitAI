import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isSuccess = variant !== "destructive";

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {isSuccess && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />}
              <div className="grid min-w-0 flex-1 gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
