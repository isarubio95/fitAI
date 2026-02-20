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
    <div className="container mx-auto pb-24 pt-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Tu Evolución</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
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