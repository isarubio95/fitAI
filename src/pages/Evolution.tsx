import { Suspense, lazy, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SECTION_UNDERLINE_TABS_LIST,
  SECTION_UNDERLINE_TABS_ROW,
  SECTION_TAB_PANEL,
  SECTION_UNDERLINE_TABS_TRIGGER,
} from "@/lib/pageStyles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSectionTabUnderlineAnimation } from "@/hooks/useSectionTabUnderlineAnimation";
import { YOU_TABS, YOU_TAB_LABELS, normalizeYouTab, youTabNeedsRedirect } from "@/lib/youPageTabs";
import { RouteFallback } from "@/components/layout/RouteFallback";

// Estáticos, Evolution arrastraba las tres subpantallas (con recharts) aunque
// el usuario solo abriera una.
const WorkoutHistory = lazy(() => import("@/pages/WorkoutHistory"));
const YouHealth = lazy(() => import("@/pages/YouHealth"));
const YouActivities = lazy(() => import("@/pages/YouActivities"));

export default function EvolutionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = normalizeYouTab(rawTab);
  const tabAnimation = useSectionTabUnderlineAnimation();

  useEffect(() => {
    if (!youTabNeedsRedirect(rawTab)) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", activeTab);
    setSearchParams(next, { replace: true });
  }, [rawTab, activeTab, searchParams, setSearchParams]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        if (v !== activeTab) tabAnimation.enableAnimation();
        const next = new URLSearchParams(searchParams);
        next.set("tab", v);
        setSearchParams(next, { replace: true });
      }}
      className="flex w-full min-w-0 flex-1 flex-col"
    >
      <div className={SECTION_UNDERLINE_TABS_ROW}>
        <TabsList className={SECTION_UNDERLINE_TABS_LIST} {...tabAnimation.containerProps}>
          {YOU_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className={SECTION_UNDERLINE_TABS_TRIGGER}>
              {YOU_TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        <div id="desktop-section-toolbar-slot" className="flex shrink-0 items-center justify-end empty:hidden" />
      </div>

      <TabsContent value="progress" className={SECTION_TAB_PANEL}>
        <Suspense fallback={<RouteFallback />}>
          <WorkoutHistory />
        </Suspense>
      </TabsContent>

      <TabsContent value="health" className={SECTION_TAB_PANEL}>
        <Suspense fallback={<RouteFallback />}>
          <YouHealth />
        </Suspense>
      </TabsContent>

      <TabsContent value="activities" className={SECTION_TAB_PANEL}>
        <Suspense fallback={<RouteFallback />}>
          <YouActivities />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
