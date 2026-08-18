export const LYFTA_ORIGIN = "lyfta";
export const LYFTA_API_KEY_URL = "https://my.lyfta.app/community/api";

export type LyftaImportScope = "history" | "routines" | "both";

export type LyftaProxyResource =
  | "workouts"
  | "workouts_summary"
  | "templates"
  | "collections"
  | "exercises_library";

export type LyftaSet = {
  id?: string;
  weight?: string | number | null;
  reps?: string | number | null;
  rir?: string | number | null;
  duration?: string | number | null;
  distance?: string | number | null;
  set_type_id?: string | number | null;
  is_completed?: boolean | null;
};

export type LyftaExercise = {
  exercise_id?: string | number;
  excercise_name?: string;
  exercise_name?: string;
  name?: string;
  exercise_type?: string | null;
  exercise_rest_time?: number | string | null;
  exercise_superset_id?: number | string | null;
  sets?: LyftaSet[];
};

export type LyftaWorkout = {
  id?: string | number;
  title?: string | null;
  body_weight?: number | null;
  workout_perform_date?: string | null;
  workout_duration?: string | null;
  total_volume?: string | number | null;
  exercises?: LyftaExercise[];
};

export type LyftaWorkoutsPage = {
  status?: boolean;
  count?: number;
  total_records?: number;
  total_pages?: number;
  current_page?: number;
  limit?: number;
  workouts?: LyftaWorkout[];
};

export type LyftaWorkoutSummary = {
  id?: string | number;
  title?: string | null;
  description?: string | null;
  workout_duration?: string | null;
  total_volume?: string | number | null;
  workout_perform_date?: string | null;
};
