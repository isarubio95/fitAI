import { Input } from "@/components/ui/input";
import { FormField } from "@/components/cardio/logger/FormField";
import { sectionCardClass } from "@/components/cardio/logger/constants";

type RunningMetricsSectionProps = {
  ritmo: string;
  onRitmoChange: (value: string) => void;
  cadencia: string;
  onCadenciaChange: (value: string) => void;
  desnivel: string;
  onDesnivelChange: (value: string) => void;
  zancada: string;
  onZancadaChange: (value: string) => void;
};

export function RunningMetricsSection({
  ritmo,
  onRitmoChange,
  cadencia,
  onCadenciaChange,
  desnivel,
  onDesnivelChange,
  zancada,
  onZancadaChange,
}: RunningMetricsSectionProps) {
  return (
    <div className={sectionCardClass}>
      <p className="text-sm font-semibold">Métricas opcionales</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="run-ritmo" label="Ritmo medio (seg/km)">
          <Input
            id="run-ritmo"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={ritmo}
            onChange={(e) => onRitmoChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="run-cadencia" label="Cadencia media (pasos/min)">
          <Input
            id="run-cadencia"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={cadencia}
            onChange={(e) => onCadenciaChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="run-desnivel" label="Desnivel positivo (m)">
          <Input
            id="run-desnivel"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={desnivel}
            onChange={(e) => onDesnivelChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
        <FormField id="run-zancada" label="Zancada media (cm)">
          <Input
            id="run-zancada"
            className="h-12"
            type="number"
            inputMode="decimal"
            value={zancada}
            onChange={(e) => onZancadaChange(e.target.value)}
            placeholder="Opcional"
          />
        </FormField>
      </div>
    </div>
  );
}
