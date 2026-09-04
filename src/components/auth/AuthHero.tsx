import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Imagen del onboarding. El archivo es opcional: si no existe (o falla la
 * carga) se queda el degradado de acento, así que la pantalla nunca muestra
 * un hueco roto. Para cambiarla basta con dejar el fichero en `public/`.
 */
const HERO_IMAGE_SRC = "/auth-hero.webp";

interface AuthHeroProps {
  children?: React.ReactNode;
  className?: string;
}

export function AuthHero({ children, className }: AuthHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden rounded-3xl",
        // Fallback: degradado de acento + logo tenue detrás.
        "bg-[linear-gradient(160deg,color-mix(in_srgb,hsl(var(--primary))_45%,black)_0%,hsl(var(--card))_55%,hsl(var(--background))_100%)]",
        className,
      )}
    >
      {!imageFailed && (
        <img
          src={HERO_IMAGE_SRC}
          alt=""
          aria-hidden="true"
          loading="eager"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      {imageFailed && (
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-[70%] opacity-20"
        />
      )}
      {/* Scrim para que el texto se lea sobre cualquier foto. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background from-15% via-background/55 via-50% to-transparent"
      />
      <div className="p-6">{children}</div>
    </div>
  );
}
