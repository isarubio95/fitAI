import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      duration={5000}
      offset={24}
      mobileOffset={{
        bottom: "var(--app-bottom-nav-inset, calc(1rem + env(safe-area-inset-bottom, 0px)))",
        left: 16,
        right: 16,
      }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-success-border group-[.toaster]:border-l-4 group-[.toaster]:border-l-success group-[.toaster]:bg-success-muted group-[.toaster]:text-success-foreground group-[.toaster]:shadow-lg group-[.toaster]:shadow-success/10 group-[.toaster]:text-[13px] group-[.toaster]:leading-snug",
          title: "group-[.toast]:text-[13px] group-[.toast]:font-semibold group-[.toast]:leading-snug",
          description:
            "group-[.toast]:text-success-foreground/75 group-[.toast]:text-[13px] group-[.toast]:leading-snug",
          success:
            "group-[.toaster]:border-success-border group-[.toaster]:border-l-success group-[.toaster]:bg-success-muted group-[.toaster]:text-success-foreground",
          error:
            "group-[.toaster]:border-destructive group-[.toaster]:border-l-destructive group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground",
          actionButton: "group-[.toast]:bg-success group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
