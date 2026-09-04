import { useId, type CSSProperties } from "react";
import "./ActiveWorkoutCheckbox.css";
import { tapLight, tapMedium } from "@/lib/haptics";

interface ActiveWorkoutCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  title?: string;
  size?: number;
}

export function ActiveWorkoutCheckbox({
  checked,
  onChange,
  title,
  size = 32,
}: ActiveWorkoutCheckboxProps) {
  const checkboxId = useId();

  return (
    <div className="checkbox-wrapper">
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          // Marcar serie es el gesto más repetido de la app: un pulso corto
          // (MEDIUM, 43 ms) confirma sin cansar. `success` es un doble pulso
          // de 121 ms y se reserva para terminar el entreno entero.
          if (e.target.checked) tapMedium();
          else tapLight();
          onChange(e.target.checked);
        }}
        aria-label={title}
      />
      <label
        htmlFor={checkboxId}
        title={title}
        style={{ "--size": `${size}px` } as CSSProperties}
      >
        <span className="tick_mark" />
      </label>
    </div>
  );
}
