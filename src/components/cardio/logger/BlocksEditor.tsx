import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/cardio/logger/FormField";
import { sectionCardClass } from "@/components/cardio/logger/constants";
import type { CardioBlockInput } from "@/types/cardio";

type BlocksEditorProps = {
  bloques: CardioBlockInput[];
  showCyclingMetrics: boolean;
  onAddBlock: () => void;
  onRemoveBlock: (idx: number) => void;
  onUpdateBlock: (idx: number, patch: Partial<CardioBlockInput>) => void;
};

export function BlocksEditor({
  bloques,
  showCyclingMetrics,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
}: BlocksEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Segmentos / bloques</p>
        <Button type="button" variant="outline" size="sm" onClick={onAddBlock}>
          <Plus className="mr-1 h-4 w-4" /> Añadir bloque
        </Button>
      </div>
      {bloques.map((bloque, idx) => (
        <div key={idx} className={sectionCardClass}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField id={`bloque-${idx}-tipo`} label="Tipo">
              <Input
                id={`bloque-${idx}-tipo`}
                className="h-12"
                value={bloque.tipo_bloque}
                onChange={(e) => onUpdateBlock(idx, { tipo_bloque: e.target.value })}
                placeholder="work, descanso…"
              />
            </FormField>
            {!showCyclingMetrics ? (
              <>
                <FormField id={`bloque-${idx}-dist`} label="Distancia (m)">
                  <Input
                    id={`bloque-${idx}-dist`}
                    className="h-12"
                    type="number"
                    value={bloque.distancia_m ?? ""}
                    onChange={(e) =>
                      onUpdateBlock(idx, { distancia_m: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id={`bloque-${idx}-dur`} label="Duración (s)">
                  <Input
                    id={`bloque-${idx}-dur`}
                    className="h-12"
                    type="number"
                    value={bloque.duracion_seg ?? ""}
                    onChange={(e) =>
                      onUpdateBlock(idx, { duracion_seg: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Opcional"
                  />
                </FormField>
              </>
            ) : null}
            <FormField id={`bloque-${idx}-fcm`} label="FC media">
              <Input
                id={`bloque-${idx}-fcm`}
                className="h-12"
                type="number"
                value={bloque.fc_media ?? ""}
                onChange={(e) => onUpdateBlock(idx, { fc_media: e.target.value ? Number(e.target.value) : null })}
                placeholder="Opcional"
              />
            </FormField>
            <FormField id={`bloque-${idx}-fcmx`} label="FC max">
              <Input
                id={`bloque-${idx}-fcmx`}
                className="h-12"
                type="number"
                value={bloque.fc_max ?? ""}
                onChange={(e) => onUpdateBlock(idx, { fc_max: e.target.value ? Number(e.target.value) : null })}
                placeholder="Opcional"
              />
            </FormField>
            <FormField id={`bloque-${idx}-kcal`} label="Calorías (kcal)">
              <Input
                id={`bloque-${idx}-kcal`}
                className="h-12"
                type="number"
                value={bloque.calorias ?? ""}
                onChange={(e) => onUpdateBlock(idx, { calorias: e.target.value ? Number(e.target.value) : null })}
                placeholder="Opcional"
              />
            </FormField>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveBlock(idx)}
            disabled={bloques.length === 1}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Eliminar bloque
          </Button>
        </div>
      ))}
    </div>
  );
}
