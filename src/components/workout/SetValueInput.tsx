import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  formatCommittedNumber,
  parseDecimalInput,
  sanitizeDecimalDraft,
} from "@/lib/parseDecimalInput";

type SetValueInputProps = {
  field: string;
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  onCommit?: () => void;
  allowDecimal?: boolean;
  emptyAs?: "zero" | "null";
  min?: number;
  placeholder?: string;
  className?: string;
};

function committedDisplay(value: number | null | undefined, emptyAs: "zero" | "null"): string {
  if (value == null) return "";
  if (emptyAs === "zero" && value === 0) return "";
  return formatCommittedNumber(value);
}

export function SetValueInput({
  field,
  value,
  onValueChange,
  onCommit,
  allowDecimal = false,
  emptyAs = "zero",
  min = 0,
  placeholder,
  className,
}: SetValueInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? committedDisplay(value, emptyAs);

  const commitRaw = (raw: string) => {
    const parsed = parseDecimalInput(raw);
    if (parsed == null) {
      onValueChange(emptyAs === "zero" ? 0 : null);
      return;
    }
    const clamped = parsed < min ? min : parsed;
    onValueChange(allowDecimal ? clamped : Math.round(clamped));
  };

  return (
    <Input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      pattern={allowDecimal ? undefined : "[0-9]*"}
      enterKeyHint="next"
      autoComplete="off"
      data-set-field={field}
      value={display}
      placeholder={placeholder}
      className={className}
      onChange={(e) => {
        const next = sanitizeDecimalDraft(e.target.value, allowDecimal);
        setDraft(next);
        if (!next.endsWith(",") && !next.endsWith(".")) commitRaw(next);
      }}
      onFocus={() => {
        setDraft(committedDisplay(value, emptyAs));
      }}
      onBlur={() => {
        commitRaw(draft ?? display);
        setDraft(null);
        onCommit?.();
      }}
    />
  );
}
