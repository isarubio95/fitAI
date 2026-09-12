import type { NavigateFunction } from "react-router-dom";

export const HEALTH_LOG_PATH = "/evolution";
export const HEALTH_LOG_SEARCH = "?tab=health";
export const HEALTH_LOG_NEW_STATE = { action: "new" as const };

export function openHealthLog(navigate: NavigateFunction) {
  navigate(
    { pathname: HEALTH_LOG_PATH, search: HEALTH_LOG_SEARCH },
    { state: HEALTH_LOG_NEW_STATE },
  );
}
