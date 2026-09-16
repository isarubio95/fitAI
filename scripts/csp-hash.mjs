/**
 * Recalcula el hash CSP de los scripts inline de index.html.
 *
 * `script-src` en vercel.json autoriza el bootstrap de tema/acento de index.html
 * por su hash SHA-256. Cualquier edición de ese bloque —incluso un espacio—
 * invalida el hash y el navegador bloquea el script: la app arranca con un
 * flash de tema incorrecto.
 *
 * Sobre qué bytes se calcula:
 * Vite copia el script inline **literalmente** a dist/index.html, así que el
 * hash del fuente y el del build coinciden salvo por los finales de línea. En
 * Windows el working tree tiene CRLF y el build lo hereda, pero Vercel hace
 * checkout en Linux y despliega LF. Por eso normalizamos a LF siempre: es la
 * forma que acaba sirviéndose. `.gitattributes` fija index.html a LF para que
 * esa garantía no dependa de `core.autocrlf`.
 *
 * Uso:
 *   npm run csp:hash            # imprime los hashes a poner en vercel.json
 *   npm run csp:hash -- --check # falla si vercel.json no los contiene
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

/** El HTML que se sirve: dist si hay build, si no el index.html commiteado. */
function deployedHtml() {
  if (existsSync("dist/index.html")) {
    return { source: "dist/index.html", html: readFileSync("dist/index.html", "utf8") };
  }
  try {
    const html = execFileSync("git", ["show", "HEAD:index.html"], { maxBuffer: 1e8 }).toString("utf8");
    return { source: "index.html (HEAD)", html };
  } catch {
    return { source: "index.html (working tree)", html: readFileSync("index.html", "utf8") };
  }
}

const { source, html } = deployedHtml();
const hashes = [...html.matchAll(INLINE_SCRIPT)].map((match) => {
  const body = match[1].replace(/\r\n/g, "\n"); // se despliega con LF
  return `sha256-${createHash("sha256").update(body, "utf8").digest("base64")}`;
});

if (hashes.length === 0) {
  console.log(`${source} no tiene scripts inline: elimina los hashes de script-src en vercel.json.`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  const vercelJson = readFileSync("vercel.json", "utf8");
  const missing = hashes.filter((hash) => !vercelJson.includes(hash));
  if (missing.length) {
    console.error(`vercel.json no autoriza estos scripts inline de ${source}:`);
    for (const hash of missing) console.error(`  '${hash}'`);
    console.error("\nActualiza `script-src` en vercel.json con los valores de arriba.");
    process.exit(1);
  }
  console.log(`vercel.json autoriza los ${hashes.length} script(s) inline de ${source}.`);
  process.exit(0);
}

console.log(`Fuente: ${source}`);
for (const hash of hashes) console.log(`'${hash}'`);
