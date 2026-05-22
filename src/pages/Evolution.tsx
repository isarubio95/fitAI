import { useSearchParams } from "react-router-dom";
import { filterPillTabsTrigger } from "@/lib/filter-pill-styles";
import { SECTION_PILLS_LIST, SECTION_PILLS_ROW } from "@/lib/pageStyles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutHistory from "@/pages/WorkoutHistory";
import Measurements from "@/pages/Measurements";

export default function EvolutionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "history";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        const next = new URLSearchParams(searchParams);
        next.set("tab", v);
        setSearchParams(next, { replace: true });
      }}
      className="w-full min-w-0"
    >
      <div className={SECTION_PILLS_ROW}>
        <TabsList className={SECTION_PILLS_LIST}>
          <TabsTrigger value="history" className={filterPillTabsTrigger}>
            Entrenos
          </TabsTrigger>
          <TabsTrigger value="measurements" className={filterPillTabsTrigger}>
            Medidas
          </TabsTrigger>
        </TabsList>
        <div id="desktop-section-toolbar-slot" className="flex shrink-0 items-center gap-2" />
      </div>

      <TabsContent value="history" className="mt-0">
        <WorkoutHistory />
      </TabsContent>

      <TabsContent value="measurements" className="mt-0">
        <Measurements />
      </TabsContent>
    </Tabs>
  );
}
