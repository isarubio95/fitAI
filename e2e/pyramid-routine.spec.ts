import { expect, test } from "@playwright/test";
import { findMutation } from "./fixtures/supabaseMock";
import { loginAsE2EUser } from "./fixtures/ui";

/**
 * Cubre el camino que los tests unitarios no pueden: que el plan por serie
 * editado en el formulario llegue a `rutina_ejercicio_serie` con el orden y
 * los tipos correctos, colgando del `rutina_ejercicio` que le corresponde.
 */
test.describe("E2E: rutina con series piramidales", () => {
  test("crear rutina → pirámide + calentamiento → persiste el plan por serie", async ({
    page,
  }) => {
    const mock = await loginAsE2EUser(page);

    await page.goto("/routines");
    await page.getByRole("button", { name: "Crear Rutina" }).click();
    await page.getByRole("button", { name: "Desde cero" }).click();

    await expect(page.getByText("Nueva Rutina")).toBeVisible({ timeout: 15_000 });
    await page.locator("#routine-name").fill("Pecho piramidal");

    // Añadir ejercicio del catálogo
    await page.getByRole("button", { name: "Agregar ejercicio" }).last().click({ force: true });
    await expect(page.getByRole("heading", { name: "Agregar ejercicio" })).toBeVisible({
      timeout: 15_000,
    });
    // El selector de rutina permite marcar varios y confirmar al final.
    await page.getByRole("checkbox", { name: /Press banca/ }).click();
    await page.getByRole("button", { name: /Añadir al entreno|Añadir a la rutina/ }).click();
    await expect(page.getByText("Press banca").first()).toBeVisible({ timeout: 15_000 });

    // Modo avanzado + presets
    await page.getByTitle("Personalizar series (pirámide, calentamiento…)").click();
    await expect(page.getByText("Plantillas:")).toBeVisible();
    await page.getByRole("button", { name: "Pirámide ↓", exact: true }).click();
    await page.getByRole("button", { name: "+ Calentamiento", exact: true }).click();

    // 3 series de la pirámide + el calentamiento
    await expect(page.getByTitle("Quitar serie")).toHaveCount(4);

    await page.getByRole("button", { name: "Guardar" }).click();

    await expect
      .poll(() => findMutation(mock, "rutina_ejercicio_serie").length, { timeout: 20_000 })
      .toBeGreaterThan(0);

    const plan = mock.rutinaEjercicioSeries;
    expect(plan).toHaveLength(4);

    // El calentamiento va primero y el orden es 0..3 sin huecos.
    expect(plan.map((s) => s.orden)).toEqual([0, 1, 2, 3]);
    expect(plan.map((s) => s.tipo_serie)).toEqual([
      "calentamiento",
      "efectiva",
      "efectiva",
      "efectiva",
    ]);

    // La pirámide baja de 8-12 a 4-8 en las series efectivas.
    const efectivas = plan.filter((s) => s.tipo_serie === "efectiva");
    expect(efectivas.map((s) => s.repes_min)).toEqual([8, 6, 4]);
    expect(efectivas.map((s) => s.repes_max)).toEqual([12, 10, 8]);

    // Todas cuelgan del ejercicio insertado.
    const ejercicioIds = new Set(mock.rutinaEjercicios.map((e) => e.id));
    expect(ejercicioIds.size).toBe(1);
    for (const s of plan) expect(ejercicioIds.has(s.rutina_ejercicio_id)).toBe(true);

    // El resumen denormalizado cubre el rango completo del plan.
    const [ejercicio] = mock.rutinaEjercicios;
    expect(ejercicio.series_objetivo).toBe(4);
    expect(ejercicio.repes_min).toBe(4);
    expect(ejercicio.repes_max).toBe(12);
  });
});
