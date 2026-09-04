# Auditoría del catálogo de ejercicios

> Generado por `node scripts/audit-catalog.mjs`. Solo lectura.

- **Filas:** 2283
- **nativo:** 750
- **fdb:** 807
- **lyfta:** 726

## Huecos por origen

| Comprobación | Total | nativo | fdb | lyfta | Por qué importa |
|---|---|---|---|---|---|
| equipment_list vacío | 75 | 0 | 75 | 0 | sin equipo canónico la fila es invisible al filtro de material |
| equipment_list con término no canónico | 0 | 0 | 0 | 0 | rompe los chips del filtro: sale un duplicado por cada variante |
| equipment no derivado de equipment_list | 0 | 0 | 0 | 0 | las dos columnas han divergido; `equipment` debe derivarse de la lista |
| dificultad fuera de 1/2/3 | 0 | 0 | 0 | 0 | impide filtrar por dificultad en servidor |
| patron_movimiento vacío | 276 | 53 | 159 | 64 | invisible a los filtros por patrón y al encaje por deporte |
| cualidad vacía | 474 | 326 | 76 | 72 | invisible al filtro por cualidad (fuerza, hipertrofia…) |
| plano nulo | 246 | 43 | 149 | 54 | resta puntos en el encaje por deporte de sportExerciseScore |
| taxonomía fuera de vocabulario | 0 | 0 | 0 | 0 | debería ser imposible: hay un CHECK en la tabla |
| instructions vacías | 0 | 0 | 0 | 0 | la ficha de detalle sale sin explicación |
| sin medio (gif_url e imagen nulos) | 22 | 3 | 3 | 16 | la tarjeta sale sin demo |
| nombre_en nulo | 2283 | 750 | 807 | 726 | no se puede buscar en inglés |
| musculos_involucrados vacío | 225 | 55 | 14 | 156 | no aparece al buscar por músculo |
| grupo_muscular nulo | 0 | 0 | 0 | 0 | no encaja en ningún grupo del filtro principal |

## Vocabulario de equipo

En uso: **24** de los 24 términos canónicos.

Ningún término fuera del vocabulario canónico.



| Equipo | Filas |
|---|---|
| Ninguno | 442 |
| Barra Larga | 272 |
| Mancuernas | 270 |
| Polea | 221 |
| Otro | 187 |
| Máquina | 154 |
| Kettlebell | 144 |
| Lastre | 98 |
| Banco Plano | 90 |
| Bandas | 87 |
| Suspensión | 86 |
| Fitball | 77 |
| Banco Inclinable | 75 |
| Balón Medicinal | 47 |
| Barra Z | 33 |
| Trineo | 25 |
| Palo | 21 |
| Cuerda de Batalla | 16 |
| Banco Scott | 15 |
| Cuerda | 12 |
| Foam Roller | 11 |
| Barra Hexagonal | 5 |
| Bosu | 5 |
| Cardio | 1 |

## Ejemplos

### equipment_list vacío (75)

| Ejercicio | Origen | id |
|---|---|---|
| Estiramiento de Sóleo y Tendón de Aquiles de Pie | fdb | `012b9e8f-3aa1-4268-89d4-93265e26c6b5` |
| Aceleración Lineal contra Pared | fdb | `0ae4a478-018e-4d66-8f3b-7b2fbd79e272` |
| Estiramiento de Antebrazo de Rodillas | fdb | `12c303ac-f591-464e-9fab-a882338b9c3e` |
| Báscula Pélvica a Puente | fdb | `20d55326-cb41-4379-a6c9-ea4660533dde` |
| Estiramiento de Pectoral a un Brazo en Pared | fdb | `20d6dcec-373e-426f-90c3-5409edc96285` |
| Estiramiento de Espalda Media | fdb | `2521dde3-c878-4c90-8286-6eb8cfd76b53` |
| Estiramiento de Gemelos Sentado | fdb | `2b94afb6-97a1-4f70-b536-3ea44fe685f8` |
| Estiramiento del Corredor | fdb | `30a1c58d-6753-4703-8186-e98f7f89097d` |
| Estiramiento hacia Arriba | fdb | `36fdc202-4d7f-46d1-911f-c7453cde5764` |
| Técnica de Salida Lineal en Tres Fases | fdb | `3bc0fe95-cd5a-4c9c-af0e-2787a4839de5` |

### patron_movimiento vacío (276)

| Ejercicio | Origen | id |
|---|---|---|
| Estiramiento de Sóleo y Tendón de Aquiles de Pie | fdb | `012b9e8f-3aa1-4268-89d4-93265e26c6b5` |
| Escaladora | fdb | `04606e08-0411-414e-8037-9a2762e72bfe` |
| Contracción Isométrica de Pectoral | fdb | `051881c5-737e-4a03-b017-08f7fbc72ba4` |
| Estiramiento de Isquiosurales Tumbado | fdb | `05f0ab3d-6716-484d-aeea-97ca8764a458` |
| Aductor Interno en Máquina | nativo | `067a9e50-5881-43a7-840b-1e0fd77259f6` |
| Elevaciones Circulares con Mancuernas | nativo | `072e0df4-f89a-41bd-83e4-11286a17dd67` |
| Rack Pull con Bandas | fdb | `0a46d44a-e891-4980-ab95-1bb67bcb118a` |
| Aceleración Lineal contra Pared | fdb | `0ae4a478-018e-4d66-8f3b-7b2fbd79e272` |
| Crunch Lateral con Barra | nativo | `0b858939-c462-46ae-b9ed-452155547bf4` |
| Cruce superior de Poleas | nativo | `0bf9670d-0dbf-447f-8afb-b5cebb2810f7` |

### cualidad vacía (474)

| Ejercicio | Origen | id |
|---|---|---|
| Press Frontal en Máquina | nativo | `00dbbaa0-8ea1-461f-ab8f-18f3a3316f1d` |
| Elevación de Cadera con Giro | lyfta | `010a2990-e6de-4837-bff7-3c35952e2685` |
| Pullover con Mancuerna | nativo | `011e2f68-9f1e-4202-ac3b-13ddee6cbf6d` |
| Flexión Inclinada Agarre Medio | fdb | `012e6918-93b2-4b9f-9bde-8e966af7ada0` |
| Dominadas al Esternón (Gironda) | fdb | `017eeb86-9ab5-4998-8abd-17b735373bce` |
| Remo Superior Aislado en Polea | nativo | `01f3c986-dc04-4a01-8986-1a603c301a1b` |
| Pullover con Barra Z | nativo | `0362f84d-3049-4b30-a61d-c059c286925a` |
| Remo Neutro con Mancuernas | nativo | `05039cbd-099f-4e94-bc9c-da19e6ecdee0` |
| Giro de Abajo a Arriba con Banda en Barra | lyfta | `0527fb53-99bf-422f-a54d-e040277c1236` |
| Remo al mentón con Mancuernas | nativo | `057b1f72-d25d-451f-ba3b-b305b57c1839` |

### plano nulo (246)

| Ejercicio | Origen | id |
|---|---|---|
| Estiramiento de Sóleo y Tendón de Aquiles de Pie | fdb | `012b9e8f-3aa1-4268-89d4-93265e26c6b5` |
| Escaladora | fdb | `04606e08-0411-414e-8037-9a2762e72bfe` |
| Contracción Isométrica de Pectoral | fdb | `051881c5-737e-4a03-b017-08f7fbc72ba4` |
| Estiramiento de Isquiosurales Tumbado | fdb | `05f0ab3d-6716-484d-aeea-97ca8764a458` |
| Elevaciones Circulares con Mancuernas | nativo | `072e0df4-f89a-41bd-83e4-11286a17dd67` |
| Rack Pull con Bandas | fdb | `0a46d44a-e891-4980-ab95-1bb67bcb118a` |
| Aceleración Lineal contra Pared | fdb | `0ae4a478-018e-4d66-8f3b-7b2fbd79e272` |
| Cruce superior de Poleas | nativo | `0bf9670d-0dbf-447f-8afb-b5cebb2810f7` |
| Remo Prono en Banco Inclinado | fdb | `0e42cef9-840d-48ad-bfbb-182e9b4b8c9c` |
| Liberación Miofascial de Cuádriceps | fdb | `0e90d0fb-e85f-429d-afdd-6b22a1cc21c3` |

### sin medio (gif_url e imagen nulos) (22)

| Ejercicio | Origen | id |
|---|---|---|
| Flexión de Rodillas con Toque de Hombro | lyfta | `01df3b4f-6c2b-4e0d-a6a1-16b967426a9e` |
| Paso Lateral Alterno | lyfta | `105af3fd-b6ef-4571-8e38-21683b084fe0` |
| Extensión de Tríceps sobre la Cabeza con Kettlebell | fdb | `14b324c7-72c9-48f8-bddb-659565e92ee7` |
| Sentadilla con Rodilla Alta | lyfta | `1d3b4986-11a1-449f-9d5b-a52dfdba1944` |
| Zancada Diagonal | lyfta | `251432bb-1fa1-4935-b687-f7cd2bb6061d` |
| Bisagra de Cadera con Barra PVC | lyfta | `293460f8-918e-46bb-b442-3111169ca221` |
| Rotación de Antebrazo Palma Arriba y Abajo | lyfta | `323ebeb0-54ff-436d-a694-f22f0a3de853` |
| Peso Muerto Abierto (Posición) | lyfta | `337e0052-875f-4110-9dee-ad231b2b205f` |
| Halo con Kettlebell | fdb | `3e84d787-1212-49b2-af1a-760b173c7d58` |
| Curl Femoral Alterno con Golpeo | lyfta | `52b487b4-69ea-418b-9ab9-d9271354d18b` |

### nombre_en nulo (2283)

| Ejercicio | Origen | id |
|---|---|---|
| Subida al Cajón con Kettlebell | lyfta | `0036b74a-c2de-4d9b-b8d6-d961057adafe` |
| Peso Muerto con Kettlebell | lyfta | `0078d533-c759-4222-8ba7-f0c4ba2a4cbe` |
| Curl de Muñeca Prono en Banco con Mancuernas | fdb | `00da824b-c417-45cb-93a2-89f16ba7dcc7` |
| Press Frontal en Máquina | nativo | `00dbbaa0-8ea1-461f-ab8f-18f3a3316f1d` |
| Sentadilla Búlgara con Salto | lyfta | `00f28e3a-460d-44f0-ad31-f7d811da4ff5` |
| Crunch con Rodillas Flexionadas Sentado en Suelo con Lastre | lyfta | `00f2c287-ebfc-4305-a29c-13df89de3f0f` |
| Elevación de Cadera con Giro | lyfta | `010a2990-e6de-4837-bff7-3c35952e2685` |
| Pullover con Mancuerna | nativo | `011e2f68-9f1e-4202-ac3b-13ddee6cbf6d` |
| Curl Concentrado en Pronación con Barra | nativo | `012343a3-d215-4e77-ab78-2072906880e6` |
| Estiramiento de Sóleo y Tendón de Aquiles de Pie | fdb | `012b9e8f-3aa1-4268-89d4-93265e26c6b5` |

### musculos_involucrados vacío (225)

| Ejercicio | Origen | id |
|---|---|---|
| Sentadilla Búlgara con Salto | lyfta | `00f28e3a-460d-44f0-ad31-f7d811da4ff5` |
| Saltos de Tijera | lyfta | `015cdafd-a576-4929-841f-120d5435c7ba` |
| Salto en Profundidad a Salto de Vallas | lyfta | `05b4d18e-477e-411f-9e64-74475751624e` |
| Carrera hacia atrás | nativo | `07e2683e-f47b-43a8-a264-3f80ecb26acc` |
| Butt Kicks | nativo | `08e7fa92-79b9-4b06-9de7-92a8bffb279a` |
| Salto con Cuerda Alto | nativo | `090c2890-a277-496d-8a1d-de113c06f626` |
| Sentadilla en Pared a una Pierna | lyfta | `0a364f9e-daae-4467-b18c-fa4185fd6ffa` |
| Máquina Escaladora | nativo | `0aa1a5c9-3f0b-4e06-b114-bd800ae906d8` |
| Paseo con Saco (Strongman) | lyfta | `0ab120d0-a9ec-447b-9712-f72b8c4eb1c0` |
| Carrera de pasos cortos | nativo | `0bf07d2c-5c92-46c4-83ec-34861ebaac69` |
