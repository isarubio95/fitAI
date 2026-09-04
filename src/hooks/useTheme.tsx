import { createContext, useContext, useEffect, useState } from "react";
import { Capacitor, SystemBars, SystemBarsStyle, SystemBarType } from "@capacitor/core";

type Theme = "dark" | "light" | "system";

/** Equivalente hex de `--background` (`src/index.css`) en cada esquema. */
const APP_BACKGROUND_COLOR = {
  light: "#ecece9",
  dark: "#0c0c0b",
} as const;

/** Color de acento/primario: verde (logo), naranja, amarillo, rosa, azul */
export type AccentColor = "green" | "orange" | "yellow" | "pink" | "blue";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  accentColor: "green",
  setAccentColor: () => {},
});

const STORAGE_KEY = "vite-ui-theme";
const ACCENT_STORAGE_KEY = "vite-ui-accent";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Alinea el contenido de las barras de sistema con el tema *de la app*, no con
 * el del dispositivo. Sin esto, el default `DEFAULT` de Capacitor sigue al
 * sistema: con la app en oscuro y el móvil en claro salen iconos negros sobre
 * el header negro. `SystemBars` viene en `@capacitor/core` (no-op en web).
 *
 * Nota: `SystemBarsStyle.Dark` describe el *fondo*, así que pinta el contenido
 * en claro — es el que corresponde al tema oscuro de la app.
 */
function applySystemBarsStyle(resolved: "dark" | "light") {
  if (!Capacitor.isNativePlatform()) return;
  const style = resolved === "dark" ? SystemBarsStyle.Dark : SystemBarsStyle.Light;
  void SystemBars.setStyle({ bar: SystemBarType.StatusBar, style }).catch(() => {});
  void SystemBars.setStyle({ bar: SystemBarType.NavigationBar, style }).catch(() => {});
}

/** Mantiene `<meta name="theme-color">` en sintonía con el tema elegido en la app. */
function applyThemeColorMeta(resolved: "dark" | "light") {
  const color = APP_BACKGROUND_COLOR[resolved];
  // Los meta con `media` los resuelve el navegador según el esquema del sistema,
  // así que los retiramos y dejamos uno solo que refleje la elección del usuario.
  document.querySelectorAll('meta[name="theme-color"][media]').forEach((el) => el.remove());
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = color;
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  applySystemBarsStyle(resolved);
  applyThemeColorMeta(resolved);
}

function applyAccentColor(color: AccentColor) {
  document.documentElement.setAttribute("data-accent", color);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? "dark";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;
    if (stored && ["green", "orange", "yellow", "pink", "blue"].includes(stored)) return stored;
    return "green";
  });

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  const setAccentColor = (c: AccentColor) => {
    localStorage.setItem(ACCENT_STORAGE_KEY, c);
    setAccentColorState(c);
  };

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
