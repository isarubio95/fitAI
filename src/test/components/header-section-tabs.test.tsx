import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HeaderSectionTabs } from "@/components/layout/HeaderSectionTabs";

function Probe() {
  const [params] = useSearchParams();
  return <div data-testid="qs">{params.toString()}</div>;
}

describe("HeaderSectionTabs", () => {
  it("al cambiar de pestaña conserva el resto de params", () => {
    render(
      <MemoryRouter initialEntries={["/routines?tab=ejercicios&q=press&add=catalogo:1&addName=Press"]}>
        <HeaderSectionTabs
          tabs={[
            { value: "rutinas", label: "Rutinas" },
            { value: "ejercicios", label: "Ejercicios" },
          ]}
          activeTab="ejercicios"
        />
        <Probe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rutinas" }));
    const qs = screen.getByTestId("qs").textContent ?? "";
    expect(qs).toContain("tab=rutinas");
    expect(qs).toContain("q=press");
    expect(qs).toContain("add=catalogo%3A1");
  });
});
