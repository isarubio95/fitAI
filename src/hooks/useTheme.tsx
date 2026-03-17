import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

/** Color de acento/primario: verde (logo), naranja, amarillo, rosa */
export type AccentColor = "green" | "orange" | "yellow" | "pink";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  accentColor: "green",
  setAccentColor: () => {},
});

const STORAGE_KEY = "vite-ui-theme";
const ACCENT_STORAGE_KEY = "vite-ui-accent";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function applyAccentColor(color: AccentColor) {
  document.documentElement.setAttribute("data-accent", color);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? "system";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;
    if (stored && ["green", "orange", "yellow", "pink"].includes(stored)) return stored;
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
