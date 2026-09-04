import { useSearchParams } from "react-router-dom";
import {
  SECTION_UNDERLINE_TABS_LIST,
  SECTION_UNDERLINE_TABS_ROW,
  SECTION_TAB_PANEL,
  SECTION_UNDERLINE_TABS_TRIGGER,
} from "@/lib/pageStyles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSectionTabUnderlineAnimation } from "@/hooks/useSectionTabUnderlineAnimation";
import { Suspense, lazy } from "react";
import { RouteFallback } from "@/components/layout/RouteFallback";

// Estáticos, Library arrastraba las dos subpantallas (Exercises son 1100 líneas
// más el catálogo) aunque el usuario solo abriera una.
const Routines = lazy(() => import("@/pages/Routines"));
const Exercises = lazy(() => import("@/pages/Exercises"));

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "rutinas";
  const tabAnimation = useSectionTabUnderlineAnimation();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        if (v !== activeTab) tabAnimation.enableAnimation();
        // Mantiene el resto de params y solo cambia `tab`.
        const next = new URLSearchParams(searchParams);
        next.set("tab", v);
        setSearchParams(next, { replace: true });
      }}
      className="flex w-full min-w-0 flex-1 flex-col"
    >
      <div className={SECTION_UNDERLINE_TABS_ROW}>
        <TabsList className={SECTION_UNDERLINE_TABS_LIST} {...tabAnimation.containerProps}>
          <TabsTrigger value="rutinas" className={SECTION_UNDERLINE_TABS_TRIGGER}>
            Rutinas
          </TabsTrigger>
          <TabsTrigger value="ejercicios" className={SECTION_UNDERLINE_TABS_TRIGGER}>
            Ejercicios
          </TabsTrigger>
        </TabsList>
        <div id="desktop-section-toolbar-slot" className="flex shrink-0 items-center justify-end empty:hidden" />
      </div>

      <TabsContent value="rutinas" className={SECTION_TAB_PANEL}>
        <Suspense fallback={<RouteFallback />}>
          <Routines />
        </Suspense>
      </TabsContent>

      <TabsContent value="ejercicios" className={SECTION_TAB_PANEL}>
        <Suspense fallback={<RouteFallback />}>
          <Exercises />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

