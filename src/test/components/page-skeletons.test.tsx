import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteFallback } from "@/components/layout/RouteFallback";
import {
  CommunitySkeleton,
  DashboardSkeleton,
  RoutinesSkeleton,
  YouActivitiesSkeleton,
  YouHealthSkeleton,
} from "@/components/layout/skeletons/pages";

describe("page skeletons", () => {
  it("Inicio replica calendario, forma y fuerza máxima", () => {
    render(<DashboardSkeleton />);

    expect(screen.getByText("Mes")).toBeInTheDocument();
    expect(screen.getByText("Semana")).toBeInTheDocument();
    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Forma")).toBeInTheDocument();
    expect(screen.getByText("Recuperación")).toBeInTheDocument();
    expect(screen.getByText("Nivel")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fuerza máxima" })).toBeInTheDocument();
  });

  it("Comunidad replica búsqueda y métricas del feed", () => {
    render(<CommunitySkeleton />);

    expect(screen.getByText("Buscar por nombre de usuario")).toBeInTheDocument();
    expect(screen.getAllByText("Tiempo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ejercicios").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Distancia").length).toBeGreaterThan(0);
  });

  it("Rutinas replica la tarjeta con play y el FAB", () => {
    render(<RoutinesSkeleton />);

    expect(screen.getByText("Añadir")).toBeInTheDocument();
    expect(screen.getByText(/Recientes|Antiguas|A-Z|Z-A|Recién usadas|Hace más|Cortas|Largas|Manual/)).toBeInTheDocument();
  });

  it("Salud replica el grid de métricas y el título del gráfico", () => {
    render(<YouHealthSkeleton />);

    expect(screen.getByText("Peso")).toBeInTheDocument();
    expect(screen.getByText("Calorías")).toBeInTheDocument();
    expect(screen.getByText("FC reposo")).toBeInTheDocument();
    expect(screen.getByText("Sueño")).toBeInTheDocument();
    expect(screen.getByText("Evolución del peso")).toBeInTheDocument();
  });

  it("Actividades replica filtros y el aria del feed", () => {
    render(<YouActivitiesSkeleton />);

    expect(screen.getByText("Todas")).toBeInTheDocument();
    expect(screen.getByText("Gym")).toBeInTheDocument();
    expect(screen.getByText("Cardio")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargando actividades")).toBeInTheDocument();
  });

  it("RouteFallback elige el skeleton de la ruta", () => {
    const { rerender } = render(<RouteFallback pathname="/" />);
    expect(screen.getByText("Forma")).toBeInTheDocument();

    rerender(<RouteFallback pathname="/routines" tab="rutinas" />);
    expect(screen.getByText("Añadir")).toBeInTheDocument();

    rerender(<RouteFallback pathname="/routines" tab="ejercicios" />);
    expect(screen.getByPlaceholderText("Buscar ejercicio...")).toBeInTheDocument();
  });
});
