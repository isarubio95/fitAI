import { describe, expect, it } from "vitest";
import {
  dailyHealthFieldsFromForm,
  dateHasHealthRecord,
  emptyHealthLogForm,
  findRecordByFecha,
  formFromRecords,
  hasCompositionValues,
  isoDateKey,
  parseOptionalNumber,
  parseSleepHours,
  todayIso,
} from "@/lib/healthLogForm";

describe("healthLogForm", () => {
  it("prefilla el día desde medida y salud", () => {
    const form = formFromRecords(
      "2026-09-12",
      { fecha: "2026-09-12", peso: 74.2, cintura: 80, notas: "amanecer" },
      { fecha: "2026-09-12", calorias: 2200, sueno_min: 450, calidad_sueno: 4, fc_reposo: 52 },
    );
    expect(form.peso).toBe("74.2");
    expect(form.cintura).toBe("80");
    expect(form.calorias).toBe("2200");
    expect(form.suenoHoras).toBe("7.5");
    expect(form.calidad).toBe(4);
    expect(form.fcReposo).toBe("52");
    expect(form.notas).toBe("amanecer");
  });

  it("ignora registros de otra fecha", () => {
    const form = formFromRecords(
      "2026-09-12",
      { fecha: "2026-09-11", peso: 74 },
      { fecha: "2026-09-11", calorias: 1800 },
    );
    expect(form).toEqual(emptyHealthLogForm("2026-09-12"));
  });

  it("detecta registro existente y composición", () => {
    expect(dateHasHealthRecord("2026-09-12", undefined, { fecha: "2026-09-12" })).toBe(true);
    expect(hasCompositionValues({ fecha: "2026-09-12", cintura: 81 }, "2026-09-12")).toBe(true);
    expect(hasCompositionValues({ fecha: "2026-09-12", peso: 74 }, "2026-09-12")).toBe(false);
  });

  it("parsea opcionales y rechaza fuera de rango", () => {
    expect(parseOptionalNumber("", 0)).toEqual({ ok: true, value: null });
    expect(parseOptionalNumber("7,5", 0, 24)).toEqual({ ok: true, value: 7.5 });
    expect(parseOptionalNumber("30", 0, 24)).toEqual({ ok: false });
  });

  it("todayIso usa yyyy-MM-dd", () => {
    expect(todayIso(new Date("2026-09-12T15:00:00"))).toBe("2026-09-12");
  });

  it("normaliza fechas ISO con hora al día", () => {
    expect(isoDateKey("2026-09-12T00:00:00+00:00")).toBe("2026-09-12");
    expect(findRecordByFecha([{ fecha: "2026-09-12T00:00:00Z", sueno_min: 480 }], "2026-09-12")).toEqual({
      fecha: "2026-09-12T00:00:00Z",
      sueno_min: 480,
    });
    expect(
      formFromRecords("2026-09-12", undefined, {
        fecha: "2026-09-12T00:00:00+00:00",
        sueno_min: 450,
        calidad_sueno: 5,
      }).suenoHoras,
    ).toBe("7.5");
  });

  it("parsea horas de sueño en formatos habituales", () => {
    expect(parseSleepHours("")).toEqual({ ok: true, value: null });
    expect(parseSleepHours("7,5")).toEqual({ ok: true, value: 7.5 });
    expect(parseSleepHours("7:30")).toEqual({ ok: true, value: 7.5 });
    expect(parseSleepHours("7h30")).toEqual({ ok: true, value: 7.5 });
    expect(parseSleepHours("8h")).toEqual({ ok: true, value: 8 });
    expect(parseSleepHours("25")).toEqual({ ok: false });
  });

  it("incluye sueno_min al guardar horas aunque ya haya calidad", () => {
    const form = emptyHealthLogForm("2026-09-12");
    form.suenoHoras = "8";
    form.calidad = 5;
    expect(dailyHealthFieldsFromForm(form)).toEqual({
      ok: true,
      fields: { fecha: "2026-09-12", sueno_min: 480, calidad_sueno: 5 },
    });
  });
});
