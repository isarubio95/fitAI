import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Routines from "@/pages/Routines";
import Exercises from "@/pages/Exercises";

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "rutinas";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        // Mantiene el resto de params y solo cambia `tab`.
        const next = new URLSearchParams(searchParams);
        next.set("tab", v);
        setSearchParams(next, { replace: true });
      }}
      className="w-full min-w-0"
    >
      {/* En móvil los pills se muestran en el header (igual que Evolución). */}
      <TabsList className="hidden md:flex w-full justify-start max-w-[720px] mx-auto">
        <TabsTrigger value="rutinas" className="flex-1 sm:flex-none">
          Rutinas
        </TabsTrigger>
        <TabsTrigger value="ejercicios" className="flex-1 sm:flex-none">
          Ejercicios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rutinas" className="mt-0">
        <Routines />
      </TabsContent>

      <TabsContent value="ejercicios" className="mt-0">
        <Exercises />
      </TabsContent>
    </Tabs>
  );
}

