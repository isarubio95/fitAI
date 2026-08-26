export * from "./constants";
export * from "./strengthImpulse";
export * from "./cardioImpulse";
export * from "./sessionLoad";
export * from "./form";
export * from "./recovery";
export * from "./banister";
export * from "./localMuscle";

import { differenceInYears, parseISO } from "date-fns";
import { estimateMaxHeartRate } from "@/lib/heartRateMetrics";
import { DEFAULT_RESTING_HR } from "./constants";

export type PhysioProfile = {
  fecha_nacimiento?: string | null;
  fc_max?: number | null;
  fc_reposo?: number | null;
  ftp_w?: number | null;
};

export function ageYearsFromBirthDate(fechaNacimiento?: string | null): number | null {
  if (!fechaNacimiento) return null;
  try {
    const dob = parseISO(fechaNacimiento.length === 10 ? `${fechaNacimiento}T00:00:00` : fechaNacimiento);
    const age = differenceInYears(new Date(), dob);
    if (!Number.isFinite(age) || age < 10 || age > 100) return null;
    return age;
  } catch {
    return null;
  }
}

export function resolveMaxHeartRate(profile?: PhysioProfile | null): number {
  if (profile?.fc_max != null && profile.fc_max > 0) return profile.fc_max;
  return estimateMaxHeartRate(ageYearsFromBirthDate(profile?.fecha_nacimiento));
}

export function resolveRestingHeartRate(profile?: PhysioProfile | null): number {
  if (profile?.fc_reposo != null && profile.fc_reposo > 0) return profile.fc_reposo;
  return DEFAULT_RESTING_HR;
}
