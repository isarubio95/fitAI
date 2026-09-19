import { useState, type ReactNode } from "react";
import { Check, Copy, Gem, MessageCircle, MousePointer2, Plug, Sparkles } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MCP_URL } from "@/lib/mcp";
import { PAGE_CARD } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

/**
 * Botón de copiar reutilizado por la dirección del servidor y por los comandos.
 *
 * El texto a copiar y el que se enseña son el mismo nodo: si se separasen, un
 * retoque en el bloque de código dejaría copiando la versión vieja.
 */
function CopyButton({ value, label }: { value: string; label: string }) {
  const { toast } = useToast();
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast({ title: "No se ha podido copiar", description: value });
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      aria-label={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent/30"
    >
      {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Comando o fragmento de configuración, con su botón de copiar. */
function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="mt-2 flex items-start gap-1 rounded-lg bg-muted/70 p-2 pl-3">
      <pre className="flex-1 overflow-x-auto whitespace-pre text-[11px] leading-relaxed text-muted-foreground">
        <code>{code}</code>
      </pre>
      <CopyButton value={code} label={label} />
    </div>
  );
}

type Guia = {
  id: string;
  nombre: string;
  donde: string;
  icono: ReactNode;
  pasos: ReactNode[];
  notas: ReactNode[];
};

/**
 * Instrucciones de conexión, una por asistente.
 *
 * Los nombres de menú van en inglés a propósito: son los rótulos literales que
 * el usuario va a ver en ChatGPT, Claude, Gemini y Cursor, que no están
 * traducidos. Traducirlos aquí obligaría a buscar a ojo el equivalente.
 */
const GUIAS: Guia[] = [
  {
    id: "chatgpt",
    nombre: "ChatGPT",
    donde: "Web · Plus, Pro o empresa",
    icono: <MessageCircle className="h-4 w-4" />,
    pasos: [
      <>
        Abre ChatGPT en el navegador y ve a <strong>Settings → Apps &amp; Connectors → Advanced
        settings</strong>. Activa <strong>Developer mode</strong>.
      </>,
      <>
        Vuelve a <strong>Apps &amp; Connectors</strong> y pulsa <strong>Create</strong>.
      </>,
      <>
        Escribe un nombre (Track Gym), pega la dirección del servidor y elige <strong>OAuth</strong>{" "}
        como autenticación.
      </>,
      <>Al crearlo se abrirá el inicio de sesión de Track Gym: revisa los permisos y acepta.</>,
      <>
        En el chat, abre el menú <strong>+</strong> y activa Track Gym en esa conversación.
      </>,
    ],
    notas: [
      <>ChatGPT solo admite servidores remotos por HTTPS, no servidores locales.</>,
      <>
        En cuentas Business o Enterprise, el administrador tiene que permitir antes los conectores
        MCP personalizados desde los ajustes del espacio de trabajo.
      </>,
    ],
  },
  {
    id: "claude",
    nombre: "Claude",
    donde: "claude.ai y Claude Code",
    icono: <Sparkles className="h-4 w-4" />,
    pasos: [
      <>
        En claude.ai ve a <strong>Customize → Connectors</strong>.
      </>,
      <>
        Pulsa <strong>Add custom connector</strong>.
      </>,
      <>
        Pega la dirección del servidor y pulsa <strong>Add</strong>.
      </>,
      <>
        Pulsa <strong>Connect</strong>: inicia sesión en Track Gym y aprueba los permisos.
      </>,
      <>
        En la conversación, abre el botón <strong>+</strong> → <strong>Connectors</strong> y activa
        Track Gym.
      </>,
    ],
    notas: [
      <>
        En Team y Enterprise lo añade el propietario en <strong>Organization settings →
        Connectors</strong>; después cada miembro lo conecta desde Customize → Connectors.
      </>,
      <>
        Desde Claude Code, en el terminal:
        <CodeBlock
          code={`claude mcp add --transport http track-gym ${MCP_URL}`}
          label="Copiar el comando de Claude Code"
        />
        Luego escribe <code className="rounded bg-muted px-1 py-0.5 text-[11px]">/mcp</code> dentro
        de la sesión para iniciar sesión.
      </>,
    ],
  },
  {
    id: "gemini",
    nombre: "Gemini",
    donde: "App de Gemini y Gemini CLI",
    icono: <Gem className="h-4 w-4" />,
    pasos: [
      <>
        Entra en gemini.google.com desde el ordenador y abre <strong>Settings → Connected
        apps</strong>.
      </>,
      <>
        En <strong>Custom apps</strong>, pulsa <strong>Add a custom app</strong>.
      </>,
      <>
        Pega la dirección del servidor, pulsa <strong>Next</strong> y sigue los pasos para iniciar
        sesión.
      </>,
      <>
        En el chat, escribe <strong>@</strong> y elige Track Gym para usarlo en una pregunta.
      </>,
    ],
    notas: [
      <>
        Google pide cuenta personal (no de trabajo ni de centro educativo), tener la Actividad de
        Gemini activada y ser mayor de edad. La función está disponible por ahora solo en Estados
        Unidos y en inglés.
      </>,
      <>
        En Gemini CLI no hay esa restricción:
        <CodeBlock
          code={`gemini mcp add --transport http track-gym ${MCP_URL}`}
          label="Copiar el comando de Gemini CLI"
        />
        Después, dentro de la CLI, ejecuta{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">/mcp auth track-gym</code> para
        autorizarlo.
      </>,
    ],
  },
  {
    id: "cursor",
    nombre: "Cursor",
    donde: "Editor · mcp.json",
    icono: <MousePointer2 className="h-4 w-4" />,
    pasos: [
      <>
        Abre <strong>Cursor Settings → Tools &amp; Integrations</strong> y pulsa <strong>New MCP
        Server</strong>: se abrirá el fichero <code className="rounded bg-muted px-1 py-0.5 text-[11px]">mcp.json</code>.
      </>,
      <>
        Añade el servidor y guarda:
        <CodeBlock
          code={`{\n  "mcpServers": {\n    "track-gym": {\n      "url": "${MCP_URL}"\n    }\n  }\n}`}
          label="Copiar la configuración de Cursor"
        />
      </>,
      <>
        Cuando Cursor muestre <strong>Needs login</strong>, púlsalo y completa el acceso en el
        navegador.
      </>,
      <>Activa el servidor en la lista y pregúntale desde el chat en modo Agent.</>,
    ],
    notas: [
      <>
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.cursor/mcp.json</code> lo deja
        disponible solo en ese proyecto;{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">~/.cursor/mcp.json</code>, en
        todos.
      </>,
    ],
  },
];

/**
 * Los comandos que publica el servidor como prompts MCP.
 *
 * Es una copia deliberada de lo que registra `supabase/functions/mcp/prompts/`:
 * la tarjeta no puede consultar el servidor sin que el usuario lo haya
 * conectado ya, y el problema que resuelve es justo el de antes de conectarlo.
 * Si se añade o se renombra un prompt allí, esta lista se actualiza aquí.
 */
const COMANDOS: { nombre: string; que: string }[] = [
  { nombre: "Analiza mi mes", que: "volumen, reparto por músculo, adherencia y récords" },
  { nombre: "Dónde me he estancado", que: "ejercicios que llevan semanas sin mejorar" },
  { nombre: "Planifica la semana", que: "propone la semana y, si la apruebas, la programa" },
  { nombre: "Revisa mi rutina", que: "equilibrio de grupos y carga por sesión" },
  { nombre: "Fuerza y cardio juntos", que: "las dos mitades del diario, semana a semana" },
];

/**
 * Destacado de Inicio: la integración con MCP.
 *
 * Va siempre la primera y fuera del reordenable porque es un aviso, no un
 * widget de datos: lo que cuenta deja de ser noticia, mientras que el resto de
 * tarjetas el usuario las consulta a diario y decide en qué orden.
 *
 * El borde con el arco que gira (`.spotlight-ring`, en index.css) es lo único
 * que la distingue del resto de cards; por dentro respeta el mismo tipo,
 * espaciado y radios, para que destaque sin parecer de otra aplicación.
 */
export function McpSpotlightCard() {
  return (
    <Card className={cn(PAGE_CARD, "spotlight-ring")}>
      <Accordion type="single" collapsible>
        <AccordionItem value="mcp" className="border-b-0">
          <AccordionTrigger className="items-start gap-3 px-5 py-5 hover:no-underline [&>svg]:mt-1.5 [&>svg]:text-muted-foreground">
            <div className="flex min-w-0 flex-1 items-start gap-3.5 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                <Plug className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Novedad
                </p>
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                  Conecta tu IA con Track Gym
                </h3>
                <p className="text-sm font-normal leading-snug text-muted-foreground">
                  Track Gym ya es un servidor MCP: consulta, registra y programa tus entrenos
                  desde ChatGPT, Claude, Gemini o Cursor.
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-5 pb-5 pt-0">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Dirección del servidor</p>
                <div className="flex items-center gap-1 rounded-lg bg-muted/70 p-1 pl-3">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap text-[11px] text-muted-foreground">
                    {MCP_URL}
                  </code>
                  <CopyButton value={MCP_URL} label="Copiar la dirección del servidor MCP" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Cómo conectarlo</p>
                <Accordion type="single" collapsible className="space-y-2">
                  {GUIAS.map((guia) => (
                    <AccordionItem
                      key={guia.id}
                      value={guia.id}
                      className="rounded-xl border border-border/50 bg-background/40 px-3"
                    >
                      <AccordionTrigger className="min-w-0 gap-3 py-3 hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            {guia.icono}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight text-foreground">
                              {guia.nombre}
                            </p>
                            <p className="truncate text-xs font-normal text-muted-foreground">
                              {guia.donde}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-0">
                        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-xs marker:font-medium marker:text-muted-foreground/70">
                          {guia.pasos.map((paso, i) => (
                            <li key={i}>{paso}</li>
                          ))}
                        </ol>
                        {guia.notas.length > 0 && (
                          <ul className="mt-3 space-y-2 border-t border-border/40 pt-3 text-xs leading-relaxed text-muted-foreground">
                            {guia.notas.map((nota, i) => (
                              <li key={i}>{nota}</li>
                            ))}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Comandos que ya trae</p>
                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  {COMANDOS.map((comando) => (
                    <li key={comando.nombre}>
                      <span className="font-medium text-foreground">{comando.nombre}</span>
                      {" — "}
                      {comando.que}
                    </li>
                  ))}
                </ul>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  No hace falta que sepas qué preguntar: tu asistente los enseña al conectar Track
                  Gym. En Claude salen en el menú de la conexión; en Claude Code y Gemini CLI, como{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">/comandos</code>.
                </p>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                El asistente entra con tu cuenta y solo ve tus datos. Puedes retirarle el acceso
                cuando quieras en Ajustes → Aplicaciones conectadas.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
