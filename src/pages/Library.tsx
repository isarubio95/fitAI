import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Routines from "@/pages/Routines";
import Exercises from "@/pages/Exercises";

const sectionPillTabsList =
  "hidden h-auto w-full justify-start gap-2 bg-transparent p-0 shadow-none md:flex md:max-w-2xl md:mx-auto md:px-8 md:pt-6";

const sectionPillTabsTrigger = cn(
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
  "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
  "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-sm",
);

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
      <TabsList className={sectionPillTabsList}>
        <TabsTrigger value="rutinas" className={sectionPillTabsTrigger}>
          Rutinas de Gimnasio
        </TabsTrigger>
        <TabsTrigger value="ejercicios" className={sectionPillTabsTrigger}>
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

