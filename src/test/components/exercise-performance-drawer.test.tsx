import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { format, subDays } from "date-fns";
import type { ExerciseHistorySet } from "@/lib/exerciseHistory";

const { mockUseExerciseSetHistory } = vi.hoisted(() => ({
  mockUseExerciseSetHistory: vi.fn(),
}));

vi.mock("@/hooks/useExerciseSetHistory", () => ({
  useExerciseSetHistory: mockUseExerciseSetHistory,
}));

import { ExercisePerformanceDrawer } from "@/components/exercise/ExercisePerformanceDrawer";

/** Fechas relativas a hoy: el filtro por defecto son 3 meses. */
const DAY_RECENT = format(new Date(), "yyyy-MM-dd");
const DAY_MID = format(subDays(new Date(), 10), "yyyy-MM-dd");
const DAY_OLD = format(subDays(new Date(), 40), "yyyy-MM-dd");

function mkSet(
  day: string,
  numeroSerie: number,
  pesoKg: number,
  repeticiones: number,
  tipoSerie: ExerciseHistorySet["tipoSerie"] = "efectiva",
): ExerciseHistorySet {
  return {
    day,
    actividadId: `act-${day}`,
    actividadTitulo: "Día de empuje",
    numeroSerie,
    pesoKg,
    repeticiones,
    tipoSerie,
    rir: 2,
    duracionSeg: null,
  };
}

/*
 * 1RM Epley → reciente 93 kg, medio 110 kg, antiguo 80 kg.
 * Volumen     → reciente 400 kg, medio 300 kg, antiguo 600 kg.
 * Los dos picos caen en días distintos, así se comprueba que la métrica manda.
 */
const SETS: ExerciseHistorySet[] = [
  mkSet(DAY_RECENT, 1, 80, 5),
  mkSet(DAY_MID, 1, 100, 3),
  mkSet(DAY_OLD, 1, 60, 10),
];

function renderDrawer() {
  return render(
    <ExercisePerformanceDrawer
      open
      onOpenChange={() => {}}
      exerciseName="Press banca"
      target={{ tipo_ejercicio_id: "te-1" }}
    />,
  );
}

/**
 * Los triggers de Radix Tabs activan en `mousedown`, no en `click`.
 */
function activateTab(name: string) {
  fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0 });
}

/** Filas del listado, en el orden en que se pintan. */
function rowLabels(container: HTMLElement): string[] {
  return [...container.ownerDocument.querySelectorAll('[aria-controls^="exercise-day-"]')].map(
    (el) => el.textContent ?? "",
  );
}

describe("ExercisePerformanceDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExerciseSetHistory.mockReturnValue({
      data: SETS,
      isLoading: false,
      isError: false,
    });
  });

  it("muestra el nombre del ejercicio y una fila por día de entreno", () => {
    const { container } = renderDrawer();

    expect(screen.getByText("Press banca")).toBeInTheDocument();
    expect(rowLabels(container)).toHaveLength(3);
    expect(screen.getByText("3 sesiones")).toBeInTheDocument();
  });

  it("ordena por fecha con la sesión más reciente arriba", () => {
    const { container } = renderDrawer();

    const labels = rowLabels(container);
    expect(labels[0]).toContain("93 kg");
    expect(labels[1]).toContain("110 kg");
    expect(labels[2]).toContain("80 kg");
  });

  it("reordena de mayor a menor puntuación al pulsar el conmutador", () => {
    const { container } = renderDrawer();

    fireEvent.click(screen.getByLabelText("Ordenar de mayor a menor puntuación"));

    const labels = rowLabels(container);
    expect(labels[0]).toContain("110 kg");
    expect(labels[1]).toContain("93 kg");
    expect(labels[2]).toContain("80 kg");
    // El botón pasa a ofrecer la vuelta al orden cronológico.
    expect(
      screen.getByLabelText("Ordenar por fecha, la más reciente primero"),
    ).toBeInTheDocument();
  });

  it("destaca como mejor del periodo el día de mayor 1RM, no el más reciente", () => {
    renderDrawer();

    const best = screen.getByText("Mejor del periodo").parentElement;
    expect(best).not.toBeNull();
    expect(best!.textContent).toContain("110 kg");

    const last = screen.getByText("Última sesión").parentElement;
    expect(last!.textContent).toContain("93 kg");
  });

  it("cambia de puntuación a volumen y con ella el pico", () => {
    const { container } = renderDrawer();

    activateTab("Volumen");

    const labels = rowLabels(container);
    expect(labels[0]).toContain("400 kg");
    expect(labels[2]).toContain("600 kg");

    const best = screen.getByText("Mejor del periodo").parentElement;
    expect(best!.textContent).toContain("600 kg");
  });

  it("el filtro de periodo recorta las sesiones fuera del tramo", () => {
    const { container } = renderDrawer();

    activateTab("1 mes");

    const labels = rowLabels(container);
    expect(labels).toHaveLength(2);
    expect(labels.join(" ")).not.toContain("80 kg");
    expect(screen.getByText("2 sesiones")).toBeInTheDocument();
  });

  it("despliega las series reales de un día al pulsar su fila", () => {
    const { container } = renderDrawer();

    const rows = [...container.ownerDocument.querySelectorAll('[aria-controls^="exercise-day-"]')];
    expect(rows[0].getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(rows[0]);

    expect(rows[0].getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("80 kg × 5")).toBeInTheDocument();
    expect(screen.getByText("RIR 2")).toBeInTheDocument();
    expect(screen.getByText("Día de empuje")).toBeInTheDocument();
  });

  it("etiqueta la métrica en reps cuando el ejercicio es a peso corporal", () => {
    mockUseExerciseSetHistory.mockReturnValue({
      data: [mkSet(DAY_RECENT, 1, 0, 12), mkSet(DAY_MID, 1, 0, 10)],
      isLoading: false,
      isError: false,
    });
    renderDrawer();

    expect(screen.getByRole("tab", { name: "Máx. reps" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reps totales" })).toBeInTheDocument();
  });

  it("no cuenta el calentamiento como sesión con trabajo", () => {
    mockUseExerciseSetHistory.mockReturnValue({
      data: [mkSet(DAY_RECENT, 1, 40, 10, "calentamiento")],
      isLoading: false,
      isError: false,
    });
    const { container } = renderDrawer();

    expect(rowLabels(container)).toHaveLength(0);
    expect(
      screen.getByText("Aún no hay series registradas de este ejercicio 💪"),
    ).toBeInTheDocument();
  });

  it("avisa cuando el historial falla", () => {
    mockUseExerciseSetHistory.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderDrawer();

    expect(screen.getByText(/No se pudo cargar el historial/i)).toBeInTheDocument();
  });
});
