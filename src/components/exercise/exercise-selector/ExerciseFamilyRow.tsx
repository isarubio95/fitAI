import { useEffect, useState } from "react";
import { Check, ChevronDown, Dumbbell, Info, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveExerciseMediaUrl } from "@/lib/exerciseMediaUrl";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";
import { MUSCLE_GROUP_ICON_SRC } from "@/constants/muscleGroups";
import type { ExerciseFamily } from "@/lib/exerciseVariants";
import { exerciseKey, type SelectorExercise } from "./types";

/** Variantes visibles al desplegar una familia antes de "Ver las N restantes". */
const PREVIEW_VARIANTS = 3;

function CheckIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-[7px] border transition-colors",
        checked
          ? "border-primary/60 bg-primary-solid text-primary-foreground"
          : "border-border/70 bg-transparent",
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 stroke-[2.5px]" />}
    </span>
  );
}

function ExerciseThumb({ exercise }: { exercise: SelectorExercise }) {
  const mediaUrl = resolveExerciseMediaUrl(exercise.gif_url || exercise.imagen);
  const mainGroup = resolveMainMuscleGroup(exercise.grupo_muscular);

  if (mediaUrl) {
    return (
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white">
        <img
          src={mediaUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/45">
      {mainGroup ? (
        <img src={MUSCLE_GROUP_ICON_SRC[mainGroup]} alt="" className="h-7 w-7" draggable={false} />
      ) : (
        <Dumbbell className="h-4.5 w-4.5 text-muted-foreground/70" />
      )}
    </span>
  );
}

function InfoButton({ exercise, onClick }: { exercise: SelectorExercise; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Ver ficha de ${exercise.nombre}`}
      className="touch-styled inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors [@media(hover:hover)]:hover:bg-muted [@media(hover:hover)]:hover:text-foreground"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <Info className="h-4 w-4" />
    </button>
  );
}

export type ExerciseFamilyRowProps = {
  family: ExerciseFamily<SelectorExercise>;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  selectedKeys: Set<string>;
  onToggleSelect: (exercise: SelectorExercise) => void;
  onViewDetail: (exercise: SelectorExercise) => void;
  currentUserId?: string;
};

export function ExerciseFamilyRow({
  family,
  expanded,
  onExpandedChange,
  selectedKeys,
  onToggleSelect,
  onViewDetail,
  currentUserId,
}: ExerciseFamilyRowProps) {
  const [showAllVariants, setShowAllVariants] = useState(false);

  useEffect(() => {
    if (!expanded) setShowAllVariants(false);
  }, [expanded]);

  const selectedCount = family.variants.filter((v) => selectedKeys.has(exerciseKey(v.item))).length;

  // Familia de una sola variante: se selecciona directamente, sin desplegar.
  if (family.variants.length === 1) {
    const exercise = family.variants[0].item;
    const checked = selectedKeys.has(exerciseKey(exercise));
    const isOwn = !!currentUserId && exercise.usuario_id === currentUserId;
    const meta = [family.grupoMuscular, exercise.equipment].filter(Boolean).join(" · ");

    return (
      <div className="flex items-center gap-1 border-b border-border/40 pl-4 pr-2 sm:pl-6 sm:pr-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => onToggleSelect(exercise)}
          className="touch-styled flex min-w-0 flex-1 items-center gap-3 py-3 text-left outline-none focus:outline-none focus-visible:outline-none"
        >
          <ExerciseThumb exercise={exercise} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] leading-tight">{exercise.nombre}</span>
              {isOwn && <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </span>
            {meta && (
              <span className="mt-0.5 block truncate text-xs capitalize text-muted-foreground">
                {meta}
              </span>
            )}
          </span>
          <CheckIndicator checked={checked} />
        </button>
        <InfoButton exercise={exercise} onClick={() => onViewDetail(exercise)} />
      </div>
    );
  }

  const visibleVariants = showAllVariants
    ? family.variants
    : family.variants.slice(0, PREVIEW_VARIANTS);
  const remaining = family.variants.length - visibleVariants.length;

  return (
    <div className="border-b border-border/40">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        className="touch-styled flex w-full items-center gap-3 py-3 pl-4 pr-4 text-left outline-none focus:outline-none focus-visible:outline-none sm:pl-6 sm:pr-6"
      >
        <ExerciseThumb exercise={family.variants[0].item} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] leading-tight">{family.base}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {[family.grupoMuscular, `${family.variants.length} variantes`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        {selectedCount > 0 && (
          <span className="shrink-0 rounded-full bg-primary-solid px-1.75 text-[11px] font-semibold leading-5 text-primary-foreground">
            {selectedCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="pb-1.5">
          {visibleVariants.map(({ item, label }) => {
            const checked = selectedKeys.has(exerciseKey(item));
            const isOwn = !!currentUserId && item.usuario_id === currentUserId;
            return (
              <div
                key={item.id}
                className="flex items-center gap-1 pl-4 pr-2 sm:pl-6 sm:pr-4"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggleSelect(item)}
                  className="touch-styled flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-11 text-left outline-none focus:outline-none focus-visible:outline-none"
                >
                  <CheckIndicator checked={checked} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] leading-tight">{label}</span>
                      {isOwn && <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                    </span>
                    {item.equipment && (
                      <span className="mt-0.5 block truncate text-xs capitalize text-muted-foreground">
                        {item.equipment}
                      </span>
                    )}
                  </span>
                </button>
                <InfoButton exercise={item} onClick={() => onViewDetail(item)} />
              </div>
            );
          })}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setShowAllVariants(true)}
              // Alineado con el título de las variantes (sangría + checkbox + gap).
              className="touch-styled block py-2 pl-23.5 text-[13px] font-medium text-primary outline-none focus:outline-none focus-visible:outline-none sm:pl-25.5"
            >
              Ver las {remaining} restantes
            </button>
          )}
        </div>
      )}
    </div>
  );
}
