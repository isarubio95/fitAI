import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SetValueInput } from "@/components/workout/SetValueInput";

function WeightHarness({ onCommit }: { onCommit?: () => void }) {
  const [value, setValue] = useState<number | null>(0);
  return (
    <SetValueInput
      field="peso_kg"
      value={value}
      allowDecimal
      onValueChange={setValue}
      onCommit={onCommit}
    />
  );
}

describe("SetValueInput", () => {
  it("acepta coma decimal y la normaliza al salir", () => {
    const onCommit = vi.fn();
    render(<WeightHarness onCommit={onCommit} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "12,5" } });
    expect(input).toHaveValue("12,5");

    fireEvent.blur(input);
    expect(input).toHaveValue("12.5");
    expect(onCommit).toHaveBeenCalled();
  });
});
