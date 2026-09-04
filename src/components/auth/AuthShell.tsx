import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor del onboarding: fuerza el tema oscuro solo en esta pantalla.
 *
 * `index.css` declara los tokens en `.dark { … }` y los acentos en
 * `.dark[data-accent="…"] { … }`, así que el wrapper necesita LAS DOS cosas:
 * con la clase `dark` a secas el acento del usuario no se aplicaría y siempre
 * saldría el verde por defecto.
 */
export function AuthShell({ children, className }: AuthShellProps) {
  const { accentColor } = useTheme();

  return (
    <div
      className="dark relative min-h-screen w-full overflow-hidden bg-background text-foreground"
      data-accent={accentColor}
    >
      {/* Orbes de acento, en la línea del fondo del `body` pero algo más marcados. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(900px_circle_at_15%_-10%,hsl(var(--primary)/0.16),transparent_50%),radial-gradient(700px_circle_at_90%_10%,hsl(var(--primary)/0.1),transparent_55%),radial-gradient(1000px_circle_at_50%_110%,hsl(var(--primary)/0.08),transparent_55%)]"
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-5",
          "pt-[calc(1.5rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))]",
          "pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
