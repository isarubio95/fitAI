import { expect, type Page } from "@playwright/test";
import { E2E_USER_EMAIL } from "./ids";
import { installSupabaseMock, type SupabaseMockState } from "./supabaseMock";

/**
 * Login E2E vía UI + mock de /auth/v1/token.
 * Así supabase-js guarda la sesión en la clave sb-<ref>-auth-token
 * correcta del build (independiente del .env del proceso de Playwright).
 */
export async function loginAsE2EUser(page: Page): Promise<SupabaseMockState> {
  const mock = await installSupabaseMock(page);
  await page.goto("/auth");
  await expect(page.getByRole("heading", { name: "Track Gym" })).toBeVisible();
  // /auth abre en la pantalla de bienvenida (WelcomeStep); el formulario está
  // detrás de "Ya tengo cuenta".
  await page.getByRole("button", { name: "Ya tengo cuenta" }).click();
  await page.getByLabel("Email").fill(E2E_USER_EMAIL);
  await page.getByLabel("Contraseña", { exact: true }).fill("password123");
  await page.getByRole("button", { name: /Iniciar sesión/i }).click();
  await expect(page.getByRole("button", { name: "Registrar" })).toBeVisible({ timeout: 20_000 });
  return mock;
}

/** Abre el menú Registrar de la bottom nav (viewport móvil). */
export async function openRegisterMenu(page: Page) {
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText("Fuerza")).toBeVisible();
}

export async function openGymWorkout(page: Page) {
  await openRegisterMenu(page);
  await page.getByText("Fuerza").click();
  await expect(page.getByText("Comenzar entrenamiento")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Agregar ejercicio" })).toBeVisible({
    timeout: 15_000,
  });
  // Evita clicks mientras createBlankActiveWorkout re-monta el sheet
  await page.waitForTimeout(800);
}

export async function openCardioLive(page: Page) {
  await openRegisterMenu(page);
  await page.getByText("Cardio").click();
  await expect(page.getByRole("button", { name: "Iniciar entrenamiento" })).toBeVisible({
    timeout: 20_000,
  });
}

export async function addCatalogExercise(page: Page, exerciseName = "Press banca") {
  const addBtn = page.getByRole("button", { name: "Agregar ejercicio" }).last();
  await addBtn.click({ force: true });
  await expect(page.getByRole("heading", { name: "Agregar ejercicio" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("option", { name: exerciseName }).click();
  await expect(page.getByText(exerciseName).first()).toBeVisible({ timeout: 15_000 });
}
