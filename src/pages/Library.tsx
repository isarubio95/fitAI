import { useSearchParams } from "react-router-dom";
import {
  SECTION_UNDERLINE_TABS_LIST,
  SECTION_UNDERLINE_TABS_ROW,
  SECTION_UNDERLINE_TABS_TRIGGER,
} from "@/lib/pageStyles";
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
      className="flex w-full min-w-0 flex-1 flex-col"
    >
      <div className={SECTION_UNDERLINE_TABS_ROW}>
        <TabsList className={SECTION_UNDERLINE_TABS_LIST}>
          <TabsTrigger value="rutinas" className={SECTION_UNDERLINE_TABS_TRIGGER}>
            Rutinas
          </TabsTrigger>
          <TabsTrigger value="ejercicios" className={SECTION_UNDERLINE_TABS_TRIGGER}>
            Ejercicios
          </TabsTrigger>
        </TabsList>
        <div id="desktop-section-toolbar-slot" className="flex shrink-0 items-center justify-end empty:hidden" />
      </div>

      <TabsContent value="rutinas" className="mt-0 flex flex-1 flex-col data-[state=inactive]:hidden">
        <Routines />
      </TabsContent>

      <TabsContent value="ejercicios" className="mt-0 flex flex-1 flex-col data-[state=inactive]:hidden">
        <Exercises />
      </TabsContent>
    </Tabs>
  );
}

