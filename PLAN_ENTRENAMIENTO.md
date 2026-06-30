# PLAN DE ENTRENAMIENTO — Análisis Histórico Detallado

> **Propósito de este documento:** servir como base de conocimiento "megadetallada" del historial real de entrenamiento del usuario, para que una IA pueda generar rutinas totalmente personalizadas basadas en su progresión, preferencias de ejercicios, rangos de repeticiones, RIR y volumen por grupo muscular.

- **Usuario:** `isarubio95` (isarubio95@gmail.com)
- **Nivel app:** 14 · **XP:** 13.980 · **Racha:** 20 días (máx. 20)
- **Periodo analizado:** 7 feb 2026 → 21 jun 2026
- **Sesiones completadas:** 75 (73 de fuerza + 2 de "Abs")
- **Series registradas:** 1.396 · **Ejercicios ejecutados:** 416
- **Estructura:** Torso / Pierna (split TP, 4 días/semana) con dos variantes (A/B) que se alternan
- **Fuente de datos:** base de datos de la app (tablas `actividad` → `ejercicio` → `serie`)

---

## 0. Notas importantes sobre los datos (leer antes de interpretar)

Estas advertencias son clave para que la IA no saque conclusiones erróneas:

1. **Ejercicios de peso corporal se registran con `peso = 0`**: Dominadas, Fondos/Dips, Plancha, Cocoons, Elevación de piernas y Crunch colgado. En estos, el dato relevante son las **repeticiones** (o segundos en Plancha), no el peso.
2. **El peso del Mesociclo 1 en barra está infravalorado**: en Press Banca, Prensa y similares los valores del Meso 1 (p. ej. Press Banca 12,5–17,5 kg, Prensa 32–52 kg) parecen registrados sin contar la barra o por convención distinta, porque en el Meso 3 saltan a 50–60 kg y 130 kg respectivamente. **No se deben comparar cargas absolutas del Meso 1 con las posteriores** en estos ejercicios; sí es válida la progresión *dentro* de cada mesociclo.
3. **Notación de series:** `peso x repeticiones`. Cuando hay dato de RIR por serie se añade `(RIRn)`. `0x0` = serie registrada vacía / fallida (ignorar).
4. **1RM estimado (e1RM):** fórmula de Epley `peso × (1 + 0,0333 × reps)`. Usado solo como referencia de tendencia.
5. **Plancha:** las repeticiones representan **segundos**.

---

## 1. Resumen global de los 4 mesociclos

| Meso | Fechas | Sesiones | Rutinas | Foco / cambios principales |
|------|--------|----------|---------|----------------------------|
| **1** | 07 feb – 03 mar | 15 | TORSO A/B, PIERNA A/B | Base. Sentadilla + Press Banca + Press Militar barra. Dominadas y Dips a peso corporal. |
| **2** | 10 mar – 05 abr | 16 | Torso A/B, Pierna A/B | Introduce Prensa pesada, Press Banca Cerrado/Inclinado, banco Scott, T-Bar. Aparece Core (Crunch). |
| **3** | 07 abr – 14 may | 20 | Torso A/B, Pierna A/B | Mayor volumen de pierna (pico histórico). Sentadilla + Prensa altas. Más trabajo de Core y brazo. |
| **4** | 16 may – 21 jun | 22 | Torso A/B, Pierna A/B (+2 Abs) | Más volumen de torso. Hack Squat y Aductores nuevos. Press Banca estancado en 60 kg. |

### Volumen total por mesociclo (kg levantados = Σ peso×reps)

| Meso | Volumen total (kg) | Series totales | Reps totales |
|------|-------------------:|---------------:|-------------:|
| 1 | 67.955 | 279 | 2.740 |
| 2 | 76.937 | 287 | 2.891 |
| 3 | 121.095 | 417 | 4.755 |
| 4 | 131.429 | 413 | 5.028 |

> Tendencia clara: **volumen creciente y sostenido** mesociclo a mesociclo (+13 % → +57 % → +9 %), con el mayor salto entre Meso 2 y Meso 3.

---

## 2. Progresión de levantamientos clave (entre mesociclos)

e1RM estimado (kg). Recordar la advertencia de cargas del Meso 1.

| Ejercicio | Meso 1 | Meso 2 | Meso 3 | Meso 4 | Tendencia |
|-----------|:------:|:------:|:------:|:------:|-----------|
| Sentadilla con Barra | 52,4 | — | 70,9 | — | ▲ +35 % |
| Press Banca con Barra | (20,4)* | — | 72,0 | 74,0 | ▲ sólido / estancando |
| Peso Muerto con Barra | (72,0)* | — | — | 82,3 | ▲ |
| Peso Muerto Rumano | 53,3 | 66,7 | 70,0 | 78,6 | ▲▲ progresión constante |
| Hip Thrust con Barra | 76,0 | 80,2 | 85,5 | 91,0 | ▲▲ progresión constante |
| Prensa Inclinada | (69,3)* | 145,6 | 181,9 | — | ▲▲▲ gran salto |
| Press Militar Barra | 31,7 | — | — | 33,3 | ≈ plano |
| Remo en Pronación Barra | — | — | 53,3 | 56,0 | ▲ leve |

`*` valores del Meso 1 con probable infrarregistro de carga (ver Nota 2).

### Lecturas para la IA
- **Mejor progresión:** Peso Muerto Rumano y Hip Thrust (cadena posterior y glúteo) → progresión limpia y continua. Buen candidato a seguir periodizando al alza.
- **Estancamiento:** Press Banca (60 kg tope desde Meso 3) y Press Militar. El pectoral/hombro en empuje necesita un nuevo estímulo (variar rep range, frecuencia, técnica o descarga).
- **Cuádriceps:** Prensa y Hack Squat muy fuertes; Sentadilla libre creció pero se usa menos en Meso 4.

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

> **Observación:** Pierna domina siempre (~50 % del volumen). Espalda > Pecho hasta Meso 4, donde Pecho casi iguala a Espalda por el aumento de trabajo de pectoral. **Hombro, Bíceps y Tríceps reciben relativamente poco volumen** comparado con tren inferior.

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

## 5. Patrones, preferencias y conclusiones para la IA

### Estructura preferida
- **Split Torso/Pierna (A/B)**, 4 sesiones/semana, ~5-7 ejercicios por sesión, 3-4 series por ejercicio.
- Rotación estable: Pierna A (más cuádriceps/empuje), Pierna B (más cadera/femoral), Torso A (fuerza/básicos + brazo), Torso B (hipertrofia/aislamientos + lateral).
- Mesociclos de **~4-6 semanas**, cambiando selección de ejercicios entre bloques pero manteniendo el patrón de movimiento.

### Rangos y RIR habituales
- **Básicos:** 5-8 reps, RIR 2.
- **Accesorios:** 8-12 reps, RIR 1.
- **Aislamientos / máquina:** 12-15 (hasta 20 en laterales), RIR 0-1.
- Tendencia reciente (Meso 4): subir reps en brazo (Curl y Press Francés a 12-15).

### Fortalezas (progresan bien)
- Cadena posterior y glúteo: **Hip Thrust** (76→91 e1RM), **Peso Muerto Rumano** (53→79), **Peso Muerto** (PR 70 kg).
- Cuádriceps en máquina: **Prensa** y **Hack Squat** muy sólidos.
- Resistencia de Core (Plancha 45s → 75s).

### Puntos a mejorar (estancados)
- **Press Banca**: clavado en 60 kg desde mediados de Meso 3. Necesita estrategia nueva (doble progresión, frecuencia 2x, trabajo de tríceps pesado, o microcarga + descarga).
- **Press Militar**: prácticamente plano todo el periodo.
- **Hombro lateral, Bíceps y Tríceps**: bajo volumen relativo; si el objetivo es estética/hipertrofia equilibrada, conviene subir series semanales.
- **Sentadilla libre**: progresó bien en Meso 3 pero desaparece en Meso 4 (sustituida por Hack Squat). Decidir si recuperarla.

### Recomendaciones para generar el próximo mesociclo (Meso 5)
1. Mantener split Torso/Pierna A/B y la base de ejercicios que progresan (Hip Thrust, RDL, Hack Squat, Jalón Abierto, Remo Horizontal).
2. **Romper el estancamiento de empuje horizontal:** priorizar Press Banca al inicio de Torso A con doble progresión y, opcionalmente, una segunda exposición semanal ligera.
3. **Subir volumen de hombro lateral y brazo** (de ~3 a 4-5 series semanales por cabeza) si el objetivo es hipertrofia general.
4. Incluir una **semana de descarga** (deload) cada 4-5 semanas: el volumen lleva subiendo 4 bloques seguidos sin descarga clara.
5. Cuidar el registro de datos: hubo sesiones con `0×0` (Abs, algún Peso Muerto). Mejorar el log mejora la calidad del análisis futuro.

---

*Documento generado a partir del historial real en base de datos. Cargas en kg; en ejercicios de peso corporal el valor 0 indica que la carga es el propio cuerpo (lo relevante son las reps/segundos).*
