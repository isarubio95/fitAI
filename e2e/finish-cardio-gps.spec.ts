import { expect, test } from "@playwright/test";
import {
  findMutation,
  mutationHasFechaFin,
} from "./fixtures/supabaseMock";
import { loginAsE2EUser, openCardioLive } from "./fixtures/ui";

test.describe("E2E: finish cardio", () => {
  test.use({
    geolocation: { latitude: 40.4168, longitude: -3.7038, accuracy: 8 },
    permissions: ["geolocation"],
  });

  test("login → iniciar cardio → finalizar y guardar con fecha_fin", async ({ page, context }) => {
    const mock = await loginAsE2EUser(page);

    await openCardioLive(page);
    await expect(page.getByText("Cinta").first()).toBeVisible({ timeout: 15_000 });

    // Geolocation mock activo (permiso concedido) aunque la disciplina E2E sea interior
    await context.setGeolocation({ latitude: 40.4172, longitude: -3.7034, accuracy: 8 });

    await page.getByRole("button", { name: "Iniciar entrenamiento" }).click();
    await expect(page.getByRole("button", { name: "Finalizar" })).toBeVisible({ timeout: 20_000 });

    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Finalizar" }).click();
    await expect(page.getByRole("button", { name: "Guardar entrenamiento" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Guardar entrenamiento" }).click();

    await expect
      .poll(
        () =>
          findMutation(
            mock,
            "cardio_sesion",
            (m) => (m.method === "PATCH" || m.method === "POST") && mutationHasFechaFin(m.body),
          ).length,
        { timeout: 20_000 },
      )
      .toBeGreaterThan(0);

    expect(mock.cardioSesion?.fecha_fin).toBeTruthy();
  });
});
