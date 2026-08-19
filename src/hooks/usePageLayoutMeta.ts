import { useLocation, useSearchParams } from "react-router-dom";

export function usePageLayoutMeta() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "";

  const pageTitle =
    location.pathname === "/"
      ? "Inicio"
      : location.pathname === "/evolution"
        ? "Evolución"
        : location.pathname === "/routines"
          ? "Biblioteca"
          : location.pathname === "/community"
            ? "Comunidad"
            : location.pathname === "/cardio-routines"
              ? "Rutinas de Cardio"
              : location.pathname === "/gimnasios"
                ? "Gimnasios"
                : location.pathname === "/profile"
                  ? "Perfil"
                  : "Track Gym";

  const showSectionPills =
    location.pathname === "/evolution" || location.pathname === "/routines";

  const activeSubsectionLabel =
    location.pathname === "/evolution"
      ? (currentTab || "history") === "measurements"
        ? "Medidas"
        : "Entrenos"
      : location.pathname === "/routines"
        ? (currentTab || "rutinas") === "ejercicios"
          ? "Ejercicios"
          : "Rutinas"
        : "";

  return {
    location,
    searchParams,
    currentTab,
    pageTitle,
    showSectionPills,
    activeSubsectionLabel,
  };
}
