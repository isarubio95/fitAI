import { expect, test } from "@playwright/test";
import { writeAuthSession } from "./fixtures/auth";
import { installSupabaseMock, E2E_USER_EMAIL } from "./fixtures/supabaseMock";

test.describe("E2E: auth login", () => {
  test("login con email/contraseña llega al dashboard", async ({ page }) => {
    await installSupabaseMock(page);

    await page.goto("/auth");
    // Pantalla de bienvenida: es la entrada del onboarding en la primera visita.
    await expect(page.getByRole("heading", { name: /Track Gym/ })).toBeVisible();
    await page.getByRole("button", { name: "Ya tengo cuenta" }).click();

    await page.getByLabel("Email").fill(E2E_USER_EMAIL);
    await page.getByLabel("Contraseña", { exact: true }).fill("password123");
    await page.getByRole("button", { name: /Iniciar sesión/i }).click();

    // Asegura persistencia de sesión en la clave sb-<ref>-auth-token del build.
    await writeAuthSession(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Registrar" })).toBeVisible({ timeout: 20_000 });
  });
});
