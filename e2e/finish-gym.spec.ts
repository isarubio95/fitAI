import { expect, test } from "@playwright/test";
import {
  findMutation,
  mutationHasFechaFin,
} from "./fixtures/supabaseMock";
import { addCatalogExercise, loginAsE2EUser, openGymWorkout } from "./fixtures/ui";

test.describe("E2E: finish gym", () => {
  test("login → crear entreno → finalizar con fecha_fin", async ({ page }) => {
    const mock = await loginAsE2EUser(page);

    await openGymWorkout(page);
    await addCatalogExercise(page);

    // Rellenar serie (el checkbox custom no siempre es accesible en headless)
    const repsInput = page.locator('input[data-set-field="repeticiones"]').first();
    const weightInput = page.locator('input[data-set-field="peso_kg"]').first();
    await repsInput.fill("10");
    await weightInput.fill("60");
    await repsInput.blur();

    const finishBtn = page.getByRole("button", { name: "Finalizar" });
    await expect(finishBtn).toBeEnabled();
    await finishBtn.click();

    await expect
      .poll(() => findMutation(mock, "actividad", (m) => m.method === "PATCH" && mutationHasFechaFin(m.body)).length, {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    expect(mock.actividad?.fecha_fin).toBeTruthy();
  });
});
