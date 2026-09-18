import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardarraíles del servidor MCP, comprobados sobre el código fuente.
 *
 * El servidor MCP expone los datos del usuario a un modelo de lenguaje con
 * herramientas de escritura. Todo su modelo de seguridad se apoya en una sola
 * cosa: que las consultas viajen con el JWT del usuario, para que las políticas
 * RLS sigan decidiendo qué se puede tocar. Usar la service role key ahí dentro
 * saltaría ese control entero y, peor, lo haría en silencio: los tests
 * seguirían pasando y el agujero solo se vería cuando un usuario leyera datos
 * de otro.
 *
 * Por eso se comprueba aquí, al estilo de `npm run csp:hash -- --check`: es una
 * invariante de una línea que conviene que falle en CI y no en producción.
 */

const MCP_DIR = path.resolve(import.meta.dirname, "../../supabase/functions/mcp");

function ficherosTs(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const ruta = path.join(dir, entry.name);
    if (entry.isDirectory()) return ficherosTs(ruta);
    return entry.isFile() && entry.name.endsWith(".ts") ? [ruta] : [];
  });
}

describe("servidor MCP", () => {
  const ficheros = ficherosTs(MCP_DIR).filter((f) => !f.endsWith("database.types.ts"));

  it("tiene ficheros que revisar", () => {
    expect(ficheros.length).toBeGreaterThan(0);
  });

  it("no usa nunca la service role key", () => {
    const culpables = ficheros.filter((fichero) => {
      const codigo = fs.readFileSync(fichero, "utf8");
      return (
        codigo.includes("SERVICE_ROLE") ||
        codigo.includes("serviceRole") ||
        codigo.includes("supabaseAdmin")
      );
    });

    expect(
      culpables.map((f) => path.relative(MCP_DIR, f)),
      "El servidor MCP debe operar siempre con el JWT del usuario: RLS es el único control de acceso.",
    ).toEqual([]);
  });

  it("declara verify_jwt = false para la función mcp", () => {
    // Si el gateway verificara el JWT, rechazaría la petición de descubrimiento
    // sin token y ningún cliente MCP podría iniciar el flujo OAuth.
    const config = fs.readFileSync(
      path.resolve(import.meta.dirname, "../../supabase/config.toml"),
      "utf8",
    );
    const bloque = config.slice(config.indexOf("[functions.mcp]"));
    expect(config).toContain("[functions.mcp]");
    expect(bloque.split("\n").slice(0, 3).join("\n")).toContain("verify_jwt = false");
  });

  it("mantiene el servidor OAuth y la ruta de consentimiento configurados", () => {
    const config = fs.readFileSync(
      path.resolve(import.meta.dirname, "../../supabase/config.toml"),
      "utf8",
    );
    expect(config).toContain("[auth.oauth_server]");
    expect(config).toContain('authorization_url_path = "/oauth/consent"');
  });
});
