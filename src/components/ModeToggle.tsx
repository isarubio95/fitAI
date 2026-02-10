import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const cycle: Array<"dark" | "light" | "system"> = ["dark", "light", "system"];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const next = () => {
    const i = cycle.indexOf(theme);
    setTheme(cycle[(i + 1) % cycle.length]);
  };

  return (
    <Button variant="outline" size="icon" onClick={next} className="relative overflow-hidden">
      <Sun className={`h-5 w-5 absolute transition-all duration-300 ${theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`} />
      <Moon className={`h-5 w-5 absolute transition-all duration-300 ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
      <Monitor className={`h-5 w-5 absolute transition-all duration-300 ${theme === "system" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`} />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
