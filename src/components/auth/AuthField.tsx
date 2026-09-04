import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_FIELD_CLASS, AUTH_FIELD_ICON_CLASS, AUTH_FIELD_TOGGLE_CLASS } from "@/lib/authStyles";
import { cn } from "@/lib/utils";

interface AuthFieldProps {
  id: string;
  /** Etiqueta accesible: se oculta visualmente (el diseño usa placeholder). */
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  /** Añade el botón de mostrar/ocultar (solo para contraseñas). */
  withToggle?: boolean;
}

/**
 * Campo del onboarding: icono a la izquierda, sin label visible y con el ojo
 * opcional a la derecha. La etiqueta sigue existiendo en el DOM (`sr-only`)
 * para lectores de pantalla y para los selectores por label de los tests.
 */
export function AuthField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required,
  minLength,
  withToggle = false,
}: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const inputType = withToggle && revealed ? "text" : type;

  return (
    <div>
      <Label htmlFor={id} className="sr-only mb-0">
        {label}
      </Label>
      <div className="relative">
        <Icon className={AUTH_FIELD_ICON_CLASS} aria-hidden="true" />
        <Input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={cn(AUTH_FIELD_CLASS, withToggle && "pr-12")}
        />
        {withToggle && (
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            className={AUTH_FIELD_TOGGLE_CLASS}
            aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
