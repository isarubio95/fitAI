import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import WorkoutHistory from "@/pages/WorkoutHistory"; 
import Measurements from "@/pages/Measurements";

export default function EvolutionPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "history");

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* HEADER INTEGRADO */}
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar — solo visible en md+ para no duplicar el del header móvil fijo */}
          <div className="hidden md:block">
            <ProfileDrawer />
          </div>

          {/* Pills */}
          <TabsList className="flex bg-transparent h-auto p-0 gap-2 justify-start w-auto">
            <TabsTrigger
              value="history"
              className="rounded-full px-4 py-2 h-auto text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none bg-secondary/50 text-foreground hover:bg-secondary border border-transparent data-[state=inactive]:border-border"
            >
              Entrenamientos
            </TabsTrigger>
            <TabsTrigger
              value="measurements"
              className="rounded-full px-4 py-2 h-auto text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none bg-secondary/50 text-foreground hover:bg-secondary border border-transparent data-[state=inactive]:border-border"
            >
              Medidas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENIDO */}
        <TabsContent value="history" className="mt-0">
          <WorkoutHistory />
        </TabsContent>

        <TabsContent value="measurements" className="mt-0">
          <Measurements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
