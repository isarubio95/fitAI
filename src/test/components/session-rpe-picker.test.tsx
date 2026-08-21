import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionRpePicker } from "@/components/training/SessionRpePicker";

describe("SessionRpePicker", () => {
  it("muestra el esfuerzo sin marcar y lo confirma al deslizar", () => {
    const onChange = vi.fn();
    render(<SessionRpePicker value={null} onChange={onChange} />);

    expect(screen.getByText("—")).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: /esfuerzo percibido/i });
    expect(slider).toHaveAttribute("aria-valuenow", "1");

    slider.focus();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("refleja el valor elegido", () => {
    render(<SessionRpePicker value={7} onChange={vi.fn()} />);

    expect(screen.getByText("Muy duro")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /esfuerzo 7/i })).toHaveAttribute("aria-valuenow", "7");
  });
});
