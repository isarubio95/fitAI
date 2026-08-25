import { useSearchParams } from "react-router-dom";
import { SECTION_UNDERLINE_TABS_LIST, sectionUnderlineTabClass } from "@/lib/pageStyles";
import { useSectionTabUnderlineAnimation } from "@/hooks/useSectionTabUnderlineAnimation";
import { useOptimisticTab } from "@/hooks/useOptimisticTab";
import { cn } from "@/lib/utils";

export type HeaderSectionTab = { value: string; label: string };

/**
 * Pestañas de sección de la cabecera móvil (Tú, Biblioteca).
 *
 * Vive en su propio componente a propósito: el adelanto de la pestaña activa es
 * una actualización urgente, y si el estado estuviese en `AppLayout` cada toque
 * re-renderizaría de forma síncrona el `Outlet` entero (es decir, el panel que
 * estamos a punto de abandonar) antes de empezar a montar el nuevo.
 */
export function HeaderSectionTabs({
  tabs,
  activeTab,
}: {
  tabs: readonly HeaderSectionTab[];
  activeTab: string;
}) {
  const [, setSearchParams] = useSearchParams();
  const animation = useSectionTabUnderlineAnimation();
  const [shownTab, setShownTab] = useOptimisticTab(activeTab);

  return (
    <div
      className={cn(SECTION_UNDERLINE_TABS_LIST, "-mx-4 w-[calc(100%+2rem)]")}
      {...animation.containerProps}
    >
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          data-active={shownTab === value ? "true" : undefined}
          onClick={() => {
            if (shownTab !== value) animation.enableAnimation();
            setShownTab(value);
            setSearchParams({ tab: value });
          }}
          className={sectionUnderlineTabClass(shownTab === value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
