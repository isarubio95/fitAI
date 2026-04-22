import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, Filter, Layers, Loader2, Search, SignalMedium, User, Wrench, X } from "lucide-react";

const exercisePageComponents = [
  "AlertDialog + subcomponentes",
  "Badge",
  "Button",
  "CTA",
  "Card / CardContent",
  "Command + subcomponentes",
  "Dialog + subcomponentes",
  "DifficultyBars (demo)",
  "DifficultyBarsMono (demo)",
  "DropdownMenu + subcomponentes",
  "Filter (icono)",
  "Input",
  "Label",
  "Layers (icono)",
  "Loader2 (icono)",
  "Popover + subcomponentes",
  "Search (icono)",
  "Select + subcomponentes",
  "SignalMedium (icono)",
  "Skeleton",
  "Textarea",
  "User (icono)",
  "Wrench (icono)",
  "X (icono)",
  "ExerciseDetailSheet (depende de datos reales)",
  "MuscleMultiSelect (depende de datos reales)",
] as const;

type PaletteColor = {
  name: string;
  h: number;
  s: number;
  l: number;
};

const lightPalette: PaletteColor[] = [
  { name: "Background", h: 220, s: 16, l: 89 },
  { name: "Foreground", h: 224, s: 71, l: 4 },
  { name: "Card", h: 220, s: 14, l: 97 },
  { name: "Primary", h: 142, s: 71, l: 45 },
  { name: "Secondary", h: 220, s: 14, l: 84 },
  { name: "Muted", h: 220, s: 14, l: 84 },
  { name: "Accent", h: 142, s: 71, l: 45 },
  { name: "Destructive", h: 0, s: 84, l: 60 },
  { name: "Border", h: 220, s: 9, l: 82 },
];

const darkPalette: PaletteColor[] = [
  { name: "Background", h: 224, s: 71, l: 4 },
  { name: "Foreground", h: 210, s: 20, l: 92 },
  { name: "Card", h: 222, s: 47, l: 8 },
  { name: "Primary", h: 142, s: 71, l: 45 },
  { name: "Secondary", h: 217, s: 33, l: 14 },
  { name: "Muted", h: 217, s: 33, l: 14 },
  { name: "Accent", h: 142, s: 71, l: 45 },
  { name: "Destructive", h: 0, s: 63, l: 31 },
  { name: "Border", h: 217, s: 33, l: 18 },
];

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const lig = l / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lig - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function PaletteGrid({ title, colors, dark = false }: { title: string; colors: PaletteColor[]; dark?: boolean }) {
  return (
    <section className="rounded-xl bg-zinc-50 p-4 text-zinc-900">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => {
          const hex = hslToHex(color.h, color.s, color.l);
          return (
            <article key={`${title}-${color.name}`} className="rounded-lg bg-white p-2">
              <div
                className="mb-2 h-16 w-full rounded-md border border-black/10"
                style={{ backgroundColor: hex }}
              />
              <p className="font-semibold">{color.name}</p>
              <p className="text-zinc-600">{hex}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreviewRow({ index, name }: { index: number; name: (typeof exercisePageComponents)[number] }) {
  const rowRef = useRef<HTMLLIElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const getFileSafeName = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleDownloadComponentPng = async () => {
    if (!rowRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(rowRef.current, {
        cacheBust: true,
        pixelRatio: Math.max(window.devicePixelRatio || 1, 4),
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `component-${String(index + 1).padStart(2, "0")}-${getFileSafeName(name)}.png`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <li ref={rowRef} className="grid grid-cols-[32px_1fr] items-start gap-3 rounded bg-white p-3">
      <span className="font-semibold">{index + 1}.</span>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">{name}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadComponentPng}
            disabled={isExporting}
          >
            {isExporting ? "Generando..." : "Descargar PNG"}
          </Button>
        </div>

        {name === "AlertDialog + subcomponentes" && (
          <div className="max-w-md rounded p-2 space-y-2">
            <Button variant="outline" size="sm">Abrir AlertDialog</Button>
            <p className="text-muted-foreground">Preview segura: se evita abrir el modal para no tapar la pagina.</p>
            <div className="rounded border border-gray-300 p-2">
              <p className="font-semibold">Titulo de alerta</p>
              <p className="text-muted-foreground">Descripcion de ejemplo.</p>
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm">Cancelar</Button>
                <Button size="sm">Confirmar</Button>
              </div>
            </div>
          </div>
        )}

        {name === "Badge" && <Badge variant="secondary">Etiqueta de muestra</Badge>}

        {name === "Button" && <Button variant="outline">Boton de muestra</Button>}
        {name === "CTA" && <Button className="bg-primary text-primary-foreground">Comenzar ahora</Button>}

        {name === "Card / CardContent" && (
          <Card className="max-w-xs">
            <CardContent className="p-3">Contenido dentro de CardContent</CardContent>
          </Card>
        )}

        {name === "Command + subcomponentes" && (
          <Command className="max-w-md rounded border border-gray-300">
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup heading="Grupo">
                <CommandItem>
                  <Check className="mr-2 h-4 w-4" /> Opcion 1
                </CommandItem>
                <CommandItem>Opcion 2</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )}

        {name === "Dialog + subcomponentes" && (
          <div className="max-w-md rounded p-2 space-y-2">
            <Button variant="outline" size="sm">Abrir Dialog</Button>
            <p className="text-muted-foreground">Preview segura: sin abrir overlay/modal.</p>
            <div className="rounded border border-gray-300 p-2">
              <p className="font-semibold">Titulo del dialog</p>
              <p>Contenido de ejemplo.</p>
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm">Cancelar</Button>
                <Button size="sm">Aceptar</Button>
              </div>
            </div>
          </div>
        )}

        {name === "DifficultyBars (demo)" && (
          <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <SignalMedium className="h-3.5 w-3.5" />
            <span className="inline-flex items-end gap-[3px]">
              <span className="inline-block h-[6px] w-[4px] rounded-sm bg-current" />
              <span className="inline-block h-[9px] w-[4px] rounded-sm bg-current" />
              <span className="inline-block h-[12px] w-[4px] rounded-sm bg-current/25" />
            </span>
          </div>
        )}

        {name === "DifficultyBarsMono (demo)" && (
          <div className="inline-flex items-center gap-1 text-foreground">
            <SignalMedium className="h-3.5 w-3.5" />
            <span className="inline-flex items-end gap-[3px]">
              <span className="inline-block h-[6px] w-[4px] rounded-sm bg-current" />
              <span className="inline-block h-[9px] w-[4px] rounded-sm bg-current" />
              <span className="inline-block h-[12px] w-[4px] rounded-sm bg-current/25" />
            </span>
          </div>
        )}

        {name === "DropdownMenu + subcomponentes" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Abrir menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="start">
              <DropdownMenuLabel>Opciones</DropdownMenuLabel>
              <DropdownMenuItem>Primera opcion</DropdownMenuItem>
              <DropdownMenuItem>Segunda opcion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {name === "Filter (icono)" && <Filter className="h-4 w-4" />}
        {name === "Input" && <Input placeholder="Escribe aqui..." className="max-w-xs" />}
        {name === "Label" && <Label>Etiqueta de formulario</Label>}
        {name === "Layers (icono)" && <Layers className="h-4 w-4" />}
        {name === "Loader2 (icono)" && <Loader2 className="h-4 w-4 animate-spin" />}

        {name === "Popover + subcomponentes" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Abrir popover
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52">
              Contenido del popover
            </PopoverContent>
          </Popover>
        )}

        {name === "Search (icono)" && <Search className="h-4 w-4" />}

        {name === "Select + subcomponentes" && (
          <Select defaultValue="uno">
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uno">Opcion uno</SelectItem>
              <SelectItem value="dos">Opcion dos</SelectItem>
            </SelectContent>
          </Select>
        )}

        {name === "SignalMedium (icono)" && <SignalMedium className="h-4 w-4" />}
        {name === "Skeleton" && <Skeleton className="h-8 w-56 rounded-md" />}
        {name === "Textarea" && <Textarea placeholder="Texto de ejemplo..." className="max-w-md" />}
        {name === "User (icono)" && <User className="h-4 w-4" />}
        {name === "Wrench (icono)" && <Wrench className="h-4 w-4" />}
        {name === "X (icono)" && <X className="h-4 w-4" />}

        {name === "ExerciseDetailSheet (depende de datos reales)" && (
          <p className="text-muted-foreground">
            Este componente requiere un ejercicio real y estado de apertura para verse completo.
          </p>
        )}

        {name === "MuscleMultiSelect (depende de datos reales)" && (
          <p className="text-muted-foreground">
            Este componente depende del listado de musculos; se muestra normalmente dentro del formulario de creacion.
          </p>
        )}
      </div>
    </li>
  );
}

function ThemeColumn({ title }: { title: string }) {
  return (
    <section className="light">
      <div className="h-full rounded-lg bg-white p-4 text-black">
        <h2 className="mb-4 font-semibold">{title}</h2>
        <ol className="space-y-2">
          {exercisePageComponents.map((componentName, index) => (
            <PreviewRow key={componentName} index={index} name={componentName} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function ExercisesComponentsDocument() {
  const lightPaletteRef = useRef<HTMLDivElement | null>(null);
  const darkPaletteRef = useRef<HTMLDivElement | null>(null);
  const [exportingPalette, setExportingPalette] = useState<"light" | "dark" | null>(null);

  const downloadPaletteBlock = async (mode: "light" | "dark") => {
    const target = mode === "light" ? lightPaletteRef.current : darkPaletteRef.current;
    if (!target || exportingPalette) return;

    setExportingPalette(mode);
    try {
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: Math.max(window.devicePixelRatio || 1, 4),
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = mode === "light" ? "paleta-clara.png" : "paleta-oscura.png";
      link.click();
    } finally {
      setExportingPalette(null);
    }
  };

  return (
    <main
      className="min-h-screen bg-white p-6 text-black"
    >
      <div className="mb-4">
        <h1 className="font-semibold">Components</h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <ThemeColumn title="Modo claro" />
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="font-semibold">Paleta de colores</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Bloque paleta clara</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadPaletteBlock("light")}
              disabled={exportingPalette !== null}
            >
              {exportingPalette === "light" ? "Generando..." : "Descargar paleta clara"}
            </Button>
          </div>
          <div ref={lightPaletteRef}>
            <PaletteGrid title="Paleta clara" colors={lightPalette} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Bloque paleta oscura</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadPaletteBlock("dark")}
              disabled={exportingPalette !== null}
            >
              {exportingPalette === "dark" ? "Generando..." : "Descargar paleta oscura"}
            </Button>
          </div>
          <div ref={darkPaletteRef}>
            <PaletteGrid title="Paleta oscura" colors={darkPalette} dark />
          </div>
        </div>
      </section>
    </main>
  );
}
