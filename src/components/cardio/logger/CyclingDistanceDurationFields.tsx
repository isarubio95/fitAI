import { Input } from "@/components/ui/input";
import { FormField } from "@/components/cardio/logger/FormField";

type CyclingDistanceDurationFieldsProps = {
  distanciaKm: string;
  onDistanciaKmChange: (value: string) => void;
  durHoras: string;
  onDurHorasChange: (value: string) => void;
  durMinutos: string;
  onDurMinutosChange: (value: string) => void;
  durSegundos: string;
  onDurSegundosChange: (value: string) => void;
};

export function CyclingDistanceDurationFields({
  distanciaKm,
  onDistanciaKmChange,
  durHoras,
  onDurHorasChange,
  durMinutos,
  onDurMinutosChange,
  durSegundos,
  onDurSegundosChange,
}: CyclingDistanceDurationFieldsProps) {
  return (
    <>
      <div className="col-span-2 sm:col-span-1">
        <FormField id="cyc-distancia" label="Distancia (km)">
          <Input
            id="cyc-distancia"
            className="h-12"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.001"
            value={distanciaKm}
            onChange={(e) => onDistanciaKmChange(e.target.value)}
            placeholder="Obligatorio"
            required
          />
        </FormField>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <FormField label="Duración">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Input
                id="cyc-dur-h"
                className="h-12"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={durHoras}
                onChange={(e) => onDurHorasChange(e.target.value)}
                placeholder="0"
                aria-label="Horas"
              />
              <p className="text-center text-[11px] text-muted-foreground">h</p>
            </div>
            <div className="space-y-1">
              <Input
                id="cyc-dur-m"
                className="h-12"
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                step={1}
                value={durMinutos}
                onChange={(e) => onDurMinutosChange(e.target.value)}
                placeholder="0"
                aria-label="Minutos"
              />
              <p className="text-center text-[11px] text-muted-foreground">min</p>
            </div>
            <div className="space-y-1">
              <Input
                id="cyc-dur-s"
                className="h-12"
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                step={1}
                value={durSegundos}
                onChange={(e) => onDurSegundosChange(e.target.value)}
                placeholder="0"
                aria-label="Segundos"
              />
              <p className="text-center text-[11px] text-muted-foreground">s</p>
            </div>
          </div>
        </FormField>
      </div>
    </>
  );
}
