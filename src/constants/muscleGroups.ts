export const MUSCLE_GROUPS = {
  Pecho: ["Pectoral Superior", "Pectoral Medio", "Pectoral Inferior"],
  Espalda: ["Dorsal", "Trapecio", "Romboides", "Infraespinoso", "Redondo Mayor", "Erector Espinal"],
  Hombro: ["Deltoides Anterior", "Deltoides Lateral", "Deltoides Posterior"],
  Bíceps: ["Bíceps Largo", "Bíceps Corto", "Braquial"],
  Tríceps: ["Tríceps Largo", "Tríceps Lateral", "Tríceps Medial"],
  Antebrazo: ["Flexores del Antebrazo", "Extensores del Antebrazo", "Braquiorradial"],
  Cuádriceps: ["Vasto Lateral", "Vasto Medial", "Vasto Intermedio", "Recto Femoral"],
  Femoral: ["Bíceps Femoral", "Semitendinoso", "Semimembranoso"],
  Glúteo: ["Glúteo Mayor", "Glúteo Medio", "Glúteo Menor"],
  Pantorrilla: ["Gastrocnemio", "Sóleo"],
  Core: ["Recto Abdominal", "Oblicuo Externo", "Oblicuo Interno", "Transverso Abdominal"],
} as const;

export type MainMuscleGroup = keyof typeof MUSCLE_GROUPS;

/** Iconos anatómicos (Lyfta) por grupo muscular principal. */
export const MUSCLE_GROUP_ICON_SRC: Record<MainMuscleGroup, string> = {
  Pecho: "/iconos/lyfta-muscles/chest.svg",
  Espalda: "/iconos/lyfta-muscles/back.svg",
  Hombro: "/iconos/lyfta-muscles/shoulders.svg",
  Bíceps: "/iconos/lyfta-muscles/biceps.svg",
  Tríceps: "/iconos/lyfta-muscles/triceps.svg",
  Antebrazo: "/iconos/lyfta-muscles/forearms.svg",
  Cuádriceps: "/iconos/lyfta-muscles/quadriceps.svg",
  Femoral: "/iconos/lyfta-muscles/hamstrings.svg",
  Glúteo: "/iconos/lyfta-muscles/hips.svg",
  Pantorrilla: "/iconos/lyfta-muscles/calves.svg",
  Core: "/iconos/lyfta-muscles/waist.svg",
};

export type SpecificMuscle = (typeof MUSCLE_GROUPS)[MainMuscleGroup][number];

/** Flat list of all specific muscles */
export const ALL_MUSCLES: SpecificMuscle[] = Object.values(MUSCLE_GROUPS).flat() as SpecificMuscle[];
