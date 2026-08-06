import { Input } from "@/components/ui/input";
import { FormField } from "@/components/cardio/logger/FormField";
import { sectionCardClass } from "@/components/cardio/logger/constants";

type CyclingMetricsSectionProps = {
  potenciaMedia: string;
  onPotenciaMediaChange: (value: string) => void;
  potenciaNp: string;
  onPotenciaNpChange: (value: string) => void;
  cadencia: string;
  onCadenciaChange: (value: string) => void;
  desnivel: string;
  onDesnivelChange: (value: string) => void;
  tipoBici: string;
  onTipoBiciChange: (value: string) => void;
};

export function CyclingMetricsSection({
  potenciaMedia,
  onPotenciaMediaChange,
  potenciaNp,
  onPotenciaNpChange,
  cadencia,
  onCadenciaChange,
  desnivel,
  onDesnivelChange,
  tipoBici,
  onTipoBiciChange,
}: CyclingMetricsSectionProps) {
  return (
    <div className={sectionCardClass}>
      <p className="text-sm font-semibold">Métricas opcionales</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="cyc-pot" label="Potencia media (W)">
          <Input
            id="cyc-pot"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={potenciaMedia}
            onChange={(e) => onPotenciaMediaChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="cyc-np" label="Potencia normalizada (W)">
          <Input
            id="cyc-np"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={potenciaNp}
            onChange={(e) => onPotenciaNpChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="cyc-cad" label="Cadencia media (rpm)">
          <Input
            id="cyc-cad"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={cadencia}
            onChange={(e) => onCadenciaChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="cyc-desnivel" label="Desnivel positivo (m)">
          <Input
            id="cyc-desnivel"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={desnivel}
            onChange={(e) => onDesnivelChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="cyc-bici" label="Tipo de bici" className="sm:col-span-2">
          <Input
            id="cyc-bici"
            className="h-12"
            value={tipoBici}
            onChange={(e) => onTipoBiciChange(e.target.value)}
            placeholder="Ruta, MTB, rodillo..."
          />
        </FormField>
      </div>
    </div>
  );
}
