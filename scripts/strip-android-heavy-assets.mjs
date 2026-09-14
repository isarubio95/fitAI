/**
 * Cinturón de seguridad del AAB (límite Play: 500 MB comprimidos).
 * Los GIFs del catálogo (~635 MB) viven en el bucket `ejercicios` de Storage,
 * no en public/. Si reaparecen en dist/ o en assets de Capacitor, se borran
 * aquí para no colarlos en el paquete.
 */
import fs from "node:fs";
import path from "node:path";

const roots = [
  path.resolve("dist/ejercicios"),
  path.resolve("android/app/src/main/assets/public/ejercicios"),
];

function dirSizeBytes(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

function rmDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`skip (no existe): ${dir}`);
    return;
  }
  const beforeMb = Math.round((dirSizeBytes(dir) / (1024 * 1024)) * 10) / 10;
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`removed ${beforeMb} MB → ${dir}`);
}

for (const root of roots) rmDir(root);
console.log("OK: assets pesados excluidos del empaquetado Android");
