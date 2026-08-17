/**
 * Quita assets pesados del bundle Android (límite Play: 500 MB comprimidos).
 * Los GIFs de ejercicios (~635 MB) se sirven en web desde public/; en nativo
 * no deben empaquetarse. Las filas con gif_url=/ejercicios/... no mostrarán
 * demo hasta hostearlos en CDN/Storage o VITE_EXERCISE_MEDIA_ORIGIN.
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
