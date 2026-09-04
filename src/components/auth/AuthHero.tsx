import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Visual del onboarding. El archivo es opcional: si no existe (o falla la
 * carga) se muestra el logo sobre el fondo de la pantalla, sin card.
 * Para poner una foto basta con dejar el fichero en `public/`.
 */
const HERO_IMAGE_SRC = "/auth-hero.webp";

interface AuthHeroProps {
  children?: React.ReactNode;
  className?: string;
}

export function AuthHero({ children, className }: AuthHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={cn("relative isolate flex flex-col justify-end", className)}>
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
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-[70%] opacity-40"
        />
      )}
      {/* Scrim solo si hay foto, para que el texto se lea encima. */}
      {!imageFailed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background from-15% via-background/55 via-50% to-transparent"
        />
      )}
      <div>{children}</div>
    </div>
  );
}
