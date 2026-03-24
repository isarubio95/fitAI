import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutHistory from "@/pages/WorkoutHistory";
import Measurements from "@/pages/Measurements";

const sectionPillTabsList =
  "hidden h-auto w-full justify-start gap-2 bg-transparent p-0 shadow-none md:flex md:max-w-2xl md:mx-auto md:px-8 md:pt-6";

const sectionPillTabsTrigger = cn(
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
  "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
  "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-sm",
);

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
      <TabsList className={sectionPillTabsList}>
        <TabsTrigger value="history" className={sectionPillTabsTrigger}>
          Entrenos
        </TabsTrigger>
        <TabsTrigger value="measurements" className={sectionPillTabsTrigger}>
          Medidas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-0">
        <WorkoutHistory />
      </TabsContent>

      <TabsContent value="measurements" className="mt-0">
        <Measurements />
      </TabsContent>
    </Tabs>
  );
}
