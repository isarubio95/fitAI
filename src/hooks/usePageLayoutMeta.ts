import { useLocation, useSearchParams } from "react-router-dom";
import { YOU_TAB_LABELS, normalizeYouTab } from "@/lib/youPageTabs";

export function usePageLayoutMeta() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "";

  const pageTitle =
    location.pathname === "/"
      ? "Inicio"
      : location.pathname === "/evolution"
        ? "Tú"
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
      ? YOU_TAB_LABELS[normalizeYouTab(currentTab)]
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
