/**
 * Prompts de análisis del historial. Solo leen.
 *
 * Los tres siguen la misma forma: enumeran las llamadas exactas —con las fechas
 * ya calculadas— y luego dicen qué contar. El orden importa: si el prompt pide
 * primero las conclusiones, el modelo las escribe y después busca datos que las
 * respalden.
 *
 * Todos terminan prohibiendo lo mismo, rellenar los huecos. Un resumen mensual
 * con cifras inventadas es indistinguible de uno correcto para quien lo lee, y
 * esa es justo la propiedad que el §1 de docs/MEJORAS-MCP.md defiende: aquí no
 * se genera texto, se abre una puerta a datos que ya existen.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import { shiftIso, todayIso } from "./dates.ts";
import { userPrompt } from "./message.ts";

export function registerTrainingPrompts(server: McpServer): void {
  // -------------------------------------------------------------------------
  server.registerPrompt(
    "analiza-mi-mes",
    {
      title: "Analiza mi mes",
      description:
        "Volumen, reparto por músculo, adherencia al calendario y récords del último mes, " +
        "comparados con el mes anterior.",
    },
    () => {
      const hoy = todayIso();
      const inicio = shiftIso(hoy, -29);
      const previoFin = shiftIso(inicio, -1);
      const previoInicio = shiftIso(previoFin, -29);

      return userPrompt(`
Analiza mi último mes de entrenamiento y compáralo con el anterior.

Haz exactamente estas llamadas antes de escribir nada:

1. \`get_training_summary\` con from=${inicio}, to=${hoy}, group_by='total'.
2. \`get_training_summary\` con from=${previoInicio}, to=${previoFin}, group_by='total' (el mes anterior, para comparar).
3. \`get_training_summary\` con from=${inicio}, to=${hoy}, group_by='muscle'.
4. \`get_personal_records\` con months=2, limit=15.
5. \`get_schedule\` con from=${inicio}, to=${hoy}.

Y cuéntamelo en este orden, breve y con los números delante:

- **Volumen**: sesiones, series efectivas, tonelaje y tiempo entrenado del último mes, y cuánto suben o bajan respecto al mes anterior.
- **Reparto por músculo**: qué grupos se llevan el trabajo y cuáles se están quedando cortos.
- **Adherencia**: cuántos huecos había programados en el calendario y cuántos se cumplieron.
- **Levantamientos**: de los mejores de los últimos dos meses, cuáles cayeron dentro de este último mes; míralo por la fecha de cada uno.

Reglas: no calcules nada que no salga de esas cinco llamadas, y si alguna vuelve vacía dilo en una línea en vez de rellenar el hueco. Los totales del mes salen de la llamada 1, nunca de sumar la 3: ahí un mismo entreno aparece en cada grupo muscular que tocó, y el tiempo y el RPE vienen vacíos a propósito. Cierra con una sola recomendación, la que se apoye en el dato más claro.
      `);
    },
  );

  // -------------------------------------------------------------------------
  server.registerPrompt(
    "donde-me-he-estancado",
    {
      title: "Dónde me he estancado",
      description:
        "Ejercicios que llevan semanas sin mejorar, con la progresión que lo demuestra.",
    },
    () =>
      userPrompt(`
Busca en qué ejercicios llevo tiempo sin progresar.

1. Llama a \`get_personal_records\` con months=6 y limit=20. Devuelve mi mejor serie por ejercicio y la fecha en que la hice.
2. Coge los cinco cuya fecha sea más antigua: son los candidatos. Para cada uno, llama a \`get_exercise_progress\` con su tipo_ejercicio_id, months=6 y detail='daily_best'.

Considero estancado un ejercicio cuyo 1RM estimado no ha mejorado en las últimas seis semanas de datos. Para cada uno que lo cumpla, dime:

- Nombre, mejor marca (peso x reps y 1RM estimado) y cuándo fue.
- Qué han hecho los valores desde entonces: los tres o cuatro últimos días registrados, con sus cifras.
- Cuántos días lo he entrenado en ese periodo, contando las filas que devolvió \`get_exercise_progress\`.

Reglas: un ejercicio con menos de cuatro días registrados en seis meses no está estancado, está sin datos; dilo así y no lo cuentes. No propongas cambiar nada de un ejercicio que no hayas mirado con \`get_exercise_progress\`. Si ninguno cumple el criterio, dímelo tal cual: es una buena noticia, no un fallo.
      `),
  );

  // -------------------------------------------------------------------------
  server.registerPrompt(
    "resumen-fuerza-y-cardio",
    {
      title: "Fuerza y cardio juntos",
      description:
        "Los tres últimos meses cruzando las dos mitades del diario: sesiones de fuerza y de cardio, semana a semana.",
    },
    () => {
      const hoy = todayIso();
      // 90 días: por debajo del tope de rango de get_training_summary (120) y
      // suficiente para que la vista por semanas tenga forma.
      const inicio = shiftIso(hoy, -89);

      return userPrompt(`
Enséñame cómo se reparten mis tres últimos meses entre fuerza y cardio.

1. \`get_training_summary\` con from=${inicio}, to=${hoy}, group_by='week'. Cada fila trae ya las dos mitades de esa semana: sessions, working_sets y tonnage_kg de fuerza, y cardio_sessions, cardio_seconds y cardio_distance_m de cardio.
2. \`list_cardio_sessions\` con from=${inicio}, to=${hoy}, limit=50, que es lo único que dice **de qué** era cada cardio. Si la respuesta trae next_offset, sigue paginando hasta agotarlo.

Después, semana a semana (empiezan en lunes y van en UTC):

- Sesiones de fuerza y de cardio en cada una, y qué disciplinas fueron esos cardios.
- Tonelaje de fuerza frente a distancia y tiempo de cardio.
- Qué semanas cargaron las dos cosas a la vez y cuáles dejaron una fuera del todo.

Termina diciéndome si las dos van en paralelo o si una se come a la otra, apoyándote en las semanas concretas que lo enseñan. Las unidades vienen en el nombre de cada clave: kg, metros y segundos. Conviértelas a algo legible pero di siempre de qué cifra sales, y no sumes una semana que la llamada no haya devuelto.
      `);
    },
  );
}
