import { Palette } from "lucide-react";
import { useTheme, type AccentColor } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const ACCENT_OPTIONS: { value: AccentColor; label: string; className: string }[] = [
  { value: "green", label: "Verde", className: "bg-[hsl(142,71%,45%)]" },
  { value: "orange", label: "Naranja", className: "bg-[hsl(24,95%,48%)]" },
  { value: "yellow", label: "Amarillo", className: "bg-[hsl(38,92%,42%)]" },
  { value: "pink", label: "Rosa", className: "bg-[hsl(330,72%,50%)]" },
  { value: "blue", label: "Azul", className: "bg-[hsl(215,92%,54%)]" },
];

export function ColorThemeSelector() {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" /> Color de acento
      </p>
      <div className="flex flex-wrap gap-2 px-1">
        {ACCENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAccentColor(opt.value)}
            className={cn(
              "size-9 rounded-full border-2 transition-all shrink-0",
              opt.className,
              accentColor === opt.value
                ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110"
                : "border-transparent hover:scale-105 hover:opacity-90"
            )}
            title={opt.label}
            aria-label={`Usar tema ${opt.label}`}
            aria-pressed={accentColor === opt.value}
          />
        ))}
      </div>
    </div>
  );
}
