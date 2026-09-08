# PLAN DE ENTRENAMIENTO — Análisis Histórico Detallado

> **Propósito de este documento:** servir como base de conocimiento "megadetallada" del historial real de entrenamiento del usuario, para que una IA pueda generar rutinas totalmente personalizadas basadas en su progresión, preferencias de ejercicios, rangos de repeticiones, RIR y volumen por grupo muscular.

- **Usuario:** `isarubio95` (isarubio95@gmail.com)
- **Nivel app:** 25 · **XP:** 24.855 · **Racha:** 8 días
- **Periodo analizado:** 7 feb 2026 → 22 ago 2026
- **Sesiones de fuerza completadas:** 99 (97 de fuerza + 2 de "Abs")
- **Series registradas:** 1.997 · **Ejercicios ejecutados:** 592
- **Sesiones de cardio:** 6 salidas en bici (domingos, jul–ago) + 1 caminata
- **Estructura actual:** Full-body A/B/C, 3 días/semana (mar–jue–sáb) + tirada larga de bici el domingo
- **Estructura previa (Meso 1-4):** Torso / Pierna (split TP, 4 días/semana) con variantes A/B alternas
- **⚠️ Estado a 1 sep 2026:** **esguince de ligamento colateral fibular (LCF) del tobillo derecho**, ocurrido el ~22 ago. Día 10 de evolución, en fase de recuperación pero aún sintomático. El Mesociclo 6 quedó cortado en la semana 3. El Mesociclo 7 arranca con dos semanas de rutinas adaptadas (ver sección 7).
- **Fuente de datos:** base de datos de la app (`actividad` → `ejercicio` → `serie`, y `cardio_sesion` → `cardio_bloque`)
- **Última actualización de este documento:** 1 sep 2026

---

## 0. Notas importantes sobre los datos (leer antes de interpretar)

Estas advertencias son clave para que la IA no saque conclusiones erróneas:

1. **Ejercicios de peso corporal se registran con `peso = 0`**: Dominadas, Fondos/Dips, Plancha, Cocoons, Elevación de piernas y Crunch colgado. En estos, el dato relevante son las **repeticiones** (o segundos en Plancha), no el peso.
2. **El peso del Mesociclo 1 en barra está infravalorado**: en Press Banca, Prensa y similares los valores del Meso 1 (p. ej. Press Banca 12,5–17,5 kg, Prensa 32–52 kg) parecen registrados sin contar la barra o por convención distinta, porque en el Meso 3 saltan a 50–60 kg y 130 kg respectivamente. **No se deben comparar cargas absolutas del Meso 1 con las posteriores** en estos ejercicios; sí es válida la progresión *dentro* de cada mesociclo.
3. **Notación de series:** `peso x repeticiones`. Cuando hay dato de RIR por serie se añade `(RIRn)`. `0x0` = serie registrada vacía / fallida (ignorar).
4. **1RM estimado (e1RM):** fórmula de Epley `peso × (1 + 0,0333 × reps)`. Usado solo como referencia de tendencia.
5. **Plancha:** en Meso 1-4 las repeticiones representan **segundos**. Desde el Meso 5 el ejercicio usa registro `duracion`, y el tiempo va en el campo de duración (las reps aparecen como 0).
6. **El Meso 5 tiene menos sesiones por semana (3 en vez de 4)**: no comparar volumen total de bloque sin normalizar por semana. El volumen *por sesión* subió.
7. **El cardio no está en `actividad`**: vive en `cardio_sesion`. Por eso los conteos de "sesiones" de fuerza no incluyen las salidas en bici.
8. **El Meso 6 solo tiene 3 semanas de las 5 previstas** (se cortó por la lesión del 22 ago). Su volumen *total* no es comparable con el de bloques completos; usar siempre volumen por sesión o por semana.
9. **El campo `rpe` de `actividad` solo tiene 2 registros** en todo el historial (20 y 22 ago). No hay serie temporal de RPE con la que trabajar todavía.

---

## 1. Resumen global de los 6 mesociclos

| Meso | Fechas | Sesiones | Rutinas | Foco / cambios principales |
|------|--------|----------|---------|----------------------------|
| **1** | 07 feb – 03 mar | 15 | TORSO A/B, PIERNA A/B | Base. Sentadilla + Press Banca + Press Militar barra. Dominadas y Dips a peso corporal. |
| **2** | 10 mar – 05 abr | 16 | Torso A/B, Pierna A/B | Introduce Prensa pesada, Press Banca Cerrado/Inclinado, banco Scott, T-Bar. Aparece Core (Crunch). |
| **3** | 07 abr – 14 may | 20 | Torso A/B, Pierna A/B | Mayor volumen de pierna (pico histórico). Sentadilla + Prensa altas. Más trabajo de Core y brazo. |
| **4** | 16 may – 21 jun | 22 | Torso A/B, Pierna A/B (+2 Abs) | Más volumen de torso. Hack Squat y Aductores nuevos. Press Banca estancado en 60 kg. |
| **5** | 30 jun – 01 ago | 15 | **Día A/B/C (full-body)** | **Cambio de estructura**: de Torso/Pierna 4 días a **full-body 3 días** (mar-jue-sáb) para dejar el domingo libre a la bici. Vuelve la Sentadilla libre. Sábado deliberadamente ligero de pierna. |
| **6** | 04 ago – 22 ago | 9 | Día A/B/C (6) | Vuelve la Prensa Inclinada, primer trabajo de deltoides posterior del historial, Dominadas con lastre. **Cortado en la semana 3 por el esguince de tobillo** (previsto 5 semanas, ejecutadas 3). |

### Volumen total por mesociclo (kg levantados = Σ peso×reps)

| Meso | Semanas | Sesiones | Volumen total (kg) | Series totales | Reps totales | Volumen / sesión |
|------|:-------:|:--------:|-------------------:|---------------:|-------------:|-----------------:|
| 1 | 3,5 | 15 | 67.955 | 279 | 2.740 | 4.530 |
| 2 | 4 | 16 | 76.937 | 287 | 2.891 | 4.809 |
| 3 | 5,5 | 20 | 121.095 | 417 | 4.755 | 6.055 |
| 4 | 5 | 22 | 131.429 | 413 | 5.028 | 5.974 |
| 5 | 5 | 15 | 101.111 | 361 | 3.897 | **6.741** |
| 6 | 3 | 9 | 82.384 | 243 | 2.670 | **9.154** |

> El volumen **total** de bloque baja en el Meso 5 (101 t vs 131 t) simplemente porque son 3 sesiones/semana en vez de 4-5. El indicador honesto es el volumen **por sesión**, que marca máximo histórico bloque tras bloque: 6.741 kg en el Meso 5 y **9.154 kg en el Meso 6** (+36 %). La densidad de trabajo por sesión ha crecido en los 6 bloques sin excepción.

### Carga semanal comparada (fuerza + bici)

| Meso | Sesiones fuerza/sem | Series/sem | Volumen/sem (kg) | Cardio |
|------|:-------------------:|:----------:|-----------------:|--------|
| 4 | ~4,4 | 83 | 26.286 | — |
| 5 | 3,0 | 72 | 20.222 | ~1 salida/sem, 1-1,75 h |
| 6 | 3,0 | 81 | 27.461 | 1 salida/sem, 2-2,6 h |

> El Meso 5 recortó ~23 % del volumen semanal de gimnasio y lo sustituyó por ciclismo de resistencia. Es un cambio de reparto, no una bajada de carga total.
>
> ⚠️ **El Meso 6 subió las dos cosas a la vez**: el volumen semanal de gimnasio recuperó el nivel del Meso 4 (27,5 t, máximo histórico) *y* las salidas de bici pasaron de 1 h 44 min a 2 h 37 min en tres semanas. Es la ventana en la que aparece la lesión, y conviene tenerlo presente al planificar el retorno.

---

## 2. Progresión de levantamientos clave (entre mesociclos)

e1RM estimado (kg). Recordar la advertencia de cargas del Meso 1.

| Ejercicio | Meso 1 | Meso 2 | Meso 3 | Meso 4 | Meso 5 | Meso 6 | Tendencia |
|-----------|:------:|:------:|:------:|:------:|:------:|:------:|-----------|
| Sentadilla con Barra | 52,4 | — | 70,9 | — | 70,9 | 70,9 | ⏸ plano dos bloques (57,5 kg) |
| Press Banca con Barra | (20,4)* | — | 72,0 | 74,0 | 74,0 | 75,0 | ⏸ **meseta de 4 bloques** |
| Peso Muerto con Barra | (72,0)* | — | — | 82,3 | — | — | (fuera del programa desde el Meso 4) |
| Peso Muerto Rumano | 53,3 | 66,7 | 70,0 | 78,6 | 80,0 | 80,0 | ⏸ plano (60 kg, con series de descarga a 55) |
| Hip Thrust con Barra | 76,0 | 80,2 | 85,5 | 91,0 | 91,0 | 91,0 | ⏸ plano tres bloques (65 kg) |
| Prensa Inclinada | (69,3)* | 145,6 | 181,9 | — | — | 170,8 | ▲ recuperada (115 → 125 kg) |
| Press Militar Barra | 31,7 | — | — | 33,3 | **38,0** | 38,0 | ⏸ consolida los 30 kg |
| Remo en Pronación Barra | — | — | 53,3 | 56,0 | 58,1 | **60,0** | ▲ constante (42,5 → 45 kg) |
| Press Inclinado con Barra | — | 55,5 | 63,0 | 63,0 | 61,7 | **68,2** | ▲▲ PR de carga (52,5 kg) |
| Jalón Abierto en Polea Alta | — | — | 54,6 | 57,8 | 57,8 | 57,8 | ⏸ plano, pero cierra las 4 series a 12 reps |
| Remo Horizontal Cerrado en Polea | 54,6 | — | — | 57,8 | 61,0 | 61,0 | ⏸ plano (43,6 kg) |
| Extensión de Cuádriceps | 40,8 | 43,4 | 48,0 | 51,4 | 51,4 | 51,4 | ⏸ plano tres bloques |
| Curl Femoral Vertical | 33,3 | 45,7 | 54,9 | — | 54,9 | 51,4 | ▼ bajó de 36,6 a 34,3 kg |
| Dominada (lastre) | 0 | 0 | 0 | 0 | 0 | **+5 kg** | ▲▲ nuevo: pasa de peso corporal a lastre |

`*` valores del Meso 1 con probable infrarregistro de carga (ver Nota 2).

### Lecturas para la IA
- **El Press Banca sigue sin moverse:** cuarto bloque consecutivo alrededor de e1RM 74-75. Se ha probado con 4-6 reps (Meso 5) y con 6-8 reps (Meso 6) y ninguna de las dos ha desbloqueado los 60 kg. Lo que sí mejoró en el Meso 6 es la **caída de reps entre series** (de 6-6-5-4 a 6-6-6-5), lo que apunta a que el problema es de fatiga intra-ejercicio y de descansos, no de fuerza máxima.
- **El Meso 6 sí cerró la doble progresión** en Remo con Barra, Press Inclinado, Elevaciones Laterales, Extensión de Tríceps y Crunch. Es la lección más útil del bloque: el sistema funciona cuando se sube la carga al tocar el techo del rango.
- **La cadena posterior lleva tres bloques plana:** RDL en 60 kg (con las series 3-4 bajando a 55) e Hip Thrust en 65 kg desde el Meso 5. Coincide en el tiempo con la escalada de la bici del domingo, que pasó de 18 km a 61 km.
- **Deltoides posterior ya no es un hueco:** el Meso 6 introdujo *Pájaros Aislados en Polea*, pero la carga se quedó en 2,3-3,55 kg. Migrarlo a máquina permite progresar de forma medible.
- **Gemelo es el peor gestionado del programa:** 25 → 22,5 kg entre el Meso 5 y el 6, es decir, dos bloques *retrocediendo*. Y es, además, el tejido directamente implicado en la lesión actual.

---

## 3. Volumen por grupo muscular y mesociclo

Series efectivas y volumen (kg). Útil para equilibrar el reparto en futuras rutinas.

### Mesociclo 1
| Grupo | Series | Reps | Volumen (kg) |
|-------|:------:|:----:|-------------:|
| Pierna | 113 | 1.110 | 34.806 |
| Espalda | 55 | 509 | 15.055 |
| Pecho | 56 | 532 | 11.801 |
| Hombro | 28 | 296 | 2.988 |
| Bíceps | 12 | 137 | 1.827 |
| Tríceps | 12 | 137 | 1.478 |
| Core | 3 | 19 | 0 (peso corporal) |

### Mesociclo 2
| Grupo | Series | Reps | Volumen (kg) |
|-------|:------:|:----:|-------------:|
| Pierna | 110 | 1.116 | 44.563 |
| Espalda | 56 | 519 | 11.569 |
| Pecho | 55 | 518 | 11.213 |
| Core | 14 | 199 | 4.538 |
| Bíceps | 12 | 120 | 2.390 |
| Hombro | 28 | 280 | 1.428 |
| Tríceps | 12 | 139 | 1.236 |

### Mesociclo 3
| Grupo | Series | Reps | Volumen (kg) |
|-------|:------:|:----:|-------------:|
| Pierna | 150 | 1.531 | 73.433 |
| Espalda | 70 | 664 | 16.542 |
| Pecho | 55 | 517 | 15.750 |
| Tríceps | 29 | 299 | 5.294 |
| Bíceps | 30 | 291 | 4.138 |
| Core | 48 | 1.092 | 3.123 |
| Hombro | 35 | 361 | 2.715 |

### Mesociclo 4
| Grupo | Series | Reps | Volumen (kg) |
|-------|:------:|:----:|-------------:|
| Pierna | 140 | 1.642 | 64.102 |
| Espalda | 77 | 773 | 25.344 |
| Pecho | 80 | 865 | 21.256 |
| Core | 28 | 649 | 7.097 |
| Hombro | 38 | 537 | 5.092 |
| Tríceps | 15 | 202 | 3.180 |
| Bíceps | 15 | 209 | 3.063 |
| Cuádriceps* | 20 | 151 | 2.295 |

`*` "Cuádriceps" aparece como grupo propio en Meso 4 por el Hack Squat (catalogado aparte de "Pierna").

### Mesociclo 5
| Grupo | Series | Reps | Volumen (kg) | Series/semana |
|-------|:------:|:----:|-------------:|:-------------:|
| Pierna | 110 | 1.178 | 47.480 | 22,0 |
| Espalda | 67 | 638 | 21.165 | 13,4 |
| Pecho | 64 | 577 | 16.576 | 12,8 |
| Hombro | 45 | 567 | 5.516 | 9,0 |
| Tríceps | 30 | 360 | 6.220 | 6,0 |
| Bíceps | 30 | 325 | 4.154 | 6,0 |
| Core | 15 | 252 | 0 (peso corporal) | 3,0 |

### Mesociclo 6 *(3 semanas, bloque incompleto)*
| Grupo | Series | Reps | Volumen (kg) | Series/semana |
|-------|:------:|:----:|-------------:|:-------------:|
| Pierna | 72 | 799 | 40.695 | 24,0 |
| Espalda | 45 | 439 | 15.639 | 15,0 |
| Pecho | 45 | 410 | 11.896 | 15,0 |
| Tríceps | 18 | 229 | 4.119 | 6,0 |
| Hombro | 36 | 477 | 3.856 | 12,0 |
| Core | 9 | 119 | 3.522 | 3,0 |
| Bíceps | 18 | 197 | 2.657 | 6,0 |

> **Observación:** Pierna domina siempre (~50 % del volumen). Espalda > Pecho hasta Meso 4, donde Pecho casi iguala a Espalda por el aumento de trabajo de pectoral. **Hombro, Bíceps y Tríceps reciben relativamente poco volumen** comparado con tren inferior.
>
> El Meso 5 corrige parcialmente ese desequilibrio: al ser full-body, cada grupo recibe **2-3 exposiciones semanales** en vez de 1-2. Hombro sube a 9 series/semana (récord) y espalda y pecho quedan casi igualados, que es lo deseable.
>
> El Meso 6 lleva Hombro a **12 series/semana** (nuevo récord, con el estreno de deltoides posterior) y deja Espalda y Pecho empatados a 15. **Core sigue siendo el hueco**: 3 series/semana, todas en la misma sesión del sábado, porque el ejercicio de core del Día A nunca se ejecutó.

---

## 3 bis. Ciclismo — tiradas largas de domingo

Bloque de cardio incorporado a partir del **Meso 5**. Todas las salidas caen en **domingo**, y el diseño del Meso 5 lo tuvo en cuenta explícitamente (el sábado se dejó como sesión ligera de pierna en máquina para llegar fresco).

| Fecha | Día | Distancia | Tiempo | Vel. media | Desnivel + |
|-------|-----|----------:|-------:|-----------:|-----------:|
| 05 jul | Domingo | 18,3 km | 51:07 | 21,5 km/h | 212 m |
| 12 jul | Domingo | 27,1 km | 1:15:35 | 21,5 km/h | 206 m |
| 19 jul | Domingo | 32,0 km | 1:29:39 | 21,4 km/h | 494 m |
| 02 ago | Domingo | 42,2 km | 1:44:19 | **24,2 km/h** | 434 m |
| 09 ago | Domingo | 51,1 km | 2:15:28 | 22,6 km/h | — |
| 16 ago | Domingo | 60,6 km | 2:36:53 | 23,2 km/h | 326 m |
| 23 ago | Domingo | — | — | — | *(sin salida: lesión)* |
| 30 ago | Domingo | — | — | — | *(sin salida: lesión)* |

**Totales acumulados:** 231,2 km · 10 h 12 min · 1.672 m de desnivel positivo (7 salidas).
**Otros:** 13 ago — caminata de 45:36 (sin distancia registrada).

### Lecturas
- **Progresión muy clara y rápida:** la distancia se ha más que triplicado en seis semanas (18 → 61 km). Es la mejora más marcada de todo el periodo analizado, en cualquier disciplina.
- **El objetivo de las 2 h se superó el 09 ago y se rebasó ampliamente el 16 ago (2 h 37 min).** Ese salto de 1:44 → 2:15 → 2:37 en tres domingos consecutivos es un +50 % de tiempo en sillín en tres semanas, muy por encima de la regla habitual del 10 % semanal.
- **Coincidencia relevante con la lesión:** las tres semanas de mayor volumen de bici son también las tres semanas de mayor volumen de gimnasio del historial (27,5 t/semana). El esguince llega justo al final de esa ventana. No es una relación causal demostrable, pero sí un patrón de carga acumulada que conviene no repetir en el retorno.
- **Faltan datos de frecuencia cardiaca, potencia y cadencia** en las 7 sesiones. Sin ellos no se puede estimar la carga interna de la bici ni cruzarla con la fatiga del gimnasio. Si el dispositivo lo permite, registrarlos multiplicaría el valor de este análisis.

### Implicación para el diseño del gimnasio
La bici del domingo condiciona la semana entera:

| Día | Estado de piernas | Uso recomendado |
|-----|-------------------|-----------------|
| Domingo | Tirada larga (2 h) | Cardio |
| Lunes | Fatiga alta | Descanso |
| **Martes** | Recuperado | **Sesión pesada de pierna** (sentadilla) |
| Miércoles | Agujetas de sentadilla | Descanso |
| **Jueves** | Aceptable | Cadena posterior con carga moderada |
| Viernes | — | Descanso |
| **Sábado** | Debe quedar fresco | **Pierna ligera de máquina**, nada de básicos |

Este es exactamente el reparto que ya siguió el Meso 5, y funcionó: no hay ninguna sesión saltada por fatiga en las 5 semanas.

---

## 4. DETALLE COMPLETO POR MESOCICLO

Formato de cada ejercicio: **Nombre** *(grupo)* `rango reps · RIR objetivo` → series como `peso×reps`.

---

# 🟦 MESOCICLO 1 — Base (07 feb – 03 mar 2026)

**15 sesiones.** Rutinas: TORSO A, PIERNA A, TORSO B, PIERNA B (Dominante Cadera/Posterior). Numeración aún sin "(n)".

### Rutina TORSO A — 07 feb
- **Dominada** *(Espalda)* `6-8 · RIR1` → 0×6, 0×6, 0×5
- **Fondos en Paralelas (Dips)** *(Pecho)* `8-10 · RIR1` → 0×10, 0×8, 0×7
- **Press Banca con Barra** *(Pecho)* `5-7 · RIR2` → 12,5×8, 12,5×7, 12,5×6, 12,5×6
- **Press Militar con Barra (Overhead)** *(Hombro)* `6-8 · RIR1` → 20×8, 20×8, 20×7
- **Remo Inclinado en Pronación con Barra** *(Espalda)* `6-8 · RIR2` → 30×8, 30×8, 30×8, 30×10

### Rutina PIERNA A — 08 feb
- **Sentadilla con Barra** *(Pierna)* `5-7 · RIR2` → 30×7, 30×7, 35×6, 40×6
- **Prensa Inclinada** *(Pierna)* `8-10 · RIR1` → 32×10, 39×11, 52×8
- **Peso Muerto Rumano con Barra** *(Pierna)* `8-10 · RIR2` → 30×8, 30×9, 35×8
- **Curl Femoral Horizontal en Máquina** *(Pierna)* `10-12 · RIR1` → 23×10, 23×9, 23×8
- **Extensión de Gemelos de pie** *(Pierna)* `10-12 · RIR1` → 32×12, 32×12, 40×10, 40×10
- **Plancha** *(Core)* → 0×8, 0×6, 0×5

### Rutina TORSO B — 10 feb
- **Press Inclinado en Supinación con Mancuernas** *(Pecho)* `8-12 · RIR1` → 12×12, 12×12, 14×9, 14×9
- **Aperturas en Máquina** *(Pecho)* `12-15 · RIR0` → 39×15, 45×14, 45×12
- **Jalón en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 32×11, 39×8, 35,3×9
- **Remo Horizontal Cerrado Neutro en Polea** *(Espalda)* `12-15 · RIR0` → 32×15, 39×12, 32×15
- **Elevaciones Laterales Neutras con Mancuernas** *(Hombro)* `12-15 · RIR0` → 5×12, 5×10, 4×12, 3×12
- **Curl en Supinación con Barra** *(Bíceps)* `10-12 · RIR0` → 9×12, 9×12, 9×12
- **Extensión Vertical en Pronación en Polea Alta** *(Tríceps)* `10-12 · RIR0` → 9×12, 9×12, 9×12

### Rutina PIERNA B (Dominante Cadera/Posterior) — 12 feb
- **Peso Muerto con Barra** *(Pierna)* → 40×6 (RIR2), 45×6 (RIR2), 45×6 (RIR2)
- **Hip Thrust con Barra** *(Pierna)* → 40×12 (RIR1), 40×10 (RIR1), 40×9 (RIR1)
- **Zancada Delantera con Mancuernas** *(Pierna)* → 7×10 (RIR1), 6×10 (RIR1), 5×10 (RIR1)
- **Curl Femoral Vertical en Máquina** *(Pierna)* → 18×15 (RIR0), 18×13 (RIR0), 18×12 (RIR0)
- **Extensión de Cuádriceps en Máquina** *(Pierna)* → 25×13 (RIR0), 22,6×14 (RIR0), 20,3×14 (RIR0)

### Rutina TORSO A — 14 feb
- **Dominada** → 0×6, 0×6, 0×5
- **Fondos en Paralelas (Dips)** → 0×10, 0×9, 0×9
- **Press Banca con Barra** → 13,75×6, 13,75×5, 12,5×6, 12,5×5
- **Press Militar con Barra (Overhead)** → 22,5×8, 22,5×8, 22,5×8
- **Remo Inclinado en Pronación con Barra** → 32,5×8, 32,5×8, 32,5×8, 32,5×7

### Rutina PIERNA A — 15 feb
- **Sentadilla con Barra** → 32,5×7, 35×7, 35×7, 40×6
- **Prensa Inclinada** → 39×10, 45×10, 52×9
- **Peso Muerto Rumano con Barra** → 30×10, 30×10, 35×10
- **Curl Femoral Horizontal en Máquina** → 23×11, 23×10, 23×9
- **Extensión de Gemelos de pie** → 40×10, 40×8, 30×10, 30×9

### Rutina TORSO B — 17 feb
- **Press Inclinado en Supinación con Mancuernas** → 14×12, 14×12, 16×8, 16×8
- **Aperturas en Máquina** → 39×19, 45×15, 45×13
- **Jalón en Pronación en Polea Alta** → 32×12, 32×12, 32×11, 32×10
- **Remo Horizontal Cerrado Neutro en Polea** → 36,6×10, 34,3×13, 34,3×12
- **Elevaciones Laterales Neutras con Mancuernas** → 4×15, 4×15, 4×15, 4×13
- **Curl en Supinación con Barra** → 10×12, 12,5×12, 15×12
- **Extensión Vertical en Pronación en Polea Alta** → 9×12, 9×12, 11,3×11

### Rutina PIERNA B — 19 feb
- **Peso Muerto con Barra** → 45×6, 50×6, 55×6
- **Hip Thrust con Barra** → 60×8, 40×12, 40×10
- **Zancada Delantera con Mancuernas** → 7×10, 6×10, 5×10
- **Curl Femoral Vertical en Máquina** → 18×15, 18×15, 18×15
- **Extensión de Cuádriceps en Máquina** → 25×15, 25×15, 25×14

### Rutina TORSO A — 21 feb
- **Dominada** → 0×7, 0×6, 0×5
- **Fondos en Paralelas (Dips)** → 1,25×10, 1,25×10, 2,5×8
- **Press Banca con Barra** → 13,75×7, 13,75×6, 13,75×6, 13,75×6
- **Press Militar con Barra (Overhead)** → 25×7, 25×7, 25×6
- **Remo Inclinado en Pronación con Barra** → 35×7, 35×8, 35×8, 35×8

### Rutina PIERNA A — 22 feb
- **Sentadilla con Barra** → 40×6, 40×6, 40×6, 40×5
- **Prensa Inclinada** → 45×10, 47,3×10, 49,6×8
- **Peso Muerto Rumano con Barra** → 35×10, 35×10, 37,5×9
- **Curl Femoral Horizontal en Máquina** → 23×12, 23×11, 23×9
- **Extensión de Gemelos de pie** → 40×11, 40×11, 40×10, 40×9

### Rutina TORSO B — 24 feb
- **Press Inclinado en Supinación con Mancuernas** → 16×12, 16×11, 16×9, 16×8
- **Aperturas en Máquina** → 52×15, 59×12, 52×11
- **Jalón en Pronación en Polea Alta** → 34,3×12, 34,3×12, 34,3×12, 36,6×10
- **Remo Horizontal Cerrado Neutro en Polea** → 34,3×15, 34,3×13, 34,3×12
- **Elevaciones Laterales Neutras con Mancuernas** → 5×12, 4×15, 4×15, 4×13
- **Curl en Supinación con Barra** → 15×12, 15×12, 15×10
- **Extensión Vertical en Pronación en Polea Alta** → 11,3×12, 11,3×12, 11,3×11

### Rutina PIERNA B — 26 feb
- **Peso Muerto con Barra** → 47,5×6, 52,5×6, 60×6
- **Hip Thrust con Barra** → 42,5×10, 42,5×10, 42,5×10
- **Zancada Delantera con Mancuernas** → 7×10, 7×10, 7×10
- **Curl Femoral Vertical en Máquina** → 22,2×15, 22,2×15, 23,3×11
- **Extensión de Cuádriceps en Máquina** → 25×19, 25×15, 25×13

### Rutina TORSO A — 28 feb
- **Dominada** → 0×7, 0×6, 0×5
- **Fondos en Paralelas (Dips)** → 5×10, 5×10, 0×7
- **Press Banca con Barra** → 15×7, 15×7, 15×7, 17,5×5
- **Press Militar con Barra (Overhead)** → 25×8, 25×8, 25×8
- **Remo Inclinado en Pronación con Barra** → 40×6, 40×6, 40×6, 40×6

### Rutina PIERNA A — 01 mar
- **Sentadilla con Barra** → 40×7, 40×7, 40×7, 42,5×7
- **Prensa Inclinada** → 49,6×10, 49,6×10, 52×10
- **Peso Muerto Rumano con Barra** → 40×10, 40×9, 40×10
- **Curl Femoral Horizontal en Máquina** → 24,1×12, 24,1×11, 24,1×10
- **Extensión de Gemelos de pie** → 40×12, 40×11, 40×9, 40×8

### Rutina TORSO B — 03 mar
- **Press Inclinado en Supinación con Mancuernas** → 18×10, 16×10, 16×10, 16×8
- **Aperturas en Máquina** → 52×15, 59×13, 52×10
- **Jalón en Pronación en Polea Alta** → 36,3×12, 36,3×12, 36,3×12, 36,3×9
- **Remo Horizontal Cerrado Neutro en Polea** → 34,3×14, 34,3×12, 34,3×12
- **Elevaciones Laterales Neutras con Mancuernas** → 5×13, 5×12, 5×11, 5×10
- **Curl en Supinación con Barra** → 17,5×12, 17,5×11, 17,5×8
- **Extensión Vertical en Pronación en Polea Alta** → 13,5×12, 13,5×11, 13,5×8

---

# 🟩 MESOCICLO 2 (10 mar – 05 abr 2026)

**16 sesiones.** Cambios: Press Banca Cerrado + Press Inclinado con Barra, Press Militar Neutro con Mancuernas, Remo en Barra T, Curl en banco Scott, Cruce de Poleas, Elevación Lateral en Polea. Aparece trabajo de Core (Crunch).

### Pierna A (2) — 10 mar
- **Prensa Inclinada** *(Pierna)* → 40×10, 60×9, 60×10, 65×10
- **Peso Muerto Rumano con Barra** *(Pierna)* `8-10 · RIR2` → 42,5×10, 42,5×10, 45×10
- **Curl Femoral Vertical en Máquina** *(Pierna)* `10-12 · RIR0` → 18×12, 18×12, 25×10
- **Extensión de Gemelos de pie** *(Pierna)* `10-12 · RIR0` → 40×12, 40×11, 40×11, 40×10
- **Crunch Superior** *(Core)* → 23×15, 23×15, 27×14

### Torso A (2) — 12 mar
- **Press Inclinado con Barra** *(Pecho)* `5-7 · RIR2` → 40×7, 42,5×7, 45×6, 45×5
- **Press Banca Cerrado con Barra** *(Pecho)* `8-10 · RIR1` → 22,5×10, 25×10, 27,5×10
- **Dominada en Supinación** *(Espalda)* `6-8 · RIR2` → 0×7, 0×5, 0×4, 0×3
- **Remo en Barra T en Pronación** *(Espalda)* `8-10 · RIR1` → 10×10, 15×10, 22,5×10
- **Press Militar Neutro con Mancuernas** *(Hombro)* `6-8 · RIR1` → 14×6, 12×7, 12×6

### Pierna B (2) — 14 mar
- **Hip Thrust con Barra** *(Pierna)* `6-8 · RIR1` → 45×8, 50×8, 50×8, 50×8
- **Curl Femoral Horizontal en Máquina** *(Pierna)* `8-10 · RIR1` → 27×10, 27×10, 27×8
- **Extensión de Cuádriceps en Máquina** *(Pierna)* `12-15 · RIR0` → 27,3×15, 27,3×13, 27,3×11
- **Zancada Delantera con Mancuernas** *(Pierna)* `10-12 · RIR1` → 8×10, 8×10, 8×9

### Torso B (2) — 15 mar
- **Press Banca con Mancuernas** *(Pecho)* `8-12 · RIR1` → 16×11, 16×10, 16×9, 16×8
- **Cruce de Poleas (Bajo a Alto)** *(Pecho)* `12-15 · RIR0` → 2,5×12, 2,5×12, 2,5×12
- **Jalón en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 39×12, 39×10, 36,6×10, 34,3×11
- **Remo Aislado con Mancuerna** *(Espalda)* `10-12 · RIR1` → 10×12, 10×12, 10×12
- **Elevación Lateral Aislada en Polea** *(Hombro)* `12-15 · RIR0` → 2,5×15, 2,5×15, 2,5×12, 2,5×10
- **Curl en Supinación en banco Scott con Barra** *(Bíceps)* `10-12 · RIR0` → 15×12, 20×10, 20×10
- **Extensión Vertical en Pronación en Polea Alta** *(Tríceps)* `10-12 · RIR0` → 4×12, 4×12, 4×12

### Pierna A (2) — 17 mar
- **Prensa Inclinada** `6-8 · RIR1` → 60×10, 80×8, 85×8, 100×8 · (+ serie extra 52×10, 52×12, 52×12)
- **Peso Muerto Rumano con Barra** → 45×10, 45×10, 47,5×10
- **Curl Femoral Vertical en Máquina** → 25×12, 25×12, 27,3×10
- **Extensión de Gemelos de pie** → 42,5×12, 42,5×10, 42,5×10, 42,5×10

### Torso A (2) — 19 mar
- **Press Inclinado con Barra** → 42,5×7, 42,5×7, 45×7, 47,5×5
- **Press Banca Cerrado con Barra** → 30×10, 32,5×10
- **Dominada en Supinación** → 0×8, 0×6, 0×5, 0×4
- **Remo en Barra T en Pronación** → 20×10, 25×10, 30×10
- **Press Militar Neutro con Mancuernas** → 12×8, 12×8, 12×6

### Pierna B (2) — 21 mar
- **Hip Thrust con Barra** → 50×8, 52,5×8, 55×8, 57,5×8
- **Curl Femoral Horizontal en Máquina** → 28,1×10, 28,1×10, 28,1×9
- **Extensión de Cuádriceps en Máquina** → 27,3×15, 27,3×14, 27,3×12
- **Zancada Delantera con Mancuernas** → 8×11, 8×11, 8×10

### Torso B (2) — 22 mar
- **Press Banca con Mancuernas** → 16×12, 16×12, 16×11, 16×10
- **Cruce de Poleas (Bajo a Alto)** → 2,3×15, 2,3×15, 2,3×12
- **Jalón en Pronación en Polea Alta** → 39×12, 39×12, 39×12, 39×10
- **Remo Aislado con Mancuerna** → 12×12, 12×12, 12×12
- **Elevación Lateral Aislada en Polea** → 2,3×13, 2,3×11, 2,3×10, 2,3×10
- **Curl en banco Scott con Barra** → 20×12, 20×10, 20×7
- **Extensión Vertical en Pronación en Polea Alta** → 5×12, 5×10, 4×9

### Pierna A (2) — 24 mar
- **Prensa Inclinada** → 80×8, 90×8, 100×8, 110×8
- **Peso Muerto Rumano con Barra** → 47,5×10, 47,5×10
- **Curl Femoral Vertical en Máquina** → 27,3×12, 29,6×12, 32×12
- **Extensión de Gemelos de pie** → 42,5×10, 42,5×10, 42,5×10, 42,5×10

### Torso A (2) — 26 mar
- **Press Inclinado con Barra** → 45×7, 45×7, 45×6, 45×5
- **Press Banca Cerrado con Barra** → 40×10, 40×10, 45×8
- **Dominada en Supinación** → 0×8, 0×8, 0×5, 0×4
- **Remo en Barra T en Pronación** → 25×10, 30×10, 35×8
- **Press Militar Neutro con Mancuernas** → 14×6, 0×8, 12×8

### Pierna B (2) — 28 mar
- **Hip Thrust con Barra** → 52,5×8, 52,5×8, 55×8, 60×8
- **Curl Femoral Horizontal en Máquina** → 31,2×12, 31,2×10, 31,2×10
- **Extensión de Cuádriceps en Máquina** → 29,6×13, 27,3×15, 27,3×12
- **Zancada Delantera con Mancuernas** → 8×12, 8×11, 8×10
- **Crunch Superior** *(Core)* `15-20 · RIR1` → 27×15, 26,3×15, 26,3×15, 26,3×15

### Torso B (2) — 29 mar
- **Press Banca con Mancuernas** → 18×10, 18×10, 18×9, 18×9
- **Cruce de Poleas (Bajo a Alto)** → 4,5×12, 2,3×15, 4,5×12
- **Jalón en Pronación en Polea Alta** → 41,6×12, 41,6×10, 39×12, 39×9
- **Remo Aislado con Mancuerna** → 14×12, 14×12, 14×12
- **Elevación Lateral Aislada en Polea** → 2,3×12, 2,3×12, 2,3×12, 2,3×12
- **Curl en banco Scott con Barra** → 20×12, 20×12, 20×7
- **Extensión Vertical en Pronación en Polea Alta** → 11,3×12, 13,5×12, 13,5×12

### Pierna A (2) — 01 abr
- **Prensa Inclinada** → 85×8, 95×8, 105×8, 115×8
- **Peso Muerto Rumano con Barra** → 47,5×10, 50×10, 50×10
- **Curl Femoral Vertical en Máquina** → 32×12, 34,3×10, 34,3×8
- **Extensión de Gemelos de pie** → 42,5×11, 42,5×10, 42,5×10, 42,5×8
- **Crunch Superior Declinado** *(Core)* → 8×14, 8×12, 8×10

### Torso A (2) — 02 abr
- **Press Inclinado con Barra** → 45×7, 45×7, 45×6, 45×5
- **Press Banca Cerrado con Barra** → 45×8, 45×6, 42,5×8
- **Dominada en Supinación** → 0×7, 0×6, 0×5, 0×4
- **Remo en Barra T en Pronación** → 30×10, 35×8, 35×8
- **Press Militar Neutro con Mancuernas** → 14×7, 14×7, 14×6

### Pierna B (2) — 04 abr
- **Hip Thrust con Barra** → 55×8, 57,5×8, 60×8, 65×7
- **Curl Femoral Horizontal en Máquina** → 29,6×16, 32×10, 33,1×10
- **Extensión de Cuádriceps en Máquina** → 29,6×14, 29,6×12, 27,3×13
- **Zancada Delantera con Mancuernas** → 10×10, 8×11, 8×10
- **Crunch Superior** → 27×17, 27×15, 27×15, 27×12

### Torso B (2) — 05 abr
- **Press Banca con Mancuernas** → 18×11, 18×11, 18×10, 18×9
- **Cruce de Poleas (Bajo a Alto)** → 4,5×13, 4,5×12, 3,55×13
- **Jalón en Pronación en Polea Alta** → 43,6×10, 41,3×11, 41,3×9, 39×10
- **Remo Aislado con Mancuerna** → 16×12, 16×12, 16×12
- **Elevación Lateral Aislada en Polea** → 2,3×15, 2,3×14, 2,3×12, 2,3×12
- **Curl en banco Scott con Barra** → 25×10, 20×10, 20×8
- **Extensión Vertical en Pronación en Polea Alta** → 13,5×12, 13,5×12, 13,5×12

---

# 🟨 MESOCICLO 3 (07 abr – 14 may 2026)

**20 sesiones.** Pico de volumen de pierna. Vuelve la Sentadilla libre pesada. Press Banca con Barra a cargas reales (50-60 kg). Press Francés, Curl Martillo, Sentadilla Búlgara, Jalón Abierto, mucho Core (Plancha, Cocoons, Elevación de piernas colgado).

### Pierna A (3) — 07 abr
- **Sentadilla con Barra** *(Pierna)* `5-7 · RIR2` → 45×7, 50×7, 50×7, 52,5×6
- **Prensa Inclinada** *(Pierna)* `10-12 · RIR1` → 80×12, 100×12, 120×12
- **Peso Muerto Rumano con Barra** `8-10 · RIR2` → 50×10, 50×10, 50×10
- **Curl Femoral Horizontal en Máquina** `10-12 · RIR0` → 32×12, 32×8, 29,2×8
- **Extensión de Gemelos de pie** `10-12 · RIR0` → 45×12, 45×11, 45×10, 45×9
- **Plancha** *(Core)* `30-60s · RIR1` → 60s, 50s, 45s

### Torso A (3) — 09 abr
- **Press Banca con Barra** *(Pecho)* `5-7 · RIR2` → 50×7, 52,5×6, 52,5×6, 52,5×7
- **Dominada** *(Espalda)* `6-8 · RIR2` → 0×8, 0×6, 0×5, 0×4
- **Remo en Pronación con Barra** *(Espalda)* `8-10 · RIR1` → 32,5×9, 35×10, 40×10
- **Press Militar Neutro con Mancuernas** *(Hombro)* `6-8 · RIR1` → 14×7, 14×7, 14×6
- **Press Francés con Barra Z** *(Tríceps)* `8-10 · RIR1` → 15×10, 20×8, 15×10
- **Curl en Supinación con Barra** *(Bíceps)* `8-10 · RIR1` → 20×10, 20×8, 20×7
- **Cocoons** *(Core)* → 0×17, 0×11, 0×10

### Pierna B (3) — 11 abr
- **Hip Thrust con Barra** `6-8 · RIR1` → 60×8, 62,5×8, 62,5×8, 65×8
- **Sentadilla Búlgara** *(Pierna)* `10-12 · RIR1` → 8×12, 12×10, 12×10
- **Curl Femoral Vertical en Máquina** `12-15 · RIR0` → 32×14, 32×15, 32×11
- **Extensión de Cuádriceps en Máquina** `12-15 · RIR0` → 29,6×15, 29,6×13, 29,6×11
- **Elevación de piernas estiradas Colgado** *(Core)* → 0×15, 0×12, 0×8, 0×8

### Torso B (3) — 12 abr
- **Press Inclinado con Barra** *(Pecho)* `8-12 · RIR1` → 40×12, 40×10, 40×7, 35×8
- **Cruce de Poleas (Alto a Bajo)** *(Pecho)* `12-15 · RIR0` → 4,5×15, 4,5×14, 4,5×12
- **Jalón Abierto en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 39×10, 39×10, 36,6×9, 32×11
- **Remo Aislado con Mancuerna** `10-12 · RIR1` → 16×12, 16×12, 16×12
- **Elevaciones Laterales en Máquina** *(Hombro)* `12-15 · RIR0` → 6×12, 5×12, 4×11, 3×12
- **Curl en Martillo Alterno con Mancuernas** *(Bíceps)* `10-12 · RIR0` → 8×12, 8×10, 7×10
- **Extensión Vertical en Pronación en Polea Alta** *(Tríceps)* `10-12 · RIR0` → 15,8×12, 15,8×11, 15,8×9

### Pierna B (3) — 18 abr
- **Hip Thrust con Barra** → 62,5×8, 62,5×8, 62,5×8, 65×8
- **Sentadilla Búlgara** → 9×12, 10×12, 12×12
- **Curl Femoral Vertical en Máquina** → 34,3×14, 34,3×11, 32×12
- **Extensión de Cuádriceps en Máquina** → 32×12, 29,6×12, 27,3×11
- **Elevación de piernas estiradas Colgado** → 0×15, 0×12, 0×10, 0×9

### Torso B (3) — 19 abr
- **Press Inclinado con Barra** → 45×10, 42,5×10, 42,5×10, 40×7
- **Cruce de Poleas (Alto a Bajo)** → 6,8×12, 4,5×15, 4,5×12
- **Jalón Abierto en Pronación en Polea Alta** → 39×11, 39×10, 32×12, 32×12
- **Remo Aislado con Mancuerna** → 10×10, 16×12, 16×12
- **Elevaciones Laterales en Máquina** → 6×14, 5×13, 4×12, 3×12
- **Curl en Martillo Alterno con Mancuernas** → 9×12, 9×10, 8×10
- **Extensión Vertical en Pronación en Polea Alta** → 15,8×15, 17,05×10, 14,25×12

### Pierna A (3) — 21 abr
- **Sentadilla con Barra** → 50×7, 52,5×7, 55×5, 55×5
- **Prensa Inclinada** → 100×12, 110×10, 120×10
- **Peso Muerto Rumano con Barra** → 50×10, 52,5×10, 52,5×7
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×10, 30,3×8
- **Extensión de Gemelos de pie** → 40×12, 40×12, 40×10, 40×10
- **Plancha** → 60s, 52s, 46s

### Torso A (3) — 23 abr
- **Press Banca con Barra** → 52,5×7, 52,5×7, 52,5×7, 55×6
- **Dominada** → 0×8, 0×7, 0×6, 0×5
- **Remo en Pronación con Barra** → 35×10, 37,5×10, 40×10
- **Press Militar Neutro con Mancuernas** → 14×8, 14×7, 14×7
- **Press Francés con Barra Z** → 20×10, 20×8
- **Curl en Supinación con Barra** → 20×10, 20×10, 20×7
- **Cocoons** → 0×18, 0×12, 0×10

### Pierna B (3) — 25 abr
- **Hip Thrust con Barra** → 62,5×8, 62,5×8, 65×8, 67,5×8
- **Sentadilla Búlgara** → 20×12, 20×12, 24×10
- **Curl Femoral Vertical en Máquina** → 34,3×15, 34,3×12, 32×12
- **Extensión de Cuádriceps en Máquina** → 32×14, 32×11, 27,3×11
- **Elevación de piernas estiradas Colgado** `15-20 · RIR1` → 0×16, 0×12, 0×10, 0×10

### Torso B (3) — 26 abr
- **Press Inclinado con Barra** → 45×11, 45×8, 42,5×7, 40×8
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 4,5×15, 4,5×15
- **Jalón Abierto en Pronación en Polea Alta** → 39×12, 39×12, 39×9, 34,3×12
- **Remo Aislado con Mancuerna** → 18×12, 18×12, 16×12
- **Elevaciones Laterales en Máquina** → 6×15, 5×13, 4×12, 3×12
- **Curl en Martillo Alterno con Mancuernas** → 9×12, 9×11, 9×9
- **Extensión Vertical en Pronación en Polea Alta** → 17,1×12, 17,1×11, 17,1×9
- **Crunch Superior** *(Core)* → 28,1×15, 27×13, 25,2×14, 24,1×15

### Pierna A (3) — 28 abr
- **Sentadilla con Barra** → 52,5×7, 55×7, 57,5×6, 57,5×5
- **Prensa Inclinada** → 105×12, 115×12, 125×10
- **Peso Muerto Rumano con Barra** → 50×10, 52,5×10, 52,5×8
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×12, 32×9
- **Extensión de Gemelos de pie** → 40×12, 40×12, 40×10, 40×10
- **Plancha** → 60s, 59s, 58s

### Torso A (3) — 30 abr
- **Press Banca con Barra** → 55×6, 55×6, 55×6, 57,5×5
- **Dominada** → 0×8, 0×7, 0×6, 0×5
- **Remo en Pronación con Barra** → 37,4×10, 40×9, 40×9
- **Press Militar Neutro con Mancuernas** → 14×8, 14×8, 14×7
- **Press Francés con Barra Z** → 20×10, 20×10, 20×7
- **Curl en Supinación con Barra** → 22,5×8, 20×9, 20×8

### Pierna B (3) — 02 may
- **Hip Thrust con Barra** → 65×8, 65×8, 65×8, 65×8
- **Sentadilla Búlgara** → 24×10, 20×12, 20×12
- **Curl Femoral Vertical en Máquina** → 36,6×15, 36,6×15, 36,3×11
- **Extensión de Cuádriceps en Máquina** → 32×15, 32×12, 29,6×12
- **Elevación de piernas estiradas Colgado** → 0×17, 0×12, 0×10, 0×9

### Torso B (3) — 03 may
- **Press Inclinado con Barra** → 45×12, 45×9, 40×9, 40×7
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 6,8×12, 4,5×14
- **Jalón Abierto en Pronación en Polea Alta** → 39×12, 39×12, 39×10, 39×8
- **Remo Aislado con Mancuerna** → 18×12, 18×12, 18×12
- **Elevaciones Laterales en Máquina** → 5×15, 5×15, 5×10, 4×11
- **Curl en Martillo Alterno con Mancuernas** → 9×12, 9×12, 9×12
- **Extensión Vertical en Pronación en Polea Alta** → 17,1×12, 17,1×12, 17,1×10
- **Cocoons** *(Core)* → 0×19, 0×13, 0×10

### Pierna A (3) — 05 may
- **Sentadilla con Barra** → 55×7, 55×7, 57,5×6, 57,5×6
- **Prensa Inclinada** → 110×12, 120×12, 130×12
- **Peso Muerto Rumano con Barra** → 50×10, 52,5×10, 52,5×9
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×12, 10×10
- **Extensión de Gemelos de pie** → 40×12, 40×12, 40×10, 40×10

### Torso A (3) — 07 may
- **Press Banca con Barra** → 55×7, 55×7, 55×7, 57,5×5
- **Dominada** → 0×8, 0×7, 0×6, 0×5
- **Remo en Pronación con Barra** → 40×9, 40×8, 40×8
- **Press Militar Neutro con Mancuernas** → 14×8, 14×8, 14×8
- **Press Francés con Barra Z** → 20×10, 20×10, 20×8
- **Curl en Supinación con Barra** → 22,5×10, 22,5×8, 20×8

### Pierna B (3) — 09 may
- **Hip Thrust con Barra** → 67,5×8, 67,5×8, 67,5×8, 67,5×8
- **Sentadilla Búlgara** → 24×12, 24×10, 20×11
- **Curl Femoral Vertical en Máquina** → 36,6×15, 36,6×13, 36,3×9
- **Extensión de Cuádriceps en Máquina** → 32×15, 32×12, 29,6×12
- **Crunch Superior** *(Core)* → 28,1×15, 27×15, 27×15, 27×15

### Torso B (3) — 10 may
- **Press Inclinado con Barra** → 45×12, 45×9, 40×9, 40×7
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 6,8×12, 4,5×15
- **Jalón Abierto en Pronación en Polea Alta** → 39×12, 39×12, 39×12, 39×9
- **Remo Aislado con Mancuerna** → 18×12, 18×12, 18×12
- **Elevaciones Laterales en Máquina** → 5×15, 5×15, 5×11, 4×12
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 9×8
- **Extensión Vertical en Pronación en Polea Alta** → 17,1×12, 17,1×12, 17,1×10

### Pierna A (3) — 12 may
- **Sentadilla con Barra** → 55×7, 55×7, 57,5×7, 57,5×7
- **Prensa Inclinada** → 115×12, 125×12, 130×12
- **Peso Muerto Rumano con Barra** → 52,5×10, 52,5×10, 52,5×10
- **Curl Femoral Horizontal en Máquina** → 33,1×12, 33,1×10, 32×7
- **Extensión de Gemelos de pie** → 40×12, 40×12, 40×10, 40×10
- **Plancha** → 60s, 60s, 60s

### Torso A (3) — 14 may
- **Press Banca con Barra** → 57,5×7, 57,5×7, 60×6, 60×5
- **Dominada** → 0×8, 0×8, 0×6, 0×5
- **Remo en Pronación con Barra** → 40×10, 40×10, 40×9
- **Press Militar Neutro con Mancuernas** → 16×7, 16×6, 16×5
- **Press Francés con Barra Z** → 20×10, 20×10, 20×9
- **Curl en Supinación con Barra** → 22,5×10, 22,5×8, 22,5×8

---

# 🟥 MESOCICLO 4 (16 may – 21 jun 2026) — *Actual / más reciente*

**22 sesiones** (incl. 2 de "Abs" sueltas el 05 y 12 jun). Cambios: **Hack Squat** y **Aductores** (interno/externo) en pierna; **Aperturas con Mancuernas**; Press Militar con Barra vuelve; subida de reps en Curl/Press Francés (12-15); más volumen de pecho y espalda. Press Banca **estancado en 60 kg**.

### Pierna B (4) — 16 may
- **Peso Muerto con Barra** *(Pierna)* `5-8 · RIR2` → 60×6, 60×6, 60×6
- **Hip Thrust con Barra** `8-12 · RIR1` → 60×10, 60×10, 60×10, 60×8
- **Sentadilla Búlgara** `10-12 · RIR1` → 24×12, 24×12, 24×10
- **Curl Femoral Horizontal en Máquina** `12-15 · RIR0` → 30,3×15, 30,3×11, 27×12
- **Plancha** *(Core)* `45-60s · RIR1` → 62s, 62s, 60s

### Torso B (4) — 17 may
- **Press Inclinado con Barra** *(Pecho)* `8-12 · RIR1` → 45×12, 45×10, 40×9, 40×7
- **Aperturas con Mancuernas (Flyes)** *(Pecho)* `12-15 · RIR0` → 7×15, 7×15, 7×15
- **Cruce de Poleas (Alto a Bajo)** `12-15 · RIR0` → 6,8×14, 6,8×10, 4,5×15
- **Jalón Abierto en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 39×12, 39×12, 39×12, 39×10
- **Remo Horizontal Cerrado Neutro en Polea** *(Espalda)* `10-12 · RIR1` → 39×12, 39×12, 39×10
- **Elevaciones Laterales en Máquina** *(Hombro)* `15-20 · RIR0` → 4×20, 4×16, 3×15, 2×16

### Pierna A (4) — 19 may
- **Hack Squat** *(Cuádriceps)* `6-10 · RIR1` → 20×6, 20×6, 15×6, 10×6
- **Peso Muerto Rumano con Barra** `8-12 · RIR2` → 52,5×11, 52,5×11, 52,5×11
- **Extensión de Cuádriceps en Máquina** `12-15 · RIR1` → 34,3×15, 34,3×13, 32×11
- **Aductor Interno en Máquina** *(Pierna)* `12-15 · RIR0` → 39×15, 39×13, 36,6×15
- **Extensión de Gemelos de pie** `12-15 · RIR0` → 30×15, 30×13, 30×12, 30×12

### Torso A (4) — 21 may
- **Press Banca con Barra** *(Pecho)* `5-8 · RIR2` → 57,5×8, 57,5×7, 60×6, 60×5
- **Press Militar con Barra (Overhead)** *(Hombro)* `8-10 · RIR1` → 25×10, 25×9, 25×8
- **Dominada** *(Espalda)* `6-10 · RIR2` → 0×9, 0×8, 0×7, 0×5
- **Remo en Pronación con Barra** `10-12 · RIR1` → 40×10, 40×10, 40×10
- **Press Francés con Barra Z** *(Tríceps)* `12-15 · RIR1` → 20×12, 15×14, 15×12
- **Curl en Supinación con Barra** *(Bíceps)* `12-15 · RIR1` → 15×15, 15×14, 15×9

### Pierna B (4) — 23 may
- **Peso Muerto con Barra** → 60×7, 60×7, 60×7
- **Hip Thrust con Barra** → 60×11, 60×10, 60×10, 60×10
- **Sentadilla Búlgara** → 24×12
- **Curl Femoral Horizontal en Máquina** → 30,3×15, 30,3×12, 30,3×12

### Torso B (4) — 24 may
- **Press Inclinado con Barra** → 45×12, 45×10, 40×10, 40×8
- **Aperturas con Mancuernas (Flyes)** → 8×15, 8×15, 8×12
- **Cruce de Poleas (Alto a Bajo)** → 6,8×12, 4,5×15, 4,5×15
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×9, 39×10
- **Remo Horizontal Cerrado Neutro en Polea** → 41,3×11, 39×11, 39×10
- **Elevaciones Laterales en Máquina** → 4×20, 4×17, 3×16, 2×18
- **Crunch Superior** *(Core)* → 29,2×15, 29,2×15, 29,2×15, 29,2×11

### Pierna A (4) — 26 may
- **Hack Squat** → 15×8, 15×8, 15×7, 15×6
- **Peso Muerto Rumano con Barra** → 52,5×12, 52,5×12, 52,5×12
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×12
- **Aductor Interno en Máquina** → 41,3×15, 41,3×15
- **Extensión de Gemelos de pie** → 30×15, 30×15, 30×15, 30×15

### Torso A (4) — 28 may
- **Press Banca con Barra** → 60×6, 60×6, 60×5, 60×5
- **Press Militar con Barra (Overhead)** → 25×10, 25×10, 25×8
- **Dominada** → 0×9, 0×8, 0×7, 0×5
- **Remo en Pronación con Barra** → 40×11, 40×10, 40×10
- **Press Francés con Barra Z** → 15×17, 15×15, 15×11
- **Curl en Supinación con Barra** → 15×15, 15×15, 15×10

### Pierna B (4) — 30 may
- **Peso Muerto con Barra** → 60×8, 60×7, 60×7
- **Hip Thrust con Barra** → 60×12, 60×11, 60×10, 60×10
- **Sentadilla Búlgara** → 12×12, 12×12, 12×12
- **Curl Femoral Horizontal en Máquina** → 30,3×15, 30,3×12, 30,3×10

### Torso B (4) — 31 may
- **Press Inclinado con Barra** → 45×12, 45×10, 40×10, 40×8
- **Aperturas con Mancuernas (Flyes)** → 9×13, 9×12, 8×15
- **Cruce de Poleas (Alto a Bajo)** → 5,75×15, 5,75×15, 5,75×15
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×10, 41,3×10
- **Remo Horizontal Cerrado Neutro en Polea** → 41,3×12, 41,3×10, 39×10
- **Elevaciones Laterales en Máquina** → 4×20, 4×18, 4×15, 3×15

### Pierna A (4) — 02 jun
- **Hack Squat** → 15×9, 15×8, 15×7, 15×7
- **Peso Muerto Rumano con Barra** → 55×12, 55×12, 55×10
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×15, 34,3×12
- **Aductor Interno en Máquina** → (no registrado este día)
- **Aductor Externo en Máquina** *(Pierna)* → 32×15, 32×15, 32×13
- **Extensión de Gemelos de pie** → 30×15, 30×15, 30×15, 30×15

### Torso A (4) — 04 jun
- **Press Banca con Barra** → 60×7, 60×6, 60×5, 60×5
- **Press Militar con Barra (Overhead)** → 25×10, 25×10, 25×9
- **Dominada** → 0×9, 0×8, 0×7, 0×5
- **Remo en Pronación con Barra** → 40×12, 40×10, 40×10
- **Press Francés con Barra Z** → 20×15, 20×12, 15×11
- **Curl en Supinación con Barra** → 15×15, 15×15, 11×18

### Abs — 05 jun
- **Plancha** → registro vacío (0×0)

### Pierna B (4) — 06 jun
- **Hip Thrust con Barra** → 60×12, 60×11, 60×11, 60×11
- **Peso Muerto con Barra** → 8×8, 8×8, 8×8 *(registro dudoso, peso muy bajo)*
- **Sentadilla Búlgara** → 24×12, 24×12, 24×12
- **Curl Femoral Horizontal en Máquina** → 30,3×15, 30,3×13, 30,3×10

### Torso B (4) — 07 jun
- **Press Inclinado con Barra** → 45×12, 45×10, 40×10, 40×10
- **Aperturas con Mancuernas (Flyes)** → 9×14, 9×12, 8×15
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 5,75×15, 5,75×12
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×10, 41,3×10
- **Remo Horizontal Cerrado Neutro en Polea** → 41,3×12, 41,3×10, 39×11
- **Elevaciones Laterales en Máquina** → 4×20, 4×20, 4×18, 4×15
- **Crunch Superior** *(Core)* → 29,2×15, 29,2×15, 29,2×15, 29,2×15

### Pierna A (4) — 09 jun
- **Hack Squat** → 15×10, 15×9, 15×8, 15×7
- **Peso Muerto Rumano con Barra** → 57,5×11, 57,5×10, 57,5×8
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×15, 34,3×13
- **Aductor Interno en Máquina** → 41,3×15, 41,3×15, 41,3×15
- **Extensión de Gemelos de pie** → 30×15, 30×15, 30×15, 30×12

### Torso A (4) — 11 jun
- **Press Banca con Barra** → 60×7, 60×6, 60×5, 60×5
- **Press Militar con Barra (Overhead)** → 25×10, 25×10, 25×9
- **Dominada** → 0×10, 0×8, 0×7, 0×5
- **Remo en Pronación con Barra** → 40×12, 40×10, 40×10
- **Press Francés con Barra Z** → 15×15, 15×13, 15×10
- **Curl en Supinación con Barra** → 15×15, 15×15, 15×12

### Abs — 12 jun
- **Plancha** → registro vacío (0×0)

### Pierna B (4) — 13 jun
- **Hip Thrust con Barra** → 62,5×12, 62,5×12, 62,5×11, 62,5×10
- **Peso Muerto con Barra** → registro vacío (0×8, 0×0, 0×0)
- **Sentadilla Búlgara** → 28×11, 28×10, 28×9
- **Curl Femoral Horizontal en Máquina** → 30,3×15, 30,3×13, 30,3×10

### Torso B (4) — 14 jun
- **Press Inclinado con Barra** → 45×12, 45×11, 40×11, 40×10
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×13, 9×12
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 5,75×15, 5,75×15
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×11, 41,3×10
- **Remo Horizontal Cerrado Neutro en Polea** → 41,3×12, 41,3×11, 41,3×9
- **Elevaciones Laterales en Máquina** → 5×20, 4×15, 4×15, 4×15
- **Crunch Superior** *(Core)* → 30,3×16, 30,3×15, 29,2×15, 29,2×13

### Pierna A (4) — 16 jun
- **Hack Squat** → 15×10, 15×9, 15×7, 15×7
- **Peso Muerto Rumano con Barra** → 55×12, 55×12, 55×11
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×15, 34,3×12
- **Aductor Interno en Máquina** → 43,6×15, 43,6×15, 43,6×10
- **Extensión de Gemelos de pie** → 30×15, 30×15, 30×15, 30×15

### Torso A (4) — 18 jun
- **Press Banca con Barra** → 60×7, 60×6, 60×6, 60×5
- **Press Militar con Barra (Overhead)** → 25×10, 25×10, 25×10
- **Dominada** → 0×10, 0×8, 0×7, 0×5
- **Remo en Pronación con Barra** → 40×12, 40×11, 40×11
- **Press Francés con Barra Z** → 15×15, 15×15, 12×15
- **Curl en Supinación con Barra** → 15×15, 15×15, 15×11

### Pierna B (4) — 20 jun
- **Peso Muerto con Barra** → 70×5, 65×8 *(PR de carga: 70 kg)*
- **Hip Thrust con Barra** → 65×12, 65×11, 65×10, 65×9
- **Sentadilla Búlgara** → 24×12, 24×12, 24×11
- **Curl Femoral Horizontal en Máquina** → 29,6×15, 29,6×15, 29,6×15
- **Plancha** *(Core)* `45-60s` → 75s, 75s, 75s *(PR de tiempo)*

### Torso B (4) — 21 jun *(última sesión registrada)*
- **Press Inclinado con Barra** → 45×12, 45×12, 45×10, 40×10
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×14, 9×12
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 6,8×12, 6,8×10
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×12, 41,3×11
- **Remo Horizontal Cerrado Neutro en Polea** → 41,3×12, 41,3×12, 41,3×11
- **Elevaciones Laterales en Máquina** → 5×20, 5×15, 4×15
- **Crunch Superior** *(Core)* → 30,3×20, 30,3×16, 30,3×14, 29,2×15

---

# 🟪 MESOCICLO 5 (30 jun – 01 ago 2026) — *Actual / más reciente*

**15 sesiones · 5 semanas exactas.** Cambio estructural: se abandona el split Torso/Pierna y se pasa a **full-body A/B/C, 3 días por semana (martes, jueves, sábado)**, dejando el domingo para la tirada larga en bici. Hubo 9 días de descanso entre el último día del Meso 4 (21 jun) y el arranque del Meso 5 (30 jun).

**Rutinas guardadas en la app:**
- **Día A (5)** — *"Full body · Empuje y cuádriceps. Press banca en fresco para romper la meseta de 60 kg. Sesión pesada del martes."*
- **Día B (5)** — *"Full body · Tracción y cadena posterior. RDL, dominadas e hip thrust. Sesión pesada del jueves."*
- **Día C (5)** — *"Full body · Hipertrofia y pierna ligera de máquina para llegar fresco a la ruta en bici del domingo. Sesión del sábado."*

### Día A (5) — 30 jun *(martes)*
- **Press Banca con Barra** *(Pecho)* `4-6 · RIR2` → 60×6, 60×6, 60×5, 60×4
- **Sentadilla con Barra** *(Pierna)* `6-8 · RIR2` → 55×7, 55×7, 55×7
- **Remo en Pronación con Barra** *(Espalda)* `8-10 · RIR1` → 40×10, 40×10, 40×10, 40×10
- **Press Militar con Barra (Overhead)** *(Hombro)* `6-8 · RIR1` → 27,5×8, 27,5×8, 27,5×7
- **Curl Femoral Horizontal en Máquina** *(Pierna)* `10-12 · RIR1` → 32×10, 32×10, 32×8
- **Elevaciones Laterales en Máquina** *(Hombro)* `12-20 · RIR0` → 6×13, 5×12, 4×13
- **Press Francés con Barra Z** *(Tríceps)* `10-12 · RIR1` → 20×12, 20×10, 20×7
- **Plancha** *(Core)* `45-75s` → 75s, 65s, 60s

### Día B (5) — 02 jul *(jueves)*
- **Peso Muerto Rumano con Barra** *(Pierna)* `8-10 · RIR2` → 60×9, 60×8, 60×7
- **Dominada** *(Espalda)* `6-10 · RIR1` → 0×9, 0×7, 0×5, 0×5
- **Press Inclinado con Barra** *(Pecho)* `8-10 · RIR1` → 47,5×8, 45×8, 45×7
- **Hip Thrust con Barra** *(Pierna)* `8-12 · RIR1` → 65×10, 65×9, 65×8
- **Remo Horizontal Cerrado Neutro en Polea** *(Espalda)* `10-12 · RIR1` → registro vacío (0×0)
- **Curl en Supinación con Barra** *(Bíceps)* `10-12 · RIR1` → 15×14, 15×12, 15×10
- **Extensión Vertical en Pronación en Polea Alta** *(Tríceps)* `12-15 · RIR0` → 15×15, 15×14, 15×10

### Día C (5) — 04 jul *(sábado)*
- **Press Banca con Mancuernas** *(Pecho)* `8-12 · RIR1` → 18×12, 18×11, 18×9
- **Jalón Abierto en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 41,3×12, 39×12, 39×10
- **Extensión de Cuádriceps en Máquina** *(Pierna)* `12-15 · RIR1` → 34,3×15, 34,3×11, 34,3×11
- **Curl Femoral Vertical en Máquina** *(Pierna)* `12-15 · RIR1` → 36,6×15, 36,6×11, 32×10
- **Aperturas con Mancuernas (Flyes)** *(Pecho)* `12-15 · RIR0` → 9×15, 9×11, 9×11
- **Elevaciones Laterales en Máquina** *(Hombro)* `15-20 · RIR0` → 5×20, 4×16, 3×13
- **Curl en Martillo Alterno con Mancuernas** *(Bíceps)* `10-12 · RIR1` → 10×11, 9×10, 9×8
- **Extensión de Gemelos de pie** *(Pierna)* `10-15 · RIR1` → 25×12, 25×12, 25×12, 25×13

> 🚴 **Domingo 05 jul — 18,3 km en 51:07 (+212 m)**

### Día A (5) — 06 jul *(lunes)*
- **Press Banca con Barra** → 60×6, 60×6, 60×5, 60×5
- **Sentadilla con Barra** → 55×8, 55×8, 55×7
- **Remo en Pronación con Barra** → 42,5×10, 42,5×10, 42,5×9, 42,5×8
- **Press Militar con Barra (Overhead)** → 27,5×8, 27,5×8, 27,5×8
- **Curl Femoral Horizontal en Máquina** → 32×11, 32×10, 32×8
- **Elevaciones Laterales en Máquina** → 6×15, 5×14, 4×12
- **Press Francés con Barra Z** → 20×12, 20×10, 20×8

### Día B (5) — 09 jul
- **Peso Muerto Rumano con Barra** → 60×9, 60×8, 60×7
- **Dominada** → 0×10, 0×7, 0×5, 0×5
- **Press Inclinado con Barra** → 47,5×9, 45×9, 45×8
- **Hip Thrust con Barra** → 65×11, 65×10, 65×9
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,6×11, 41,3×10
- **Curl en Supinación con Barra** → 15×16, 15×13, 15×11
- **Extensión Vertical en Pronación en Polea Alta** → 15,8×14, 15,8×14, 15,8×12

### Día C (5) — 11 jul
- **Press Banca con Mancuernas** → 20×10, 20×9, 18×10
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×11, 39×10
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×12, 34,3×13
- **Curl Femoral Vertical en Máquina** → 36,6×15, 36,6×12, 36,6×12
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×12, 9×11
- **Elevaciones Laterales en Máquina** → 6×17, 5×15, 4×15
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×9, 8×10
- **Extensión de Gemelos de pie** → 25×12, 25×12, 25×12, 25×12

> 🚴 **Domingo 12 jul — 27,1 km en 1:15:35 (+206 m)**

### Día A (5) — 14 jul
- **Press Banca con Barra** → 60×7, 60×6, 60×5, 60×5
- **Sentadilla con Barra** → 57,5×6, 57,5×6, 55×6 *(primer intento a 57,5 kg)*
- **Remo en Pronación con Barra** → 42,5×10, 42,5×10, 42,5×10, 42,5×9
- **Press Militar con Barra (Overhead)** → 25×8, 30×8, 30×6 *(salto a 30 kg)*
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×11, 32×8
- **Elevaciones Laterales en Máquina** → 6×18, 5×15, 4×13
- **Press Francés con Barra Z** → 20×15, 20×10, 20×8

### Día B (5) — 16 jul
- **Peso Muerto Rumano con Barra** → 60×10, 60×8, 60×7
- **Dominada** → 0×10, 0×7, 0×5, 0×5
- **Press Inclinado con Barra** → 47,5×9, 47,5×8, 45×0 *(última serie sin registrar)*
- **Hip Thrust con Barra** → 65×12, 65×10, 65×9
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,6×12, 43,6×10
- **Curl en Supinación con Barra** → 20×10, 15×11, 15×9
- **Extensión Vertical en Pronación en Polea Alta** → 15,8×15, 15,8×14, 15,8×10
- **Janda Sit-up** *(Core)* → 0×54, 0×36, 0×34 *(añadido sobre la marcha, no está en la rutina)*

### Día C (5) — 18 jul
- **Press Banca con Mancuernas** → 20×11, 20×10, 20×8
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×10
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×12
- **Curl Femoral Vertical en Máquina** → 36,3×15, 36,3×10, 32×12
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×15, 9×12
- **Elevaciones Laterales en Máquina** → 6×19, 5×15, 4×15
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 8×9
- **Extensión de Gemelos de pie** → 25×13, 25×12, 25×12, 22,5×15

> 🚴 **Domingo 19 jul — 32,0 km en 1:29:39 (+494 m)**

### Día A (5) — 21 jul
- **Press Banca con Barra** → 62,5×5, 60×6, 60×5, 60×4 *(primer intento a 62,5 kg)*
- **Sentadilla con Barra** → 57,5×7, 57,5×6, 55×7
- **Remo en Pronación con Barra** → 42,5×11, 42,5×10, 42,5×10, 42,5×9
- **Press Militar con Barra (Overhead)** → 30×8, 30×7, 30×6
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×11, 32×9
- **Elevaciones Laterales en Máquina** → 6×19, 6×12, 5×12
- **Press Francés con Barra Z** → 20×13, 20×10, 15×10
- **Plancha** *(Core)* → 80s, 70s, 65s

### Día B (5) — 23 jul
- **Peso Muerto Rumano con Barra** → 60×10, 60×9, 60×7
- **Dominada** → 0×10, 0×7, 0×5, 0×5
- **Press Inclinado con Barra** → 47,5×9, 47,5×9, 47,5×7
- **Hip Thrust con Barra** → 65×12, 65×10, 65×9
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,6×12, 43,6×11
- **Curl en Supinación con Barra** → 20×10, 15×12, 15×10
- **Extensión Vertical en Pronación en Polea Alta** → 15,8×15, 15,8×15, 15,8×12

### Día C (5) — 25 jul
- **Press Banca con Mancuernas** → 20×12, 20×10, 20×8
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×11
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×12
- **Curl Femoral Vertical en Máquina** → 34,3×15, 34,3×12, 32×12
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×15, 9×14
- **Elevaciones Laterales en Máquina** → 6×20, 5×15, 5×12
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 8×10
- **Extensión de Gemelos de pie** → 22,5×15, 22,5×14, 22,5×14, 22,5×12

> 🚴 *Domingo 26 jul — sin salida registrada*

### Día A (5) — 28 jul
- **Press Banca con Barra** → 62,5×5, 60×6, 60×5, 60×4 *(idéntico a la semana anterior)*
- **Sentadilla con Barra** → 57,5×7, 57,5×6, 55×7
- **Remo en Pronación con Barra** → 42,5×11, 42,5×10, 42,5×10, 42,5×9
- **Press Militar con Barra (Overhead)** → 30×8, 30×7, 30×6
- **Curl Femoral Horizontal en Máquina** → 32×12, 32×11, 32×9
- **Elevaciones Laterales en Máquina** → 6×20, 5×15, 5×11
- **Press Francés con Barra Z** → 20×13, 20×10, 15×10
- **Janda Sit-up** *(Core)* → 0×54, 0×38, 0×36 *(+ un registro duplicado vacío)*

### Día B (5) — 30 jul
- **Peso Muerto Rumano con Barra** → 60×10, 60×9, 60×7
- **Dominada** → 0×10, 0×7, 0×5, 0×5
- **Press Inclinado con Barra** → 47,5×9, 47,5×9, 47,5×7
- **Hip Thrust con Barra** → 65×12, 65×10, 65×9
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,3×12, 43,6×11
- **Curl en Supinación con Barra** → 20×10, 15×12, 15×10
- **Extensión Vertical en Pronación en Polea Alta** → 15,8×15, 15,8×15, 15,8×12

### Día C (5) — 01 ago *(última sesión registrada)*
- **Press Banca con Mancuernas** → 20×12, 20×10, 20×8
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×11
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×12
- **Curl Femoral Vertical en Máquina** → 34,3×15, 34,3×12, 34,3×12
- **Aperturas con Mancuernas (Flyes)** → 9×15, 9×15, 9×14
- **Elevaciones Laterales en Máquina** → 6×20, 5×15, 5×15
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 8×10
- **Extensión de Gemelos de pie** → 22,5×15, 22,5×14, 22,5×14, 22,5×12
- **Plancha** *(Core)* → 90s, 80s, 75s *(PR absoluto de tiempo)*

> 🚴 **Domingo 02 ago — 42,2 km en 1:44:19 (+434 m) · salida más larga y más rápida hasta la fecha**

### Diagnóstico del Meso 5
- **Lo que funcionó:** el cambio a full-body dio 2-3 exposiciones semanales por patrón y desbloqueó el Press Militar tras 4 bloques planos. La adherencia fue perfecta (15/15 sesiones, cero saltos) y el reparto martes/jueves/sábado convivió bien con la bici.
- **Lo que se estancó:** desde la semana 4 (21 y 28 jul, y 23 y 30 jul) **las sesiones se repiten literalmente serie por serie**. Press Banca, Sentadilla, Remo, RDL, Hip Thrust, Jalón y Aperturas dan exactamente los mismos números dos semanas seguidas. Eso indica que la progresión se agotó, no que faltara esfuerzo.
- **Causa probable:** casi todos los ejercicios llegaron al **tope de su rango de repeticiones** sin que se subiera la carga. La regla de doble progresión no se estaba cerrando: al tocar el máximo de reps hay que subir peso y volver al mínimo del rango.
- **Aislamientos con carga demasiado baja:** los gemelos incluso *bajaron* de 25 a 22,5 kg, y las elevaciones laterales están haciendo 20 reps con 6 kg, muy lejos del fallo de carga.
- **Calidad del registro:** mejoró respecto al Meso 4, pero quedan 2 huecos (Remo Horizontal del 02 jul y una serie de Press Inclinado del 16 jul) y un Janda Sit-up duplicado el 28 jul.

---

# 🟫 MESOCICLO 6 (04 ago – 22 ago 2026) — *interrumpido por lesión*

**9 sesiones · 3 semanas de las 5 previstas.** Se ejecutó exactamente el diseño de la sección 6. El bloque se corta el **22 ago**, cuando aparece el **esguince del ligamento colateral fibular del tobillo derecho**. No hay sesiones registradas entre el 23 ago y el 1 sep (10 días de parón).

**Rutinas guardadas en la app:** `Día A (6)`, `Día B (6)`, `Día C (6)`.

> ⚠️ **La Elevación de piernas estiradas Colgado del Día A no se registró ni una sola vez** en las 3 semanas, pese a estar en la rutina. Es el único ejercicio prescrito con 0 % de adherencia del historial; conviene sustituirlo por una variante más accesible.

### Día A (6) — 04 ago *(martes)*
- **Press Banca con Barra** *(Pecho)* `6-8 · RIR2` → 62,5×6, 60×6, 60×5, 60×4
- **Sentadilla con Barra** *(Pierna)* `6-8 · RIR2` → 57,5×7, 57,5×6, 55×7, 55×5
- **Remo en Pronación con Barra** *(Espalda)* `8-10 · RIR1` → 42,5×11, 42,5×10, 42,5×10, 42,5×10
- **Press Militar con Barra (Overhead)** *(Hombro)* `6-8 · RIR1` → 30×8, 30×7, 30×6
- **Prensa Inclinada** *(Pierna)* `10-12 · RIR1` → 115×12, 125×10, 125×8 *(vuelve tras 2 bloques)*
- **Elevaciones Laterales en Máquina** *(Hombro)* `12-15 · RIR0` → 6×20, 5×15, 5×15
- **Press Francés con Barra Z** *(Tríceps)* `10-12 · RIR1` → 20×13, 20×10, 15×11

### Día B (6) — 06 ago *(jueves)*
- **Peso Muerto Rumano con Barra** *(Pierna)* `8-10 · RIR2` → 60×10, 60×9, 55×8, 55×8
- **Dominada** *(Espalda)* `6-8 · RIR1` → 5×6, 2,5×6, 1,25×6, 1,25×6 *(primera vez con lastre)*
- **Press Inclinado con Barra** *(Pecho)* `8-10 · RIR1` → 47,5×9, 47,5×9, 45×8, 40×9
- **Hip Thrust con Barra** *(Pierna)* `8-12 · RIR1` → 65×12, 65×11, 65×10
- **Remo Horizontal Cerrado Neutro en Polea** *(Espalda)* `10-12 · RIR1` → 43,6×12, 43,6×12, 43,6×11
- **Pájaros Aislados en Polea** *(Hombro)* `15-20 · RIR0` → 2,3×15, 2,3×14, 2,3×12 *(estreno de deltoides posterior)*
- **Curl en Supinación con Barra** *(Bíceps)* `10-12 · RIR1` → 20×12, 15×12, 15×11
- **Extensión Vertical en Pronación en Polea Alta** *(Tríceps)* `12-15 · RIR0` → 15,8×15, 15,8×15, 15,8×13

### Día C (6) — 08 ago *(sábado)*
- **Press Banca con Mancuernas** *(Pecho)* `8-12 · RIR1` → 20×12, 20×10, 20×8, 18×8
- **Jalón Abierto en Pronación en Polea Alta** *(Espalda)* `10-12 · RIR1` → 41,3×12, 41,3×12, 41,3×11, 36,6×10
- **Extensión de Cuádriceps en Máquina** *(Pierna)* `12-15 · RIR1` → 34,3×15, 34,3×14, 34,3×13
- **Curl Femoral Vertical en Máquina** *(Pierna)* `12-15 · RIR1` → 34,3×15, 34,3×13, 34,3×12
- **Cruce de Poleas (Alto a Bajo)** *(Pecho)* `12-15 · RIR0` → 6,8×15, 6,8×13, 6,8×12
- **Elevaciones Laterales en Máquina** *(Hombro)* `15-20 · RIR0` → 6×20, 5×16, 5×14
- **Curl en Martillo Alterno con Mancuernas** *(Bíceps)* `10-12 · RIR1` → 10×12, 10×10, 10×8
- **Extensión de Gemelos de pie** *(Pierna)* `12-15 · RIR1` → 22,5×15, 22,5×14, 22,5×14, 22,5×12
- **Crunch Superior** *(Core)* `12-15 · RIR1` → 32×12, 32×14, 32×12 *(PR de carga en core)*

> 🚴 **Domingo 09 ago — 51,1 km en 2:15:28**

### Día A (6) — 11 ago
- **Press Banca con Barra** → 62,5×6, 60×6, 60×5, 60×5
- **Sentadilla con Barra** → 57,5×7, 57,5×6, 55×7, 55×6
- **Remo en Pronación con Barra** → 42,5×11, 42,5×11, 42,5×10, 42,5×10
- **Press Militar con Barra (Overhead)** → 30×8, 30×7, 30×6
- **Prensa Inclinada** → 115×12, 125×11, 125×9
- **Elevaciones Laterales en Máquina** → 6×20, 5×13, 5×12
- **Press Francés con Barra Z** → 20×13, 20×10, 15×12

### Día B (6) — 13 ago
- **Peso Muerto Rumano con Barra** → 60×10, 60×9, 55×9, 55×8
- **Dominada** → 5×7, 5×6, 2,5×6, 1,25×6
- **Press Inclinado con Barra** → 52,5×9, 47,5×9, 45×7, 40×9 *(PR de carga: 52,5 kg)*
- **Hip Thrust con Barra** → 65×12, 65×11, 65×10
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,6×12, 43,6×11
- **Pájaros Aislados en Polea** → 2,3×16, 2,3×15, 2,3×16
- **Curl en Supinación con Barra** → 20×12, 15×12, 15×10
- **Extensión Vertical en Pronación en Polea Alta** → 18,1×15, 18,1×15, 18,1×13

*(Ese mismo día, caminata de 45:36.)*

### Día C (6) — 15 ago
- **Press Banca con Mancuernas** → 20×12, 20×11, 20×9, 18×8
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×12, 36,6×11
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×13
- **Curl Femoral Vertical en Máquina** → 34,3×15, 34,3×15, 34,3×13
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 6,8×14, 6,8×12
- **Elevaciones Laterales en Máquina** → 6×20, 5×17, 5×14
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 9×9
- **Extensión de Gemelos de pie** → 22,5×15, 22,5×15, 22,5×14, 22,5×13
- **Crunch Superior** → 32×12, 27×15, 27×12

> 🚴 **Domingo 16 ago — 60,6 km en 2:36:53 (+326 m) · salida más larga del historial**

### Día A (6) — 18 ago
- **Press Banca con Barra** → 62,5×6, 60×6, 60×6, 60×5
- **Sentadilla con Barra** → 57,5×7, 57,5×6, 55×7, 55×7
- **Remo en Pronación con Barra** → 45×10, 45×10, 45×8, 45×8 *(sube a 45 kg)*
- **Press Militar con Barra (Overhead)** → 30×8, 30×7, 30×7
- **Prensa Inclinada** → 120×12, 125×10, 125×8
- **Elevaciones Laterales en Máquina** → 7×15, 7×12, 6×11 *(sube a 7 kg)*
- **Press Francés con Barra Z** → 20×13, 20×10, 20×9

### Día B (6) — 20 ago · **RPE 10**
- **Peso Muerto Rumano con Barra** → 60×10, 60×9, 55×9, 55×8
- **Dominada** → 5×7, 5×6, 2,5×6, 2,5×6
- **Press Inclinado con Barra** → 52,5×9, 47,5×9, 45×7, 45×8
- **Hip Thrust con Barra** → 65×12, 65×11, 65×10
- **Remo Horizontal Cerrado Neutro en Polea** → 43,6×12, 43,6×12, 43,6×12
- **Pájaros Aislados en Polea** → 3,55×14, 3,55×13, 3,55×12
- **Curl en Supinación con Barra** → 20×12, 15×12, 15×12
- **Extensión Vertical en Pronación en Polea Alta** → 18×15, 18×15, 18×12

### Día C (6) — 22 ago · **RPE 9** *(última sesión antes de la lesión)*
- **Press Banca con Mancuernas** → 20×12, 20×11, 20×9, 18×9
- **Jalón Abierto en Pronación en Polea Alta** → 41,3×12, 41,3×12, 41,3×12, 36,6×12
- **Extensión de Cuádriceps en Máquina** → 34,3×15, 34,3×14, 34,3×13
- **Curl Femoral Vertical en Máquina** → 34,3×15, 34,3×15, 34,3×14
- **Cruce de Poleas (Alto a Bajo)** → 6,8×15, 6,8×15, 6,8×12
- **Elevaciones Laterales en Máquina** → 6×20, 5×18, 5×14
- **Curl en Martillo Alterno con Mancuernas** → 10×12, 10×10, 9×9
- **Extensión de Gemelos de pie** → 22,5×15, 22,5×15, 22,5×14, 22,5×14
- **Crunch Superior** → 29,2×15, 29,2×12, 27×15

### Volumen del Meso 6 por grupo muscular

| Grupo | Series | Reps | Volumen (kg) | Series/semana |
|-------|:------:|:----:|-------------:|:-------------:|
| Pierna | 72 | 799 | 40.695 | 24,0 |
| Espalda | 45 | 439 | 15.639 | 15,0 |
| Pecho | 45 | 410 | 11.896 | 15,0 |
| Hombro | 36 | 477 | 3.856 | 12,0 |
| Tríceps | 18 | 229 | 4.119 | 6,0 |
| Bíceps | 18 | 197 | 2.657 | 6,0 |
| Core | 9 | 119 | 3.522 | 3,0 |
| **Total** | **243** | **2.670** | **82.384** | **81,0** |

### Diagnóstico del Meso 6
- **Lo que funcionó:** se rompió el estancamiento generalizado del Meso 5. En 3 semanas hay subida de carga real en **Remo con Barra** (42,5 → 45 kg), **Press Inclinado** (47,5 → 52,5 kg, PR), **Elevaciones Laterales** (6 → 7 kg), **Extensión de Tríceps** (15,8 → 18 kg), **Pájaros** (2,3 → 3,55 kg) y **Crunch Superior** (29,2 → 32 kg). La doble progresión sí se cerró esta vez.
- **Las Dominadas con lastre funcionaron muy bien:** de 0×10-7-5-5 en el Meso 5 a 5×7, 5×6, 2,5×6, 2,5×6. Al forzar el rango 6-8 con lastre, las series dejaron de desplomarse.
- **El Press Banca sigue clavado:** 62,5×6 + 60×6/5/5 las tres semanas. Cuarto bloque consecutivo sin mover el e1RM. La caída de reps entre series se ha suavizado un poco (6-6-6-5 en la semana 3 frente a 6-6-5-4 en la primera), pero la carga no sube.
- **Sentadilla e Hip Thrust planos otra vez:** 57,5 kg y 65 kg respectivamente, idénticos a los del Meso 5, pese a que el diseño pedía 4×8 → +2,5 kg. El RDL incluso *bajó* la carga de las series 3-4 a 55 kg. Es coherente con el volumen de bici acumulado los domingos.
- **RPE 10 el 20 ago y RPE 9 el 22 ago:** son los dos únicos RPE registrados del historial, y son los dos más altos posibles, en las dos últimas sesiones antes de la lesión. Combinado con la salida de 2 h 37 min del 16 ago, el bloque terminó con fatiga muy alta.
- **Los gemelos siguen sin progresar:** 22,5 kg todo el bloque, arrastrado desde el Meso 5. Es el ejercicio con peor gestión de carga del programa y, además, el tejido que ahora queda directamente afectado por el esguince.

---

## 5. Patrones, preferencias y conclusiones para la IA

### Estructura preferida (actualizada tras el Meso 6)
- **Meso 1-4:** split Torso/Pierna (A/B), 4 sesiones/semana, ~5-7 ejercicios por sesión.
- **Meso 5 en adelante:** **full-body A/B/C, 3 sesiones/semana** (martes, jueves, sábado), 7-9 ejercicios por sesión, 3-4 series por ejercicio, más la tirada larga de bici del domingo. Esta es la estructura que el usuario quiere mantener, y se respeta también en las rutinas adaptadas del Meso 7.
- Mesociclos de **~5 semanas**, cambiando parte de la selección de ejercicios entre bloques pero manteniendo el patrón de movimiento y los básicos que progresan.
- **Restricción fija:** el sábado no lleva básicos de pierna, para llegar descansado a la bici del domingo.
- **Adherencia excelente:** 24 de 24 sesiones programadas completadas entre los Meso 5 y 6. Cuando algo no se hace, no es por falta de constancia sino porque el ejercicio no encaja (caso de la Elevación de piernas estiradas Colgado).

### Rangos y RIR habituales
- **Básicos:** 5-8 reps, RIR 2.
- **Accesorios:** 8-12 reps, RIR 1.
- **Aislamientos / máquina:** 12-15 (hasta 20 en laterales), RIR 0-1.
- Tendencia reciente: rangos algo más altos en brazo (Curl y Press Francés a 12-15). En Press Banca se ha probado 4-6 (Meso 5) y 6-8 (Meso 6) sin desbloquear los 60 kg.

### Fortalezas (progresan bien)
- **Ciclismo:** la progresión más rápida de todo el historial (18 → 61 km en seis semanas), aunque el ritmo de aumento fue excesivo y precedió a la lesión.
- **Empuje horizontal inclinado:** Press Inclinado con Barra rompe meseta en el Meso 6 y marca PR a 52,5 kg.
- **Tracción vertical con lastre:** las Dominadas pasan de peso corporal a +5 kg manteniendo 6-7 reps.
- **Press Militar:** desbloqueado en el Meso 5 (33,3 → 38,0) y consolidado en el 6.
- Cuádriceps en máquina: **Prensa** (115 → 125 kg en 3 semanas) y **Hack Squat** muy sólidos.
- Resistencia de Core: Plancha 45s → **90s**; Crunch Superior con carga hasta 32 kg.

### Puntos a mejorar (estancados)
- **Press Banca**: clavado en 60 kg desde mediados del Meso 3, ya son **4 bloques**. Ni 4-6 ni 6-8 reps lo han movido. Siguiente hipótesis a probar: descansos reales de 3 minutos y revisión técnica, antes que otro cambio de rango.
- **Sentadilla, RDL e Hip Thrust planos** desde el Meso 5 (57,5 / 60 / 65 kg). Es la parte del programa que más compite con la bici del domingo.
- **Gemelos retrocediendo:** 25 → 22,5 kg en dos bloques. Peor gestión de carga del programa.
- **Deltoides posterior:** ya existe (Meso 6) pero con cargas de 2,3-3,55 kg, demasiado bajas para medir progresión.
- **Gestión de la carga total:** el Meso 6 subió a la vez el volumen de gimnasio (máximo histórico, 27,5 t/semana) y el de bici (+50 % de tiempo en tres domingos), y terminó con RPE 10 y 9 y una lesión. Los próximos bloques deben progresar **una sola variable a la vez**.

---

## 6. MESOCICLO 6 — Diseño (ejecutado 04 ago – 22 ago 2026)

> ℹ️ Este es el diseño con el que se programó el bloque. **Se ejecutó tal cual durante 3 semanas y se interrumpió el 22 ago por el esguince de tobillo.** El registro real serie a serie y el diagnóstico están arriba, en el bloque 🟫 MESOCICLO 6 de la sección 4.

**Parámetros acordados:** full-body **3 días/semana** (martes, jueves, sábado), foco **hipertrofia**, **sin semana de deload**, tirada larga de bici los domingos (~2 h). Duración prevista: **5 semanas** (04 ago – 05 sep); duración real: 3 semanas.

### Los 5 cambios respecto al Meso 5 y por qué

1. **Se añade deltoides posterior por primera vez** — *Pájaros Aislados en Polea*, 3×15-20 en el Día B. Es el único grupo con cero trabajo directo en 5 mesociclos y el que más limita el desarrollo visual del hombro.
2. **Press Banca: se sube el rango a 6-8 y se baja la carga a 55 kg** — en lugar de insistir en 4-6 reps con 60-62,5 kg. Con 3 bloques de meseta, forzar intensidad no está funcionando; acumular repeticiones de calidad con margen sí deja sitio para progresar. La regla: cuando las 4 series salgan a 8 reps, subir 2,5 kg.
3. **Vuelve la Prensa Inclinada al Día A** — fue el ejercicio con mejor progresión histórica (69 → 182 e1RM) y lleva sin usarse desde el Meso 3. Añade volumen de cuádriceps sin el coste de fatiga de otra serie de sentadilla.
4. **Se sube carga en todos los aislamientos estancados** — gemelos vuelven a 25 kg, elevaciones laterales a 7 kg, jalón a 43,6 kg, extensión de cuádriceps a 36,6 kg, remo en polea a 46 kg. En todos ellos se empieza por la parte baja del rango de reps.
5. **Core que sí admite progresión de carga** — la Plancha ya está en 90 s y deja de ser un estímulo útil. Se sustituye por *Elevación de piernas colgado* y *Crunch Superior* con peso.

### Progresión y cargas de arranque

| Ejercicio | Carga inicial | Regla de progresión |
|-----------|--------------:|---------------------|
| Press Banca con Barra | 55 kg | 4×8 → +2,5 kg |
| Sentadilla con Barra | 57,5 kg | 4×8 → +2,5 kg |
| Peso Muerto Rumano | 62,5 kg | 4×10 → +2,5 kg |
| Hip Thrust con Barra | 70 kg | 3×12 → +5 kg |
| Remo en Pronación con Barra | 45 kg | 4×10 → +2,5 kg |
| Press Militar con Barra | 30 kg | 3×8 → +2,5 kg |
| Dominada | +2,5 kg de lastre | 4×8 → +2,5 kg |
| Press Inclinado con Barra | 47,5 kg | 4×10 → +2,5 kg |
| Prensa Inclinada | 110 kg | 3×12 → +10 kg |
| Resto de máquinas / aislamientos | ver tablas | tope de reps en las 3 series → subir un paso de placa |

> **Regla general (doble progresión):** empezar en el mínimo del rango. Cuando *todas* las series alcancen el máximo del rango con el RIR objetivo, subir carga y volver al mínimo. Esto es lo que no se cerró en el Meso 5.

### Día A (6) — Martes · Empuje + cuádriceps pesado

*Dos días después de la bici, es la sesión con las piernas más frescas.*

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Press Banca con Barra | Pecho | 4 | 6-8 | 2 | 180s |
| 2 | Sentadilla con Barra | Pierna | 4 | 6-8 | 2 | 180s |
| 3 | Remo en Pronación con Barra | Espalda | 4 | 8-10 | 1 | 120s |
| 4 | Press Militar con Barra (Overhead) | Hombro | 3 | 6-8 | 1 | 120s |
| 5 | Prensa Inclinada | Pierna | 3 | 10-12 | 1 | 120s |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 12-15 | 0 | 60s |
| 7 | Press Francés con Barra Z | Tríceps | 3 | 10-12 | 1 | 90s |
| 8 | Elevación de piernas estiradas Colgado | Core | 3 | 10-15 | 1 | 60s |

### Día B (6) — Jueves · Tracción + cadena posterior

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Peso Muerto Rumano con Barra | Pierna | 4 | 8-10 | 2 | 180s |
| 2 | Dominada *(con lastre)* | Espalda | 4 | 6-8 | 1 | 150s |
| 3 | Press Inclinado con Barra | Pecho | 4 | 8-10 | 1 | 150s |
| 4 | Hip Thrust con Barra | Pierna | 3 | 8-12 | 1 | 150s |
| 5 | Remo Horizontal Cerrado Neutro en Polea | Espalda | 3 | 10-12 | 1 | 90s |
| 6 | **Pájaros Aislados en Polea** *(nuevo)* | Hombro | 3 | 15-20 | 0 | 60s |
| 7 | Curl en Supinación con Barra | Bíceps | 3 | 10-12 | 1 | 90s |
| 8 | Extensión Vertical en Pronación en Polea Alta | Tríceps | 3 | 12-15 | 0 | 75s |

### Día C (6) — Sábado · Hipertrofia + pierna ligera (pre-bici)

*Sin básicos de pierna. Todo el trabajo de tren inferior es de máquina y en rangos altos.*

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Press Banca con Mancuernas | Pecho | 4 | 8-12 | 1 | 120s |
| 2 | Jalón Abierto en Pronación en Polea Alta | Espalda | 4 | 10-12 | 1 | 90s |
| 3 | Extensión de Cuádriceps en Máquina | Pierna | 3 | 12-15 | 1 | 90s |
| 4 | Curl Femoral Vertical en Máquina | Pierna | 3 | 12-15 | 1 | 90s |
| 5 | Cruce de Poleas (Alto a Bajo) | Pecho | 3 | 12-15 | 0 | 75s |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 15-20 | 0 | 60s |
| 7 | Curl en Martillo Alterno con Mancuernas | Bíceps | 3 | 10-12 | 1 | 75s |
| 8 | Extensión de Gemelos de pie | Pierna | 4 | 12-15 | 1 | 60s |
| 9 | Crunch Superior | Core | 3 | 12-15 | 1 | 60s |

### Volumen semanal resultante

| Grupo | Series/semana | Meso 5 | Cambio |
|-------|:-------------:|:------:|--------|
| Pecho | 15 | 12,8 | ▲ |
| Espalda | 15 | 13,4 | ▲ |
| Pierna (cuádriceps) | 10 | — | ▲ vuelve la Prensa |
| Pierna (isquios/glúteo) | 10 | — | = |
| Hombro lateral | 6 | 6 | = |
| **Deltoides posterior** | **3** | **0** | ▲▲ nuevo |
| Bíceps | 6 | 6 | = |
| Tríceps | 6 | 6 | = |
| Gemelos | 4 | 4 | = |
| Core | 6 | 3 | ▲ |

**Total: 25 ejercicios · ~78 series/semana** (Meso 5: 72). Subida del 8 %, en línea con la progresión histórica y asumible sin deload al mantenerse las 3 sesiones.

### Qué vigilar durante el bloque
- Si el **Press Banca** sigue sin moverse a las 3 semanas con el nuevo rango, el problema no es la programación: tocaría revisar técnica, descanso entre series (que sean 3 min reales) o alimentación.
- Si el **jueves** se llega con las piernas cargadas de la bici del domingo, adelantar el Hip Thrust por delante del RDL para repartir la fatiga.
- Cuando las salidas lleguen a las 2 h completas, revisar si la Sentadilla del martes sigue progresando. Si se aplana dos semanas seguidas, la bici está compitiendo por la recuperación y habría que bajar a 3 series.
- **Registrar frecuencia cardiaca y potencia en la bici** para poder cruzar carga interna con rendimiento en el gimnasio en el próximo análisis.

---

## 7. MESOCICLO 7 — Retorno tras el esguince (02 sep – 04 oct 2026)

### Contexto clínico

| Dato | Valor |
|------|-------|
| Lesión | Esguince del **ligamento colateral fibular (LCF)**, tobillo derecho |
| Fecha | ~22 ago 2026 (misma fecha que la última sesión registrada) |
| Días de evolución a 1 sep | **10** |
| Estado referido | En recuperación, sin dolor incapacitante, todavía no al 100 % |
| Parón real | 10 días sin gimnasio y 2 domingos sin bici |

> ⚠️ **Esto no es un diagnóstico ni una pauta de fisioterapia.** El plan asume un esguince leve-moderado con evolución favorable y organiza la carga de gimnasio en consecuencia. Si hay dolor, inestabilidad o inflamación que aumenta tras una sesión, hay que parar y consultar con un profesional.

### Estructura del bloque: dos fases

El bloque mantiene **full-body 3 días/semana (martes, jueves, sábado)** y dura **5 semanas**, pero se parte en dos fases con rutinas distintas:

| Fase | Semanas | Fechas | Rutinas | Objetivo |
|------|:-------:|--------|---------|----------|
| **1 · Protección** | 1-2 | 02 – 13 sep | `Día A · Tobillo`, `Día B · Tobillo`, `Día C · Tobillo` | Cero carga axial y cero exigencia de equilibrio sobre el tobillo. Mantener el tren superior progresando con normalidad. |
| **2 · Retorno** | 3-5 | 15 sep – 04 oct | `Día A (7)`, `Día B (7)`, `Día C (7)` | Reintroducir sentadilla, RDL, hip thrust y gemelo con rampa de carga de tres semanas. |

Las 6 rutinas están **ya creadas en la base de datos** del usuario. Las del Meso 6 se conservan (movidas al final del listado) por si hiciera falta consultarlas.

### Criterios usados para la Fase 1

Un esguince lateral de tobillo tolera mal tres cosas: **carga axial en apoyo**, **demanda de equilibrio** y **movimientos laterales o de inversión**. Todo ejercicio que cumpliera alguna de ellas se ha sustituido:

| Ejercicio retirado | Motivo | Sustituto (Fase 1) |
|--------------------|--------|--------------------|
| Sentadilla con Barra | Carga axial máxima sobre el tobillo | Extensión de Cuádriceps en Máquina (4 series) |
| Peso Muerto Rumano con Barra | Carga axial de pie + estabilización | Curl Femoral Vertical en Máquina (4 series) |
| Prensa Inclinada | Dorsiflexión cargada al final del recorrido | Prensa Horizontal, ligera y con pies altos |
| Remo en Pronación con Barra | Posición inclinada de pie bajo carga | Remo Horizontal en Pronación en Máquina |
| Press Militar con Barra (Overhead) | De pie, con carga sobre la cabeza | Press Militar Neutro en Máquina (sentado) |
| Dominada | Impacto en la caída | Jalón Cerrado Neutro en Polea Alta |
| Hip Thrust con Barra | Mucha presión a través de los pies | Hip Thrust con Mancuerna (carga ligera) |
| Extensión de Gemelos de pie | Peso corporal sobre el tobillo lesionado | Extensión de Gemelo Aislado con Banda (sentado) |
| Pájaros Aislados en Polea | De pie, a una mano | Aperturas Traseras Neutras en Máquina |
| Cruce de Poleas (Alto a Bajo) | Postura escalonada de pie | Aperturas con Mancuernas (Flyes), tumbado |
| Elevación de piernas Colgado | Impacto en la caída | Cocoons / Crunch Superior |

Se añaden además **Aductor Externo** y **Aductor Interno en Máquina** (sentado, sin implicación del tobillo). El externo trabaja glúteo medio, que es un aporte real a la estabilidad del miembro inferior durante el retorno.

**El tren superior no cambia de exigencia:** Press Banca, Press Inclinado, Press Banca con Mancuernas, jalones, remos, bíceps y tríceps siguen su progresión normal desde donde quedaron el 22 ago.

---

### Fase 1 · Día A · Tobillo — Martes (2 y 9 sep)

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso | Carga de arranque |
|---|-----------|-------|:------:|:----:|:---:|:--------:|------------------|
| 1 | Press Banca con Barra | Pecho | 4 | 6-8 | 2 | 180s | 60 kg |
| 2 | Press Militar Neutro en Máquina | Hombro | 3 | 8-10 | 1 | 120s | tantear, RIR 1 |
| 3 | Remo Horizontal en Pronación en Máquina | Espalda | 4 | 10-12 | 1 | 120s | tantear, RIR 1 |
| 4 | Extensión de Cuádriceps en Máquina | Pierna | 4 | 12-15 | 2 | 90s | 34,3 kg |
| 5 | Aductor Externo en Máquina | Pierna | 3 | 15-20 | 1 | 60s | 32 kg |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 12-15 | 0 | 60s | 7 kg |
| 7 | Press Francés con Barra Z | Tríceps | 3 | 10-12 | 1 | 90s | 20 kg |
| 8 | Crunch Superior | Core | 3 | 12-15 | 1 | 60s | 32 kg |

### Fase 1 · Día B · Tobillo — Jueves (4 y 11 sep)

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso | Carga de arranque |
|---|-----------|-------|:------:|:----:|:---:|:--------:|------------------|
| 1 | Jalón Cerrado Neutro en Polea Alta | Espalda | 4 | 8-10 | 1 | 150s | 43,6 kg |
| 2 | Press Inclinado con Barra | Pecho | 4 | 8-10 | 1 | 150s | 52,5 kg |
| 3 | Curl Femoral Vertical en Máquina | Pierna | 4 | 10-12 | 2 | 90s | 34,3 kg |
| 4 | Hip Thrust con Mancuerna | Pierna | 3 | 12-15 | 2 | 120s | 20-24 kg |
| 5 | Remo Horizontal Cerrado Neutro en Polea | Espalda | 3 | 10-12 | 1 | 90s | 46 kg |
| 6 | Aperturas Traseras Neutras en Máquina | Hombro | 3 | 15-20 | 0 | 60s | tantear, RIR 0 |
| 7 | Curl en Supinación con Barra | Bíceps | 3 | 10-12 | 1 | 90s | 20 kg |
| 8 | Extensión Vertical en Pronación en Polea Alta | Tríceps | 3 | 12-15 | 0 | 75s | 18 kg |

### Fase 1 · Día C · Tobillo — Sábado (6 y 13 sep)

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso | Carga de arranque |
|---|-----------|-------|:------:|:----:|:---:|:--------:|------------------|
| 1 | Press Banca con Mancuernas | Pecho | 4 | 8-12 | 1 | 120s | 20 kg |
| 2 | Jalón Abierto en Pronación en Polea Alta | Espalda | 4 | 10-12 | 1 | 90s | 43,6 kg |
| 3 | Prensa Horizontal | Pierna | 3 | 12-15 | **3** | 120s | 60-70 kg, pies altos |
| 4 | Aductor Interno en Máquina | Pierna | 3 | 15-20 | 1 | 60s | 41,3 kg |
| 5 | Aperturas con Mancuernas (Flyes) | Pecho | 3 | 12-15 | 0 | 75s | 9 kg |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 15-20 | 0 | 60s | 6 kg |
| 7 | Curl en Martillo Alterno con Mancuernas | Bíceps | 3 | 10-12 | 1 | 75s | 10 kg |
| 8 | Extensión de Gemelo Aislado con Banda | Pierna | 3 | 15-20 | 2 | 60s | banda suave |
| 9 | Cocoons | Core | 3 | 15-20 | 1 | 60s | peso corporal |

**Notas de ejecución de la Fase 1:**
- **Prensa Horizontal, semana 1:** haz solo 2 series de tanteo, con los pies altos en la plataforma y sin bajar hasta el tope. Si no hay molestia, semana 2 pasa a las 3 series y sube carga.
- **Extensión de Gemelo Aislado con Banda:** es trabajo de reintroducción del tobillo, no de hipertrofia. Recorrido controlado, sin buscar el fallo, y parar si tira del lateral del tobillo.
- **Press Banca:** pies apoyados en plano, sin empuje de piernas ni arqueo forzado.

---

### Fase 2 · Rampa de reintroducción (semanas 3-5)

Las tres cargas que vuelven son **Sentadilla, RDL y Hip Thrust**, y lo hacen por debajo de donde estaban para dejar margen:

| Ejercicio | Semana 3 (15 sep) | Semana 4 (22 sep) | Semana 5 (29 sep) | Referencia Meso 6 |
|-----------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| Sentadilla con Barra | 47,5 kg · 3 series · RIR3 | 52,5 kg · 4 series · RIR2 | 57,5 kg · 4 series · RIR2 | 57,5 kg |
| Peso Muerto Rumano | 50 kg · RIR3 | 55 kg · RIR2 | 60 kg · RIR2 | 60 kg |
| Hip Thrust con Barra | 60 kg | 65 kg | 70 kg | 65 kg |
| Prensa Inclinada | 100 kg | 110 kg | 120 kg | 125 kg |
| Extensión de Gemelos sentado en Máquina | ligero, tanteo | +1 paso de placa | +1 paso de placa | 22,5 kg de pie |

El resto de ejercicios continúa desde la carga de la Fase 1 con doble progresión normal.

### Fase 2 · Día A (7) — Martes · Empuje + cuádriceps

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Press Banca con Barra | Pecho | 4 | 6-8 | 2 | 180s |
| 2 | Sentadilla con Barra | Pierna | 4 | 6-8 | 2 | 180s |
| 3 | Remo en Pronación con Barra | Espalda | 4 | 8-10 | 1 | 120s |
| 4 | Press Militar con Barra (Overhead) | Hombro | 3 | 6-8 | 1 | 120s |
| 5 | Prensa Inclinada | Pierna | 3 | 10-12 | 1 | 120s |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 12-15 | 0 | 60s |
| 7 | Press Francés con Barra Z | Tríceps | 3 | 10-12 | 1 | 90s |
| 8 | Elevación de piernas flexionadas Colgado | Core | 3 | 12-15 | 1 | 60s |

### Fase 2 · Día B (7) — Jueves · Tracción + cadena posterior

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Peso Muerto Rumano con Barra | Pierna | 4 | 8-10 | 2 | 180s |
| 2 | Dominada *(con lastre)* | Espalda | 4 | 6-8 | 1 | 150s |
| 3 | Press Inclinado con Barra | Pecho | 4 | 8-10 | 1 | 150s |
| 4 | Hip Thrust con Barra | Pierna | 3 | 8-12 | 1 | 150s |
| 5 | Remo Horizontal Cerrado Neutro en Polea | Espalda | 3 | 10-12 | 1 | 90s |
| 6 | Aperturas Traseras Neutras en Máquina | Hombro | 3 | 15-20 | 0 | 60s |
| 7 | Curl en Supinación con Barra | Bíceps | 3 | 10-12 | 1 | 90s |
| 8 | Extensión Vertical en Pronación en Polea Alta | Tríceps | 3 | 12-15 | 0 | 75s |

### Fase 2 · Día C (7) — Sábado · Hipertrofia + pierna ligera (pre-bici)

| # | Ejercicio | Grupo | Series | Reps | RIR | Descanso |
|---|-----------|-------|:------:|:----:|:---:|:--------:|
| 1 | Press Banca con Mancuernas | Pecho | 4 | 8-12 | 1 | 120s |
| 2 | Jalón Abierto en Pronación en Polea Alta | Espalda | 4 | 10-12 | 1 | 90s |
| 3 | Extensión de Cuádriceps en Máquina | Pierna | 3 | 12-15 | 1 | 90s |
| 4 | Curl Femoral Vertical en Máquina | Pierna | 3 | 12-15 | 1 | 90s |
| 5 | Cruce de Poleas (Alto a Bajo) | Pecho | 3 | 12-15 | 0 | 75s |
| 6 | Elevaciones Laterales en Máquina | Hombro | 3 | 15-20 | 0 | 60s |
| 7 | Curl en Martillo Alterno con Mancuernas | Bíceps | 3 | 10-12 | 1 | 75s |
| 8 | Extensión de Gemelos sentado en Máquina | Pierna | 4 | 12-15 | 1 | 60s |
| 9 | Crunch Superior | Core | 3 | 12-15 | 1 | 60s |

---

### Cambios de la Fase 2 respecto al Meso 6 (más allá de la lesión)

1. **Deltoides posterior pasa de polea a máquina.** Los *Pájaros Aislados en Polea* se quedaron en 2,3-3,55 kg, cargas demasiado bajas para progresar de forma medible. Las *Aperturas Traseras Neutras en Máquina* permiten subir por pasos de placa.
2. **Gemelo sentado en lugar de gemelo de pie.** Doble motivo: el de pie llevaba dos bloques bajando de carga (25 → 22,5 kg) y, tras un esguince, cargar el peso corporal sobre el tobillo lesionado es lo último que debe volver. El sentado además enfatiza el sóleo, que es justo el que más se resiente en un tobillo inmovilizado.
3. **El core del Día A cambia a Elevación de piernas flexionadas Colgado.** La versión con piernas estiradas estaba prescrita en el Meso 6 y no se hizo ni un solo día. La flexionada es más accesible y sí se va a ejecutar.
4. **Sin cambios en el resto.** Después de un parón de 10 días y con una lesión de por medio, lo prudente es cambiar lo mínimo y recuperar el hilo de progresión que el Meso 6 sí había desbloqueado.

### Ciclismo durante el bloque

La bici es la parte del programa que más riesgo tiene de rebrote, porque el pedaleo mueve el tobillo en cada vuelta y la salida del 16 ago (2 h 37 min) ya fue un salto grande. Rampa propuesta:

| Domingo | Propuesta |
|---------|-----------|
| 06 sep | Rodillo o llano suave, 30-40 min. Si molesta el tobillo, no salir. |
| 13 sep | Llano, 60-75 min, sin levantarse del sillín |
| 20 sep | 90 min, desnivel suave |
| 27 sep | 2 h |
| 04 oct | 2 h - 2 h 15 min |

**No volver a los 2 h 30 min hasta que el tobillo esté asintomático caminando y en las sesiones de gimnasio.** El pico de 60 km del 16 ago debe ser el techo del bloque, no el punto de partida.

### Qué vigilar

- **La regla de las 24 h:** si el tobillo está más hinchado o dolorido al día siguiente de una sesión, esa sesión fue demasiado. Retrocede un paso, no dos.
- **No pases a la Fase 2 por calendario, sino por síntomas.** Si el 15 sep el tobillo sigue molestando al caminar rápido o al bajar escaleras, repite una semana más de Fase 1: está diseñada para poder alargarse sin perder estímulo en el tren superior.
- **Press Banca:** cuarto bloque estancado en 60 kg. Este bloque no es el momento de atacarlo con más intensidad; mantén 4×6-8 a 60 kg y céntrate en que las 4 series salgan a 8. Si al acabar el Meso 7 sigue igual, toca revisar técnica y descansos reales de 3 minutos.
- **Registra el RPE de sesión.** Los únicos dos RPE del historial son un 10 y un 9, justo antes de la lesión. Ese dato, tomado de forma sistemática, es la señal de alarma más barata que tienes.
- **Registra frecuencia cardiaca y potencia en la bici** para poder cruzar carga interna y fatiga en el próximo análisis.

---

*Documento generado a partir del historial real en base de datos. Cargas en kg; en ejercicios de peso corporal el valor 0 indica que la carga es el propio cuerpo (lo relevante son las reps/segundos).*
