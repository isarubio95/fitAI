import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const url = env.VITE_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const email = "browser-verify@trackgym.test";
const password = `VerifyGym-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
const headers = {
  Authorization: `Bearer ${service}`,
  apikey: service,
  "Content-Type": "application/json",
};

const listed = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, { headers });
if (!listed.ok) throw new Error(`list users ${listed.status} ${await listed.text()}`);
const { users } = await listed.json();
const existing = users.find((u) => u.email === email);

let id;
if (existing) {
  id = existing.id;
  const updated = await fetch(`${url}/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password, email_confirm: true }),
  });
  if (!updated.ok) throw new Error(`update user ${updated.status} ${await updated.text()}`);
} else {
  const created = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!created.ok) throw new Error(`create user ${created.status} ${await created.text()}`);
  id = (await created.json()).id;
}

const out = join(tmpdir(), "fitai-browser-verify.json");
writeFileSync(out, JSON.stringify({ email, password, id }));
console.log(`READY ${id}`);
console.log(`CREDS ${out}`);
