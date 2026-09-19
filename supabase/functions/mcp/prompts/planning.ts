/**
 * Prompts de rutinas y calendario.
 *
 * `planifica-la-semana` es el único prompt del catálogo que acaba escribiendo.
 * Por eso propone primero y programa después de que el usuario diga que sí:
 * `schedule_routine` es idempotente y `unschedule_routine` lo deshace, así que
 * el riesgo real es bajo, pero un comando de un clic que llena el calendario
 * sin preguntar convierte una sugerencia en una decisión tomada por otro.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import { mondayOf, shiftIso, todayIso } from "./dates.ts";
import { userPrompt } from "./message.ts";

export function registerPlanningPrompts(server: McpServer): void {
  // -------------------------------------------------------------------------
  server.registerPrompt(
    "planifica-la-semana",
    {
      title: "Planifica la semana",
      description:
        "Propone la semana que viene a partir de lo que ya se ha entrenado y, si lo apruebas, " +
        "la programa en el calendario.",
    },
    () => {
      const hoy = todayIso();
      const lunes = shiftIso(mondayOf(hoy), 7);
      const domingo = shiftIso(lunes, 6);
      const inicioHistorial = shiftIso(hoy, -27);

      return userPrompt(`
Propónme la semana del ${lunes} al ${domingo}, mirando antes lo que llevo entrenado.

1. \`get_training_summary\` con from=${inicioHistorial}, to=${hoy}, group_by='week': cuántas sesiones hago por semana de verdad.
2. \`get_training_summary\` con from=${inicioHistorial}, to=${hoy}, group_by='muscle': qué he trabajado estas cuatro semanas y qué se ha quedado corto.
3. \`get_schedule\` con from=${inicioHistorial}, to=${domingo}: qué llegué a cumplir de lo que había programado, y si la semana que viene ya tiene algo puesto.
4. \`list_routines\` con scope='all': mis rutinas y las plantillas de la app.

Con eso, propónme un calendario día a día del ${lunes} al ${domingo}:

- Una rutina de las que existen por cada día de entrenamiento, con su nombre y su routine_id.
- Tantos días como vengo entrenando de media según el punto 1, ni uno más: si últimamente son tres, no me pongas cinco.
- Que los grupos que salieron cortos en el punto 2 caigan pronto en la semana, y que no se repita el mismo grupo en días seguidos.
- Los días de descanso, dichos como tales.

Enséñame la propuesta y **espera a que yo diga que sí**. Solo entonces llama a \`schedule_routine\` una vez por rutina, con sus fechas. Si algún día ya tenía algo programado, respétalo y dímelo en vez de duplicarlo.

No inventes rutinas: si falta una para lo que propones, dímelo y sigue con las que hay.
      `);
    },
  );

  // -------------------------------------------------------------------------
  server.registerPrompt(
    "revisa-mi-rutina",
    {
      title: "Revisa mi rutina",
      description:
        "Equilibrio de grupos musculares, volumen por sesión y descansos de una rutina, contra lo que entreno de verdad.",
    },
    () => {
      const hoy = todayIso();
      const inicio = shiftIso(hoy, -55);

      return userPrompt(`
Revísame una rutina.

1. Llama a \`list_routines\` con scope='mine'. Si solo tengo una, esa; si tengo varias, enséñamelas y pregúntame cuál antes de seguir.
2. \`get_routine\` con su routine_id: ejercicios en orden, series objetivo, rango de repeticiones, RIR y descansos.
3. \`get_training_summary\` con from=${inicio}, to=${hoy}, group_by='muscle', para contrastar la rutina con lo que de verdad estoy entrenando.

Dime, en este orden:

- **Reparto**: series efectivas por grupo muscular en la rutina. Cuál domina y cuál apenas aparece.
- **Carga por sesión**: series totales y cuánto duraría según los descansos declarados.
- **Estructura**: si hay superseries (ejercicios que comparten superset_id), si los ejercicios grandes van antes que los de aislamiento, y si algún rango de repeticiones o RIR desentona con el resto.
- **Contraste**: en qué se parece o se diferencia el reparto de la rutina del que sale de mis últimas ocho semanas.

Reglas: usa solo los números de \`get_routine\`; las series de calentamiento no cuentan como volumen. Si la rutina trae plan por serie, esa es la fuente de verdad y los objetivos del ejercicio son un resumen suyo. Termina con los dos cambios concretos que más cambiarían el reparto, y no me reescribas la rutina entera salvo que te lo pida.
      `);
    },
  );
}
