import { compile } from "@tailwindcss/node";
import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync("src/index.css", "utf8");
const compiled = await compile(css, {
  from: "src/index.css",
  base: path.join(process.cwd(), "src"),
  onDependency: () => {},
});

const out = compiled.build([
  "hover:bg-primary-solid/90",
  "hover:text-foreground",
  "data-[state=inactive]:hover:bg-muted/55",
  "dark:hover:bg-accent/30",
]);

function snippet(needle, len = 420) {
  const i = out.indexOf(needle);
  return i >= 0 ? out.slice(i, i + len) : "NOT FOUND";
}

console.log("--- hover:bg-primary-solid/90 ---");
console.log(snippet(".hover\\:bg-primary-solid\\/90"));

console.log("\n--- data-[state=inactive]:hover ---");
console.log(snippet("data-\\[state\\=inactive\\]\\:hover\\:bg-muted\\/55"));

const hoverHoverCount = (out.match(/\(hover:\s*hover\)/g) || []).length;
const pointerFineCount = (out.match(/pointer:\s*fine/g) || []).length;
const nested =
  /@media \(hover:\s*hover\)\s*\{[^}]*@media \(hover:\s*hover\)/.test(out) ||
  out.includes("@media (hover: hover) {\n    @media (hover: hover)");

console.log("\n(hover: hover) count:", hoverHoverCount);
console.log("(pointer: fine) count:", pointerFineCount);
console.log("nested hover:hover media:", nested);
