import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("play-assets");
const GREEN = "#22c55e";

// Mancuerna (diseño 512x512). Se reutiliza escalada.
const dumbbellPath = `M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829zM2.5 21.5l1.4-1.4M20.1 3.9l1.4-1.4M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829zM9.6 14.4l4.8-4.8`;

function dumbbell(strokeWidth = 2, color = "white") {
  return `<g transform="translate(96,96) scale(13.33)" stroke="${color}" stroke-width="${strokeWidth}"
     stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${dumbbellPath}"/></g>`;
}

// 1) Icono 512x512
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${GREEN}"/>
  ${dumbbell(2)}
</svg>`;

// 2) Gráfico de funciones 1024x500
// Iconos (lucide, viewBox 24x24) representativos de cada categoría.
const ICONS = {
  fuerza: `
    <path d="M14.4 14.4 9.6 9.6"/>
    <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/>
    <path d="m21.5 21.5-1.4-1.4"/>
    <path d="M3.9 3.9 2.5 2.5"/>
    <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>`,
  cardio: `
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>`,
  progreso: `
    <path d="M16 7h6v6"/>
    <path d="m22 7-8.5 8.5-5-5L2 17"/>`,
};

function pill(x, y, w, label, color, icon) {
  return `
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="56" rx="28" fill="${color}" opacity="0.10"/>
      <rect width="${w}" height="56" rx="28" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>
      <g transform="translate(20,16)" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">${icon}</g>
      <text x="56" y="37" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="#e4e4e7">${label}</text>
    </g>`;
}

const featureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a140d"/>
      <stop offset="0.55" stop-color="#0a0a0c"/>
      <stop offset="1" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34d36b"/>
      <stop offset="1" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#d7f5e2"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${GREEN}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="26" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- Glows decorativos -->
  <circle cx="240" cy="250" r="360" fill="url(#glow)" opacity="0.5"/>
  <circle cx="980" cy="60" r="300" fill="${GREEN}" opacity="0.05"/>
  <circle cx="900" cy="470" r="240" fill="${GREEN}" opacity="0.04"/>

  <!-- Líneas finas decorativas -->
  <g stroke="${GREEN}" stroke-width="2" opacity="0.10">
    <line x1="640" y1="40" x2="1024" y2="40"/>
    <line x1="700" y1="460" x2="1024" y2="460"/>
  </g>

  <!-- Badge con el logo -->
  <g transform="translate(90,134)" filter="url(#soft)">
    <rect width="232" height="232" rx="54" fill="url(#accent)"/>
    <rect width="232" height="232" rx="54" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.18"/>
    <g transform="translate(20,20) scale(0.375)">${dumbbell(2.1)}</g>
  </g>

  <!-- Texto principal -->
  <text x="378" y="206" font-family="Arial, Helvetica, sans-serif" font-size="94" font-weight="800" fill="url(#title)" letter-spacing="-1">Track Gym</text>
  <text x="382" y="262" font-family="Arial, Helvetica, sans-serif" font-size="33" font-weight="500" fill="#a1a1aa">Tu compañero de entrenamiento</text>

  <!-- Píldoras de funciones (paleta verde armónica: verde, teal, lima) -->
  ${pill(382, 300, 170, "Fuerza", "#22c55e", ICONS.fuerza)}
  ${pill(568, 300, 170, "Cardio", "#2dd4bf", ICONS.cardio)}
  ${pill(754, 300, 202, "Progreso", "#a3e635", ICONS.progreso)}
</svg>`;

await mkdir(OUT_DIR, { recursive: true });
await sharp(Buffer.from(iconSvg)).png().toFile(path.join(OUT_DIR, "play-icon-512.png"));
await sharp(Buffer.from(featureSvg)).png().toFile(path.join(OUT_DIR, "play-feature-1024x500.png"));
console.log("Generado en:", OUT_DIR);
