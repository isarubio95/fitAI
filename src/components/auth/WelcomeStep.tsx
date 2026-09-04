import { ArrowRight } from "lucide-react";

import { AuthHero } from "@/components/auth/AuthHero";
import { Button } from "@/components/ui/button";
import { AUTH_CTA_CLASS } from "@/lib/authStyles";

interface WelcomeStepProps {
  onStart: () => void;
  onLogin: () => void;
}

/** Primera pantalla del onboarding: marca, imagen y entrada al registro. */
export function WelcomeStep({ onStart, onLogin }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <AuthHero className="min-h-[22rem] flex-1">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Bienvenido a
          <br />
          <span className="text-primary">Track Gym.</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Registra tus entrenos, sigue tu progreso y no vuelvas a perder una serie.
        </p>
      </AuthHero>

      <div className="flex flex-col gap-3">
        <Button type="button" onClick={onStart} className={AUTH_CTA_CLASS}>
          Comenzar
          <ArrowRight />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onLogin}
          className="h-11 w-full rounded-2xl text-sm text-muted-foreground"
        >
          Ya tengo cuenta
        </Button>
      </div>
    </div>
  );
}
