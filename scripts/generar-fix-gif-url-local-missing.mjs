import { readFile, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
      continue;
    }
    if (ch === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const h = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const v = splitCsvLine(lines[i]);
    const o = {};
    for (let j = 0; j < h.length; j++) o[h[j]] = v[j] ?? "";
    rows.push(o);
  }
  return rows;
}

function sqlQuote(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

const PROBLEMATIC = [
  { id: "0ffb44e5-ced1-43f8-a1c7-07eab96f0f98", nombre: "Curl en Supinación Cerrado Con Barra Z" },
  { id: "e9f2a1a7-2600-4dd3-954a-fb4bbc03cd80", nombre: "Aductor Externo en Máquina" },
  { id: "067a9e50-5881-43a7-840b-1e0fd77259f6", nombre: "Aductor Interno en Máquina" },
  { id: "2264e45d-d496-4902-a9b8-e42eaff5f5d0", nombre: "Air Bike (Assault Bike)" },
  { id: "3bd8696f-fba7-4500-a2d7-e10bc6fe5c67", nombre: "Aperturas con Mancuernas (Flyes)" },
  { id: "04624301-2724-454f-bd45-36694b610a54", nombre: "Burpee" },
  { id: "7a4c3df6-8450-4074-a797-592d85ff9434", nombre: "Pre-Workout" },
  { id: "85368ee3-2fc1-46b1-9188-800358ebd938", nombre: "Cruce de Poleas (Alto a Bajo)" },
  { id: "85074f0b-d739-458f-b5fd-0a24bc36dc64", nombre: "Cruce de Poleas (Bajo a Alto)" },
  { id: "55b5e593-ff46-4fdd-b9a5-a995ed77f096", nombre: "Crunch Superior" },
  { id: "2db35072-604a-4460-a897-5daea114762a", nombre: "Curl con giro Alterno con Mancuernas" },
  { id: "f5a1a20e-9cba-4a07-a116-642ce2bc55ae", nombre: "Curl Concentrado en Supinación con Mancuerna" },
  { id: "10b8ebaa-6e2c-434d-9b73-47236e2e888f", nombre: "Curl en Supinación con Barra" },
  { id: "0c0f395a-5388-45d8-8092-10ef60fb6327", nombre: "Curl en Supinación en Polea Baja" },
  { id: "1cd4eeae-2a7c-4ac2-bcbf-6ed6503eb023", nombre: "Curl Femoral Vertical en Máquina" },
  { id: "ed4b45b5-db3b-46f9-bdf5-d83f768c8130", nombre: "Curl Femoral Horizontal en Máquina" },
  { id: "23ae5b03-03df-42fb-858f-63179032613b", nombre: "Curl en Martillo Alterno con Mancuernas" },
  { id: "772dd831-9941-48e6-bf49-ac82206beddd", nombre: "Curl en Supinación en banco Scott con Barra" },
  { id: "c2e8875a-3bf5-46c4-acd3-f1519f0cd2f8", nombre: "Dominada Cerrada en Martillo" },
  { id: "3ed25bd6-9c91-4806-8c29-d9f6813b0eca", nombre: "Dominada" },
  { id: "085b592d-9c55-4ce5-88f6-67357a1f6016", nombre: "Dominada en Supinación" },
  { id: "4d6b1c7a-f945-47e6-9644-1643649146c4", nombre: "Elevación de piernas estiradas Colgado" },
  { id: "1ee56ec0-3801-4bed-84d0-40f248d8061c", nombre: "Extensión de Gemelos de pie" },
  { id: "60638100-57df-4d82-8cd0-1cde0295c334", nombre: "Extensión de Gemelos sentado en Máquina" },
  { id: "4deb27ea-8968-4ebc-90a9-4a339d6ae0c1", nombre: "Elevaciones Frontales en Pronación con Mancuernas" },
  { id: "3e82bc5e-4a99-4f81-9622-3538c73503b2", nombre: "Elevaciones Laterales Neutras con Mancuernas" },
  { id: "ea84da8d-625f-4de5-9eea-e53d16ed2eeb", nombre: "Elevación Lateral Aislada en Polea" },
  { id: "9824a189-0211-47da-b9a5-aef20ee06110", nombre: "Encogimientos Delanteros con Barra" },
  { id: "1e9cb3e6-a6f0-4bb1-8f5d-16665847d916", nombre: "Post-Workout" },
  { id: "0b41030a-bfd2-455f-bd90-20785a13eb7e", nombre: "Extensión de Cuádriceps en Máquina" },
  { id: "601ec6e9-86fe-407b-990f-efdb38563b18", nombre: "Extensión Vertical en Pronación en Polea Alta" },
  { id: "f1256c90-4790-4026-9b51-6d7829d64a55", nombre: "Remo Superior con Cuerda en Polea" },
  { id: "95e4a3f9-a23a-4151-8767-96d7c58ed917", nombre: "Flexiones Diamante" },
  { id: "22368eee-320f-4198-8e54-7b625a55260d", nombre: "Flexiones (Push-ups)" },
  { id: "a4a2782a-d597-4ea2-a0f1-17f68247835b", nombre: "Fondos en Paralelas (Dips)" },
  { id: "e842fea7-9c4a-40e9-aaa3-5af1c42f4c81", nombre: "Fondos entre Bancos" },
  { id: "502ee112-94b5-4279-b04d-dc92667fc4ab", nombre: "Hip Thrust con Barra" },
  { id: "3ba9a0e1-b044-4d20-80a5-daf6be1171c1", nombre: "Hiperextensiones (Lumbares)" },
  { id: "9ff67679-3c8a-43f8-9249-85d759abba1e", nombre: "Jalón en Pronación en Polea Alta" },
  { id: "c2ef4934-c5a5-4ca1-8ba8-d80bd3b0e0af", nombre: "Inclinación diagonal en Polea" },
  { id: "c8e683b5-b160-4695-91bc-6f6392ab4152", nombre: "Pájaros de pie con Mancuernas" },
  { id: "632afd42-2735-495c-b303-6520e76f5208", nombre: "Extensión de Glúteos en Polea" },
  { id: "fa8b2383-0e9b-42de-9cb8-dfafaed8e898", nombre: "Patadas Traseras en Polea" },
  { id: "646054d3-2dde-4f30-929f-5191b02949aa", nombre: "Aperturas en Máquina" },
  { id: "cf638b31-cc3e-460e-a6f0-2dd08d17ecdf", nombre: "Peso Muerto con Barra" },
  { id: "cb6a0f24-92ef-4f86-a7fe-8dde45184ca0", nombre: "Peso Muerto Rumano con Barra" },
  { id: "96c8936c-6135-4276-b366-5117aa842b1d", nombre: "Peso Muerto Sumo con Barra" },
  { id: "653649c6-1d0f-4555-a72c-c9a0eacc63ec", nombre: "Plancha" },
  { id: "2ff51a58-8dbb-4238-b5b4-56701be7bfad", nombre: "Plancha Lateral" },
  { id: "496c8f3e-a98a-433f-b390-0176387019a4", nombre: "Prensa Inclinada Cerrada" },
  { id: "c2c74ef0-db31-44b9-87ed-ac5cc6c916da", nombre: "Prensa Inclinada" },
  { id: "f910acc9-8f80-4aee-9353-992ea63a405e", nombre: "Sentadilla Cerrada Inclinada en Máquina" },
  { id: "8ce36447-9eda-4c7b-a79c-406ff75315c1", nombre: "Press Arnold con Mancuernas" },
  { id: "1cbc3cd9-ed77-4b01-b3de-abc38cd67e30", nombre: "Press Banca Cerrado con Barra" },
  { id: "0c6f3783-58e9-4536-b111-6af337117842", nombre: "Press Banca con Barra" },
  { id: "6c592805-b4af-453b-b37b-2919c7289988", nombre: "Press Banca con Mancuernas" },
  { id: "649a0be3-efa9-48c7-962f-19e226e39d01", nombre: "Press Declinado con Barra" },
  { id: "6c65da7e-5663-410c-bda3-2b73af3b557c", nombre: "Press Francés con Barra Z" },
  { id: "9cc9325d-1ace-4e6e-bef6-08207c440988", nombre: "Press Inclinado con Barra" },
  { id: "bff0c1a9-84fe-4210-ad5e-594789802cb5", nombre: "Press Inclinado en Supinación con Mancuernas" },
  { id: "9f01fc30-8b1a-47fa-b643-cccbe89158f9", nombre: "Press Militar con Barra (Overhead)" },
  { id: "872a6da6-c9c0-4a42-9d15-c35182faaedb", nombre: "Press Militar Neutro con Mancuernas" },
  { id: "f8cee9a3-5ce2-4109-a203-d7d7f133b2dc", nombre: "Press Militar con Barra" },
  { id: "b75c1c10-19b7-496c-bec8-4dd3bdc317ba", nombre: "Elevación de Cadera con flexión de rodillas v1" },
  { id: "011e2f68-9f1e-4202-ac3b-13ddee6cbf6d", nombre: "Pullover con Mancuerna" },
  { id: "6edb782f-e45c-4d62-b9e9-fbecd77523d1", nombre: "Jalón Aislado en Polea Alta" },
  { id: "2f0728ff-13fb-4dba-95a0-66abd09b7315", nombre: "Remo al mentón con Barra" },
  { id: "9c2ce62a-46d5-434b-85aa-048b34e6a293", nombre: "Remo en Pronación con Barra" },
  { id: "cf40077f-2234-49bf-b3cc-a49ce2454819", nombre: "Remo Aislado con Mancuerna" },
  { id: "c76bbed5-a676-47a9-8c26-caecf7457e50", nombre: "Máquina de Remo" },
  { id: "d713e14b-ec1f-4053-8da8-7812478a1d9d", nombre: "Remo en Barra T en Pronación" },
  { id: "fd7582f0-d923-4029-bb52-28ce80ff2cea", nombre: "Remo Horizontal Cerrado Neutro en Polea" },
  { id: "0b13c703-8746-4f28-b804-1dee7b8cc0cb", nombre: "Remo Inclinado en Pronación con Barra" },
  { id: "23ced254-68dd-42d4-a1fa-e9333c53707c", nombre: "Press Francés con Barra" },
  { id: "14362441-532d-4747-a299-a50f4833fa0a", nombre: "Wheel Rollout de rodillas" },
  { id: "335ff6ce-52c4-4a06-be22-f805d32dce66", nombre: "Russian Twist" },
  { id: "2aa7b386-1de4-4054-8ba6-d13d2e004827", nombre: "Salto con Cuerda Normal" },
  { id: "ad86a555-48a4-4a8a-9fc6-27fd7b4d5428", nombre: "Zancada Trasera con Mancuernas" },
  { id: "21c2b024-500f-452c-a972-d9a87e0868b7", nombre: "Sentadilla con Mancuernas" },
  { id: "f751bdc8-3511-4857-b6b9-25068ead2aad", nombre: "Sentadilla con Barra" },
  { id: "08c505d5-f012-4b63-982f-2043b689b8c6", nombre: "Zancada Delantera con Mancuernas" },
];

const fitRows = parseCsv(await readFile("sql/ejercicios.csv", "utf8"));
const fitGifByNombre = new Map();
for (const r of fitRows) {
  const n = String(r.nombre ?? "").trim();
  const gif = String(r.gif_url ?? "").trim();
  if (n && gif) fitGifByNombre.set(n, gif);
}

const actualGifs = new Set(
  readdirSync("public/ejercicios").filter((f) => f.toLowerCase().endsWith(".gif")),
);

const updates = [];
const noMatch = [];
const noPhysicalFile = [];

for (const x of PROBLEMATIC) {
  const remote = fitGifByNombre.get(x.nombre);
  if (!remote) {
    noMatch.push(x);
    continue;
  }
  const base = remote.split("/").pop();
  const local = `/ejercicios/${base}`;
  if (!actualGifs.has(base)) {
    noPhysicalFile.push({ ...x, local });
    continue;
  }
  updates.push({ ...x, local });
}

const sql = [];
sql.push("-- Arreglar gif_url locales que apuntan a archivos inexistentes");
sql.push("-- Fuente: sql/ejercicios.csv (gif_url) + comprobación física en public/ejercicios");
sql.push("begin;");
for (const u of updates) {
  sql.push(
    `update public.tipo_ejercicio set gif_url = '${sqlQuote(u.local)}' where id = '${sqlQuote(u.id)}'; -- ${sqlQuote(u.nombre)}`,
  );
}
sql.push("commit;");

if (noMatch.length) {
  sql.push("");
  sql.push("-- SIN MATCH EN sql/ejercicios.csv (revisar manualmente):");
  for (const x of noMatch) sql.push(`-- ${x.id} | ${x.nombre}`);
}
if (noPhysicalFile.length) {
  sql.push("");
  sql.push("-- MATCH PERO FALTA EL GIF EN public/ejercicios (revisar deploy/archivos):");
  for (const x of noPhysicalFile) sql.push(`-- ${x.id} | ${x.nombre} -> ${x.local}`);
}

await writeFile("sql/fix_gif_url_missing_local_files.sql", sql.join("\n") + "\n", "utf8");

console.log("Encontrados en ejercicios.csv:", updates.length);
console.log("Sin match en ejercicios.csv:", noMatch.length);
console.log("Sin fichero físico en public/ejercicios:", noPhysicalFile.length);
console.log("Generado: sql/fix_gif_url_missing_local_files.sql");

