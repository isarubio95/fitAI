import { useId, type CSSProperties } from "react";
import "./ActiveWorkoutCheckbox.css";

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
        onChange={(e) => onChange(e.target.checked)}
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
