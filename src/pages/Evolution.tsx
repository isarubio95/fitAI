import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import WorkoutHistory from "@/pages/WorkoutHistory"; 
import Measurements from "@/pages/Measurements";

export default function EvolutionPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "history";

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value="history" className="mt-0">
        <WorkoutHistory /> 
      </TabsContent>
      
      <TabsContent value="measurements" className="mt-0">
        <Measurements /> 
      </TabsContent>
    </Tabs>
  );
}
