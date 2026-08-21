import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SECTION_UNDERLINE_TABS_LIST,
  SECTION_UNDERLINE_TABS_ROW,
  SECTION_UNDERLINE_TABS_TRIGGER,
} from "@/lib/pageStyles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YOU_TABS, YOU_TAB_LABELS, normalizeYouTab, youTabNeedsRedirect } from "@/lib/youPageTabs";
import WorkoutHistory from "@/pages/WorkoutHistory";
import YouHealth from "@/pages/YouHealth";
import YouActivities from "@/pages/YouActivities";

export default function EvolutionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = normalizeYouTab(rawTab);

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
        const next = new URLSearchParams(searchParams);
        next.set("tab", v);
        setSearchParams(next, { replace: true });
      }}
      className="flex w-full min-w-0 flex-1 flex-col"
    >
      <div className={SECTION_UNDERLINE_TABS_ROW}>
        <TabsList className={SECTION_UNDERLINE_TABS_LIST}>
          {YOU_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className={SECTION_UNDERLINE_TABS_TRIGGER}>
              {YOU_TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        <div id="desktop-section-toolbar-slot" className="flex shrink-0 items-center justify-end empty:hidden" />
      </div>

      <TabsContent value="progress" className="mt-0 flex flex-1 flex-col data-[state=inactive]:hidden">
        <WorkoutHistory />
      </TabsContent>

      <TabsContent value="health" className="mt-0 flex flex-1 flex-col data-[state=inactive]:hidden">
        <YouHealth />
      </TabsContent>

      <TabsContent value="activities" className="mt-0 flex flex-1 flex-col data-[state=inactive]:hidden">
        <YouActivities />
      </TabsContent>
    </Tabs>
  );
}
