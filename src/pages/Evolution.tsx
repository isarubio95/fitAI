import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutHistory from "@/pages/WorkoutHistory"; 
import Measurements from "@/pages/Measurements";

export default function EvolutionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "history");

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tu Evolución</h1>
          <p className="text-sm text-muted-foreground">Historial y medidas corporales</p>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Entrenamientos</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
        </TabsList>
        
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