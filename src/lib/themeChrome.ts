/**
 * Equivalente hex de `--background` / `--background-fill` (`src/index.css`).
 * `theme-color`, el manifest PWA y el splash nativo no pueden leer el token CSS.
 * Si cambias el HSL, actualiza también `index.html` y `android/.../colors.xml`.
 */
export const APP_BACKGROUND_HEX = {
  light: "#ecece9",
  dark: "#0c0c0b",
} as const;
