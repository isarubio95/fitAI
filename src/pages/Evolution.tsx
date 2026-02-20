import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importarías aquí el contenido de tus páginas anteriores
import WorkoutHistory from "@/pages/WorkoutHistory"; 
import Measurements from "@/pages/Measurements";

export default function EvolutionPage() {
  return (
    <div className="container mx-auto pb-24 pt-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Tu Evolución</h1>
      
      <Tabs defaultValue="history" className="w-full">
        {/* Los botones de navegación entre pestañas */}
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="history">Entrenamientos</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
        </TabsList>
        
        {/* El contenido de cada pestaña */}
        <TabsContent value="history" className="mt-0">
          <WorkoutHistory /> 
          {/* O simplemente el contenido que tenías en la página de Historial */}
        </TabsContent>
        
        <TabsContent value="measurements" className="mt-0">
          <Measurements /> 
          {/* O el contenido que tenías en la página de Medidas */}
        </TabsContent>
      </Tabs>
    </div>
  );
}