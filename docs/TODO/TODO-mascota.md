# La Forma: compañero de entrenamiento

Propuesta de producto. El compañero no es un segundo juego ni un Tamagotchi pegado al dashboard: es la identidad visual de cómo entrenas. Dos personas en el nivel 20 no deberían verse iguales si una vive en el rack y la otra en la carretera.

Nombre de trabajo: **Forma**. Ya es el vocabulario de la app (“tu forma hoy”). Forma es el sistema; la **especie** es la etapa del árbol (Turista, Forjador, Guerrero…); el **nombre propio** lo pone el usuario en el onboarding. Alternativas al nombre del sistema: Compañero (claro, genérico) o Eco (poético, menos obvio).

---

## Por qué ahora

Ya existen las tres capas que otras apps de deporte suelen tener sueltas:

- Nivel, XP y racha semanal (`useGamification`, widget del dashboard).
- Logros por hitos (niveles 5, 20, 50, entre otros).
- Carga de entrenamiento y “tu forma hoy” (Banister).

Falta el objeto emocional que una esas tres cosas: un cuerpo que crece con el diario.

Hevy y Strong son el cuaderno. Strava es el feed. Fitbit son insignias. Duolingo es culpa por racha. Nadie convierte el estilo de entrenamiento en un personaje que se puede enseñar en el perfil. Ese es el hueco.

Y el personaje solo se enseña si es **tuyo**. Un avatar que comparten diez mil usuarios de nivel 20 no se comparte: se ignora. Por eso la unicidad no es un adorno del sistema, es su condición de funcionamiento.

---

## Tres reglas

1. **Una criatura, no un catálogo.** El mismo ser cambia de silueta; nunca se colecciona un segundo. Pero tu criatura no es la criatura de nadie más: **la especie te clasifica, el genoma te identifica**. Ver *El modelo de dos capas*.
2. **El nivel abre puertas; el entreno elige la puerta.** Subir de nivel no te hace “más fuerte” en abstracto. Te deja evolucionar. El mix de sesiones decide hacia dónde.
3. **Nunca se muere.** Si dejas de entrenar, se duerme. Castigar con hambre o muerte genera abandono, no constancia. La racha ya cubre la presión sana.

Tres palancas, no una:

| Palanca | Qué controla |
| --- | --- |
| Nivel | Capacidad: evoluciones, huecos de tienda, rareza |
| Afinidad | Dirección: fuerza, resistencia o equilibrio |
| Forma (Banister) | Estado: fresca, productiva o cargada |

El **genoma** no es una cuarta palanca: es lo que no cambia. Las tres palancas mueven la criatura; el genoma es quien la mueve.

---

## El bucle

Cada sesión cerrada hace tres cosas, no una: suma XP (nivel), deposita afinidad (rama) y actualiza el ánimo del compañero con la zona de forma.

El ritual de subir de nivel es el único momento en el que la tienda aparece de forma insistente: chispas, ofrenda y, si toca, evolución.

| Momento | Qué gana el usuario | Qué gana el compañero |
| --- | --- | --- |
| Cierra un entreno de fuerza | XP + racha + logros | Afinidad fuerza, posible rasgo muscular |
| Cierra un cardio | XP (hoy no existe: hay que crearlo) | Afinidad resistencia + disciplina |
| Semana con los dos | Bonus de equilibrio | Empuja hacia Todoterreno / Semidiós |
| Forma en zona productiva | Nada extra de XP | Ánimo “afilado”; calidad para Semidiós |
| Sobreentrenamiento | La carga ya lo avisa | Se ve pesado. No se le viste de fiesta |
| Sube de nivel | Chispas + ofrenda | Si es 5 / 20 / 50, evolución |

---

## El modelo de dos capas

Este es el núcleo del diseño y explica por qué la variedad puede ser masiva sin que el arte se vaya de las manos.

| Capa | Qué es | Cómo se obtiene | Dónde se aprecia |
| --- | --- | --- | --- |
| **Especie** | La forma del árbol de evolución: Turista, Forjador, Guerrero… | Se **gana** entrenando | En la **silueta**, a 40 px, en el widget del dashboard |
| **Individuo** | El genoma: color, patrón, ojos, cuernos, cola | Se **fija al nacer** con una semilla derivada del `user_id` | En el **detalle**, a 240 px, en la ficha |

La especie es pública y comparable: alguien tiene que poder mirar tu perfil y decir “ese es un Guerrero”. El individuo es tuyo: dos powerlifters de nivel 20 son los dos un Guerrero, pero no son el mismo Guerrero.

**Consecuencia crítica para el arte:** una “forma” deja de ser un sprite dibujado a mano. Una forma es **una receta**: un conjunto de valores fijados en el genoma (chasis, extremidades, escala, textura, postura). Por eso 31 formas son viables y 31 ilustraciones no lo serían.

**Qué tipo de criatura es.** Monstruito inventado con **eco animal**: la silueta recuerda a un arquetipo animal — algo bovino y pesado para fuerza, algo felino o cérvido para resistencia — pero no es ninguna especie real reconocible. El eco da lectura instantánea de la rama; lo inventado deja libre la anatomía para deformarse en cada evolución sin caer en la caricatura del cuerpo.

---

## Árbol de evolución

Un compañero, tres ramas, tres etapas. Treinta y una formas nombradas, todas decididas por señales que ya están en la base de datos.

- Nacimiento (nivel 1).
- Horquilla en el **nivel 5** (logro Ascenso): rama.
- Especialización en el **nivel 20** (logro Élite): tres formas por rama.
- El **nivel 50** no cambia de rama ni de forma II: elige una de dos siluetas definitivas dentro de la forma ya elegida. Guerrero no puede acabar en Coloso.

Los nombres toman el registro de los apodos de nivel de [TODO.md](TODO.md) (Turista del Gym, Forjador de Hábitos, Guerrero del Hierro, Gladiador, Máquina, Mutante, Coloso, Titán, Semidiós, Leyenda del Olimpo): gym, cachondeo y mito, no metalurgia poética. Esa lista no vive como una barra paralela — **la especie es el apodo**. Las chispas de la tienda siguen llamándose chispas; ya no chocan con una especie Chispa.

```
Turista (n.1)
│
├─ Forjador (n.5) · fuerza
│   ├─ Guerrero (n.20)
│   │   ├─ Titán     (n.50)
│   │   └─ Gladiador (n.50)
│   ├─ Coloso (n.20)
│   │   ├─ Mutante   (n.50)
│   │   └─ Mole      (n.50)
│   └─ Máquina (n.20)
│       ├─ Pistón    (n.50)
│       └─ Engranaje (n.50)
│
├─ Todoterreno (n.5) · equilibrio
│   ├─ Tanque (n.20)
│   │   ├─ Bruto    (n.50)
│   │   └─ Tractor  (n.50)
│   ├─ Semidiós (n.20)
│   │   ├─ Leyenda  (n.50)
│   │   └─ Olimpo   (n.50)
│   └─ Explorador (n.20)
│       ├─ Errante  (n.50)
│       └─ Rodante  (n.50)
│
└─ Nómada (n.5) · resistencia
    ├─ Locomotora (n.20)
    │   ├─ Asfalto  (n.50)
    │   └─ Rodador  (n.50)
    ├─ Cohete (n.20)
    │   ├─ Rayo     (n.50)
    │   └─ Volata   (n.50)
    └─ Cabra (n.20)
        ├─ Cima     (n.50)
        └─ Puerto   (n.50)
```

1 + 3 + 9 + 18 = **31 formas**. Dos hijas por forma II, no tres: un segundo eje binario se proyecta; un trío de barras tras ~1,5 años sería un empate ruidoso.

### Etapas 0 y I

| Forma | Etapa | Nivel | Rama | Cómo se alcanza | Aspecto |
| --- | --- | --- | --- | --- | --- |
| Turista | Nacimiento | 1 | Común | Todos empiezan aquí | Pequeña y neutra. El genoma ya es único; la silueta todavía no dice nada del deporte |
| Forjador | Evolución I | 5 | Fuerza | Afinidad de fuerza ≥ 58 % en las últimas 8 semanas | Compacta, hombros marcados. Cinturón, tiza |
| Nómada | Evolución I | 5 | Resistencia | Afinidad de resistencia ≥ 58 % | Más ligera y alargada. Zapatillas, dorsal |
| Todoterreno | Evolución I | 5 | Equilibrio | Ninguna afinidad supera el 58 %. Vía híbrida, no consuelo: exige fuerza y cardio de verdad | Silueta intermedia. Puede llevar rasgos de ambos |

### Etapa II (nivel 20)

Cada rama se abre en tres. La señal que decide es real y ya se guarda:

| Forma | Rama | Qué la decide | Señal en base de datos | Aspecto |
| --- | --- | --- | --- | --- |
| Guerrero | Fuerza / potencia | Cargas altas, reps bajas, series cerca del fallo | `serie.peso_kg`, `serie.repeticiones`, `serie.rir` | Bloque denso, centro de gravedad bajo. Hábitat de rack |
| Coloso | Fuerza / hipertrofia | Volumen en 6–12 reps repartido entre grupos | `serie` + ranking muscular | Más llena; rasgos por grupo dominante |
| Máquina | Fuerza / resistencia muscular | Reps altas y densidad de sesión, descansos cortos | `serie.repeticiones`, `serie.descanso` | Fibrosa y angular, sin masa |
| Locomotora | Resistencia / fondo | Distancia y duración, no picos | `cardio_bloque.distancia_m`, `duracion_seg` | Línea continua. Hábitat de carretera |
| Cohete | Resistencia / velocidad | Intervalos y ritmo. Calidad > kilometraje vacío | `cardio_bloque` (bloques cortos), `cardio_sesion.rpe` | Más angular y tensa. Hábitat de pista |
| Cabra | Resistencia / desnivel | Metros positivos acumulados | `cardio_ruta.elevacion_positiva_m`, `cardio_sesion_cycling.desnivel_positivo_m` | Patas largas, agarre. Hábitat de trail. El nombre es el apodo del pelotón, no un dibujo de cabra |
| Semidiós | Equilibrio / atleta | Semanas con fuerza y cardio, y carga en zona productiva | Calendario + Banister | La forma más rara. Debe sentirse especial, no “la que no se decidió” |
| Tanque | Equilibrio, sesgo fuerza | Híbrido ~60/40 hacia fuerza | Afinidad 8 semanas | Todoterreno que se ensancha |
| Explorador | Equilibrio, sesgo resistencia | Híbrido ~60/40 hacia cardio | Afinidad 8 semanas | Todoterreno que se estiliza |

### Etapa III (nivel 50)

El 50 abre la puerta; el diario desde la Evolución II elige cuál de las dos siluetas definitivas. No hay salto a otra forma II. Cada eje es **ortogonal** al que ya decidió el 20: lo que el 20 no usó.

Dos, no tres, por forma II. El 20 ya gastó el eje principal de la rama; un segundo eje binario se lee en dos barras desde el nivel 35. Un tercero casi siempre empataría.

| Desde | Definitiva | Eje n.50 | Señal | Lectura |
| --- | --- | --- | --- | --- |
| Guerrero | Titán | Pico | `%` de series con reps ≤ 3 y RIR 0 (`serie.repeticiones`, `serie.rir`) | El golpe: singles y cercanía al fallo |
| Guerrero | Gladiador | Trabajo pesado | Series 3–5 con RIR 1, más series de trabajo | El empujón sostenido, no el 1RM. Se deja la piel en la arena |
| Coloso | Mutante | Frecuencia | ≥ 4 sesiones de fuerza / semana (calendario) | Volumen repartido; los cambios ya se notan |
| Coloso | Mole | Concentración | Menos días, más volumen por sesión | Pocos bloques grandes, no PPL diario |
| Máquina | Pistón | Lineal | Series sueltas, `superset_id` vacío | Fibra aislada, un golpe tras otro |
| Máquina | Engranaje | Circuito | `%` de ejercicios con `superset_id` | Piezas engranadas: superseries y densidad |
| Locomotora | Asfalto | Disciplina pie | `cardio_disciplina.codigo` running / walking | Fondo a pie, línea continua |
| Locomotora | Rodador | Disciplina rueda | `codigo` cycling | Gran fondo sobre ruedas |
| Cohete | Rayo | Disciplina pie | running / walking + bloques cortos ya fijados en el 20 | Pista, intervalos a pie |
| Cohete | Volata | Disciplina rueda | cycling + intervalos | El sprint del pelotón |
| Cabra | Cima | Disciplina pie | running / walking + desnivel ya fijado en el 20 | Trail, patas largas |
| Cabra | Puerto | Disciplina rueda | cycling + desnivel | Ciclista de puertos |
| Tanque | Bruto | Cardio del híbrido, pie | Sesiones de cardio desde el 20: cubo pie | Todoterreno ensanchado, gym + carrera |
| Tanque | Tractor | Cardio del híbrido, rueda | Cubo rueda | Todoterreno ensanchado, gym + bici |
| Semidiós | Leyenda | Cardio del híbrido, pie | Igual, cubo pie. Semidiós sigue exigiendo zona productiva | La más rara, gym + carrera. Mitad de “Leyenda del Olimpo” |
| Semidiós | Olimpo | Cardio del híbrido, rueda | Cubo rueda + zona productiva | Gym + bici con la carga bien gestionada. La otra mitad |
| Explorador | Errante | Cardio del híbrido, pie | Cubo pie | Todoterreno estilizado, sesgo cardio a pie |
| Explorador | Rodante | Cardio del híbrido, rueda | Cubo rueda | Todoterreno estilizado, sesgo cardio en bici |

Nómada y Todoterreno comparten el eje pie vs rueda a propósito: un fondista y un híbrido gym+bici tienen que leerse distintos a 40 px. Forjador no usa disciplina de cardio — quien está ahí casi no tiene esa señal — y Coloso no reusa el ranking muscular como especie: ya define la forma II, y deformar por músculos olvidados está prohibido. Frecuencia semanal celebra cómo organizas la semana.

**Cubo pie / cubo rueda (v1).** Remo, natación y `other` no abren una tercera especie. Van al cubo más cercano por tiempo o distancia: cuerpo a pie o agua → pie; rueda o remo máquina → rueda. Si más adelante hay masa de nadadores, esa vía se añade **al final** del catálogo, nunca reordenando.

Los nombres son un primer pase y hay que iterarlos antes de fijarlos en código. Ver *Salvaguardas legales*.

### Cadencia con el XP actual

Fórmula actual: 1000 XP por nivel, ~200–250 XP por sesión de fuerza. Cálculo a 220 XP de media:

| Hito | Sesiones de fuerza aprox. | Tiempo a 3–4 días/semana | Proyección visible |
| --- | --- | --- | --- |
| Nivel 5 (Evolución I) | 18 | 5–6 semanas | Desde el **nivel 3** |
| Nivel 20 (Evolución II) | 86 | ~6 meses | Con las barras de perfil interno, misma ventana de 8 semanas |
| Nivel 50 (Evolución III) | 223 | ~1,5 años | Desde el **nivel 35**: dos barras del eje n.50 |

El 35 es al 50 lo que el 3 es al 5: tiempo de agencia, no de sorpresa. Sin esa proyección, una horquilla a 1,5 años se siente aleatoria.

Si el cardio empieza a dar XP, estos tiempos se acortan: hay que topar la XP por sesión para no inflar niveles.

---

## El genoma

La segunda capa: lo que hace que tu criatura sea tuya. El genoma es un conjunto de **ranuras**, cada una con un catálogo pequeño de variantes, y cada ranura tiene **una única fuente**.

| Fuente | Significado |
| --- | --- |
| `especie` | La fija la forma actual del árbol. No se elige. Es lo que cambia al evolucionar |
| `semilla` | Determinista desde el `user_id`. Fijo de por vida |
| `mérito` | Se desbloquea con datos de entreno o logros; el usuario elige entre lo desbloqueado |
| `estado` | Dinámico: cambia día a día con la carga |

### Ranuras v1

| Ranura | Variantes | Fuente |
| --- | --- | --- |
| Chasis (torso, silueta) | 8 | especie |
| Escala / proporción | 5 | especie |
| Textura de piel | 5 | especie |
| Extremidades delanteras | 8 | especie |
| Extremidades traseras | 8 | especie |
| Cabeza | 10 | semilla |
| Ojos | 12 | semilla |
| Cola / apéndice | 10 | semilla |
| Cuernos / orejas / cresta | 14 | semilla + mérito |
| Patrón / marcas | 12 | semilla |
| Paleta base | 20 | semilla |
| Paleta acento | 10 | semilla |
| Aura / partículas | 6 | estado (Banister) |
| Postura idle | 6 | estado + mérito |
| Accesorio de rama | 12 | mérito / tienda |
| Hábitat | 8 | mérito / tienda |

### El cálculo que justifica todo esto

Solo las ranuras de semilla: 10 × 12 × 10 × 14 × 12 × 20 × 10 = **40,3 millones de individuos por especie**. Con las 31 formas del árbol, del orden de **1.250 millones** de criaturas posibles.

El coste de arte son **92 piezas SVG de criatura** (8+5+5+8+8+10+12+10+14+12; las paletas son tokens de color, no dibujo), más otras 32 de entorno y estado (aura, posturas, accesorios, hábitat). **Lineal en coste, exponencial en variedad.** Esa es la respuesta al riesgo “arte que no se puede mantener”: no se dibujan criaturas, se dibujan piezas.

**Restricción de diseño que hace que la variedad se note:** 20 paletas de las que 12 sean tonos de azul se perciben como una sola. Las paletas tienen que estar repartidas de verdad en el espacio de color, y las 20 tienen que funcionar en tema claro y oscuro. Misma disciplina que ya se aplica a los gráficos de la app.

### Pipeline de arte

**SVG modular en componentes React.** Cada pieza es un componente que dibuja sobre el mismo grid y los mismos puntos de anclaje.

- Recolor por CSS variables: una paleta es un puñado de tokens, no una copia del dibujo.
- Cero assets remotos: funciona offline en la app Capacitor, sin descargas ni caché que gestionar.
- Se anima con CSS (idle, respiración, aura) y se rasteriza a PNG con canvas para compartir en comunidad.
- Escala sin pérdida de 40 px en el widget a 240 px en la ficha.
- Las 18 recetas de etapa III reutilizan el catálogo; pie vs rueda (y Titán vs Gladiador) solo entran si hay delta de **chasis o postura** a 40 px. Las piezas nuevas se añaden al final, nunca reordenando.

### Rareza real (no comprable)

Un puñado de variantes bloqueadas tras condiciones difíciles, todas derivables de datos que ya se guardan. Son las que la gente enseña:

| Variante | Condición | Dato |
| --- | --- | --- |
| Cresta “Fundido” | PR de 1RM cerrado con RIR 0 | `serie.rir`, `serie.peso_kg` |
| Marca “Meridiano” | 52 semanas de racha | `computeStreakStats` (`src/lib/streakWeeks.ts`) |
| Patrón “Cota” | 2000 m de desnivel positivo en una semana | `cardio_ruta.elevacion_positiva_m` |
| Aura “Alba” | 20 entrenos cerrados antes de las 7:00 | `actividad.fecha_fin` |
| Textura “Sal” | 100 km en un mes natural | `cardio_bloque.distancia_m` |

Estas variantes **nunca se compran**. Es la línea que separa un logro de un artículo de tienda.

### Semilla, nacimiento y persistencia

```
seed = sha256(user_id + ":forma:v1")
```

La semilla se trocea en índices de ranura. Determinista, reproducible en cualquier cliente, sin coste de almacenamiento.

**Footgun.** Si el genoma se recalcula desde la semilla en cada render, añadir la variante 13 al catálogo de ojos desplaza el módulo y **cambia la criatura de todo el mundo**. La semilla solo genera el valor **inicial**. Reglas:

1. El genoma resuelto se congela en base de datos al nacer, junto con la versión de catálogo.
2. Toda variante nueva se añade **al final** del catálogo. Nunca se reordena, nunca se borra.

**Nacimiento con agencia.** En el onboarding se generan **3 candidatos** desde `seed+0/1/2`. El usuario elige uno, le pone nombre, y queda fijado para siempre. Mantiene la unicidad, evita el “me ha tocado uno feo” y convierte el hatch en un momento que se recuerda.

**Unicidad literal.** Columna `huella` (hash de las ranuras de semilla) con índice único. Si hay colisión al nacer, se vuelve a tirar. Así “es difícil que dos usuarios tengan la misma” es algo verificable, no una figura retórica.

---

## Salvaguardas legales

El género está lleno de referencias obvias y hay que mantenerse fuera de ellas de forma deliberada.

- **Nada de Pokémon ni Digimon.** Los diseños son copyright de The Pokémon Company / Nintendo / Game Freak y Bandai / Toei; los nombres son marca registrada. Historial agresivo de *cease and desist* contra fan projects, y una app en tienda con monetización es un objetivo mucho más claro.
- **Tampoco como placeholder temporal.** Un sprite ajeno en un commit se queda en el historial de git y en cualquier build distribuida.
- **Lo que sí es libre** son las convenciones del género: compañero que evoluciona por etapas, afinidades tipo elemento, estilo cabezón de ojos grandes. Las mecánicas y reglas de juego no son copyrightables.
- **Nombres:** nada de terminaciones `-mon`, `-chu`, `-saur`. Verificar cada nombre definitivo contra la Pokédex y la Digidex, y contra el registro de marcas (EUIPO / OEPM), antes de fijarlo en código. Esta pasada (Turista, Cabra, Rayo, Máquina, Mutante, Olimpo…) usa el mismo filtro; Rayo y Cabra merecen una pasada extra. Cabra es el apodo del pelotón, no un dibujo de cabra.
- **Referencias de arte con IA:** no prompear “estilo Pokémon” ni ningún nombre de franquicia.
- **El eco animal es de arquetipo** (pesado / ágil / anguloso), no de especie real reconocible.

---

## Afinidad

La afinidad es el volante, no un contador oculto. Si la barra es secreta, la evolución se siente aleatoria y se rompe la confianza.

- Ventana de las horquillas I y II: **últimas 8 semanas**, no la vida entera, para que un mes de trail pueda mover a un powerlifter y al revés.
- Ventana de la horquilla III (nivel 50): **desde la fecha de Evolución II**, no las últimas 8 semanas. Un bloque de 8 semanas al llegar al 50 no puede robar 18 meses de estilo.
- El usuario ve la proyección de rama desde el **nivel 3**, y la de silueta definitiva desde el **nivel 35**.

### Cómo se deposita (datos que ya existen)

| Señal | Tabla / sistema actual | Qué suma | Tope |
| --- | --- | --- | --- |
| Sesión de fuerza cerrada | `actividad` + serie completada | Fuerza | Por sesión, no por serie infinita. Evita 40 series basura |
| Sesión de cardio cerrada | `cardio_sesion` + `cardio_bloque` | Resistencia | Por duración o distancia, con techo. El easy run cuenta menos que un intervalo |
| Misma semana con ambos | Racha semanal + calendario | Empuje a equilibrio | Un cardio de 8 min no vale. Umbral mínimo de sesión seria |
| Grupo muscular dominante | Ranking muscular / heatmap | Rasgo visual, no rama | No castiga músculos olvidados. Propone un reto, no una deformidad |
| Zona de forma | Banister / `FormGauge` | Calidad (ánimo + Semidiós) | Sobreentrenar no acelera la evolución: la ralentiza |
| Logro de hito | `logro` / `usuario_logro` | Cosmético exclusivo | Nunca cambia la rama. Solo el armario |

### Primera horquilla (nivel 5): la rama

Sea F y R la afinidad normalizada de 8 semanas:

- Si `F / (F+R) ≥ 0,58` → Forjador.
- Si `R / (F+R) ≥ 0,58` → Nómada.
- En cualquier otro caso → Todoterreno.

Frase de proyección, ejemplo: “vas a Forjador; 3 cardios esta semana te acercan a Todoterreno”. Agencia, no sorpresa.

### Segunda horquilla (nivel 20): la forma dentro de la rama

Aquí ya no decide F vs R — la rama está fijada. Decide un **perfil interno** de la rama, calculado sobre la misma ventana de 8 semanas. Se elige la dominante; si ninguna llega al umbral, gana la que más se acerque.

| Rama | Ejes que compiten | Forma |
| --- | --- | --- |
| Forjador | % de series con reps ≤ 5 y RIR ≤ 1 | Guerrero |
| | % de volumen en 6–12 reps + dispersión entre grupos musculares | Coloso |
| | % de series con reps ≥ 15 + densidad de sesión | Máquina |
| Nómada | Distancia y duración media por sesión | Locomotora |
| | Variación de ritmo dentro de la sesión (bloques cortos, intervalos) | Cohete |
| | Metros positivos por kilómetro | Cabra |
| Todoterreno | Reparto ~50/50 sostenido + semanas en zona productiva | Semidiós |
| | Sesgo ~60/40 hacia fuerza | Tanque |
| | Sesgo ~60/40 hacia cardio | Explorador |

Semidiós sigue siendo la más difícil a propósito: no basta con hacer de todo, hay que hacerlo con la carga bien gestionada. Debe sentirse especial, no “la que no se decidió”.

### Tercera horquilla (nivel 50): la silueta definitiva dentro de la forma II

Aquí ya no decide el perfil del 20 — la forma II está fijada. Decide un **segundo eje**, ortogonal al anterior, calculado sobre **todo lo entrenado desde la Evolución II**. Se elige la dominante; si ninguna llega al umbral, gana la que más se acerque.

| Forma II | Ejes que compiten | Definitiva |
| --- | --- | --- |
| Guerrero | `%` de series con reps ≤ 3 y RIR 0 | Titán |
| | Series 3–5 con RIR 1, más series de trabajo | Gladiador |
| Coloso | ≥ 4 sesiones de fuerza / semana | Mutante |
| | Menos días, más volumen por sesión | Mole |
| Máquina | Series sueltas (`superset_id` vacío) | Pistón |
| | `%` de ejercicios en superserie | Engranaje |
| Locomotora / Cohete / Cabra | Cubo pie: `running` + `walking` | Asfalto / Rayo / Cima |
| | Cubo rueda: `cycling` | Rodador / Volata / Puerto |
| Tanque / Semidiós / Explorador | Cardio del híbrido, cubo pie | Bruto / Leyenda / Errante |
| | Cardio del híbrido, cubo rueda | Tractor / Olimpo / Rodante |

Remo, natación y `other` no abren especie nueva en v1: cuerpo a pie o agua → cubo pie; rueda o remo máquina → cubo rueda. Detalle y lectura visual en *Etapa III*.

Frase de proyección, ejemplo: “vas a Titán; si dejas los singles y llenas de triples, tiras a Gladiador”. Misma agencia que en el 5 y el 20.

### Arquetipos (proyección)

| Estilo | Fuerza | Resistencia | Camino | Nota |
| --- | --- | --- | --- | --- |
| Fuerza pesada | 82 | 8 | Turista → Forjador → Guerrero → Titán | 4 días de gym, casi sin cardio. Todoterreno y Semidiós quedan cerrados. El hijo clásico: singles y RIR 0 |
| Trabajo pesado | 80 | 10 | Turista → Forjador → Guerrero → Gladiador | Mismo Guerrero, pero triples/fives y RIR 1: más series de trabajo que 1RM |
| Hipertrofia | 74 | 14 | Turista → Forjador → Coloso → Mutante | PPL con variedad y ≥ 4 días. El ranking de músculos decide el rasgo visual, no la especie |
| Fuerza-resistencia | 68 | 16 | Turista → Forjador → Máquina → Pistón | Reps altas, descansos cortos, series lineales |
| Circuitos | 66 | 18 | Turista → Forjador → Máquina → Engranaje | Misma Máquina, pero `superset_id`: densidad engranada, no pistón aislado |
| Fondo | 12 | 80 | Turista → Nómada → Locomotora → Asfalto | A pie. Hoy el cardio no da XP: esta vía no existe de verdad hasta igualar la fórmula |
| Velocidad | 18 | 70 | Turista → Nómada → Cohete → Rayo | Intervalos y series en pista. Calidad > kilometraje |
| Trail | 20 | 72 | Turista → Nómada → Cabra → Cima | Desnivel acumulado a pie. Es lo que separa a un montañero de un maratoniano |
| Puertos | 18 | 74 | Turista → Nómada → Cabra → Puerto | La misma Cabra, sobre ruedas: ciclista de puertos, no trail runner |
| Híbrido | 46 | 44 | Turista → Todoterreno → Semidiós → Leyenda | La vía que diferencia fitAI: los dos deportes, zona de forma productiva, cardio a pie |
| Híbrido bici | 46 | 44 | Turista → Todoterreno → Semidiós → Olimpo | Mismo Semidiós, gym + bici. Tiene que leerse distinto a Leyenda a 40 px |
| Híbrido con sesgo | 58 | 38 | Turista → Todoterreno → Tanque → Bruto | Hace los dos, pero uno manda. Explorador → Errante es el mismo caso al revés (cardio a pie) |
| Inconstante | 40 | 20 | Sigue en Turista más tiempo | No se le mata: se duerme. El nivel llega; la evolución I se retrasa si la ventana de 8 semanas es floja |

---

## Tienda y chispas

Subir de nivel es el único momento de compra que importa. Si la tienda es un catálogo permanente al fondo de Ajustes, nadie entra.

Ritual: cierras el entreno que te hace subir de nivel → chispas → ofrenda (un cosmético pequeño alineado con tu rama) → opcionalmente gastar en el hábitat.

| Concepto | Valor |
| --- | --- |
| Chispas por nivel normal | 3 |
| Bonus en 5 / 20 / 50 | 10 |
| Ofrenda automática por nivel | 1 |

### Catálogo v1

Poco, reconocible, ligado a fitAI.

| Categoría | Ejemplos | Precio | Bloqueo |
| --- | --- | --- | --- |
| Hábitat | Rack, pista, carretera, casa | 12–18 | Ninguno en v1 |
| Accesorio de rama | Cinturón, dorsal, bidón | 8 | Solo si tu Forma es de esa rama |
| Gesto | Idle de calentamiento, pose de racha | 6 | Racha de 4+ semanas para uno de ellos |
| Placa | Nivel, username, logro diamante | 4 | Logro concreto |
| Ofrenda de nivel | Color de aura, chapa numerada | 0 | Cae sola al subir |

**Qué no se compra:** racha, nivel, afinidad, ni “comida” para que no se duerma. Tampoco **ninguna ranura del genoma**: ni las de semilla (son tu identidad) ni las variantes de rareza (son logros). La tienda se queda en accesorios, hábitat, gestos y placas — lo que va **encima** de la criatura, nunca la criatura. El inventario sobrevive a las evoluciones: el cinturón de Forjador se reinterpreta en Guerrero, y el de Guerrero en Titán o Gladiador. Si un objeto no pega en la nueva silueta, se guarda en el armario, no se borra.

**Dinero real, si algún día:** solo packs cosméticos. Nunca chispas, nunca XP, nunca saltar una evolución. En v1 ni siquiera eso: primero que la gente quiera enseñar la Forma.

---

## Dónde vive en la app

| Superficie | Qué se ve |
| --- | --- |
| Widget de gamificación (dashboard) | Sustituir la barra seca por la Forma + nivel + racha. A este tamaño solo se lee la silueta y la paleta. Un tap abre ficha |
| Ficha de la Forma (drawer) | La criatura a 240 px, donde el genoma sí se aprecia. Barras de afinidad, proyección (rama desde n.3; definitiva desde n.35), hábitat, armario, ánimo según carga, y las variantes de rareza conseguidas |
| Onboarding | Ritual de nacimiento: 3 candidatos generados desde tu semilla, eliges uno y le pones nombre |
| Toast de nivel (ya existe el de logros) | Misma familia visual: subida, ofrenda, botón “ver tienda” |
| Perfil y comunidad | La Forma al lado del avatar. Es el screenshot que se comparte, y es único |
| Tú → Progreso | No hace falta una cuarta tab. La ficha es un overlay, no otra sección |

---

## Riesgos

El potencial es alto precisamente porque el fracaso es fácil.

- **Tamagotchi de culpa.** Si hay que “alimentar” al compañero o se pone triste a las 48 h, la app pasa de entrenador a acoso. La racha semanal ya es el palo. El compañero es la zanahoria.
- **Premiar basura.** 5 XP por serie, sin tope, empuja a inflar el diario. La afinidad de fuerza tiene que caparse por sesión y mirar series completadas con sentido (RIR, rutina prevista), no el recuento bruto.
- **Cardio como ciudadano de segunda.** Hoy solo el logger de fuerza da XP. Nómada y todas sus formas II y III —y la horquilla pie/rueda de Todoterreno en el 50— serían un cartel falso. Igualar cardio (con techo por duración) es un prerrequisito, no una fase 3.
- **Arte que no se puede mantener.** Treinta y una criaturas dibujadas a mano son un estudio de animación. El genoma lo resuelve: se dibujan ~92 piezas modulares y las formas son recetas sobre esas piezas. El riesgo se desplaza, no desaparece — ahora es **que las piezas no combinen**. Todas se dibujan sobre el mismo grid y los mismos anclajes, y cada pieza nueva se valida contra una parrilla de combinaciones aleatorias antes de entrar.
- **Variedad que no se percibe.** 40 millones de combinaciones que a 40 px se ven todas iguales no son variedad. La especie tiene que leerse en la silueta y las paletas tienen que estar repartidas de verdad en el espacio de color. Si al poner treinta criaturas juntas parecen la misma, el catálogo está mal, aunque las matemáticas digan lo contrario. **Si Titán y Gladiador —o Leyenda y Olimpo— no se distinguen en el widget, la horquilla del 50 no entra:** no basta con recetas distintas en el genoma; pie vs rueda exige diferencia de postura o chasis, no solo paleta.
- **Infracción de copyright.** Es el riesgo más caro y el más fácil de cometer sin querer, sobre todo en la fase de referencias. Ver *Salvaguardas legales*.
- **Cuerpo como burla.** Usar el ranking de músculos menos entrenados para deformar al compañero es un chiste que se vuelve *body shaming*. Los músculos olvidados desbloquean un reto de logro, no una joroba.
- **Peleas entre mascotas.** Un PvP de Formas es otro producto. Rompe el tono serio de carga, RIR y planes. El social es enseñar, no combatir.

Criterio para aceptar una feature: si no cambia cómo entrenas esta semana, o no cambia cómo se te ve en comunidad, no entra. Un minijuego de acariciar al compañero no pasa. Un hábitat de pista que solo sale si haces intervalos, sí.

---

## Hoja de ruta

Construir al revés de lo vistoso. El error clásico es encargar el arte de Leyenda antes de saber si alguien mira el widget. Cada fase tiene una pregunta de producto; si la respuesta es no, se para.

El genoma **no es una fase aparte**: se reparte entre las fases existentes, empezando por las ranuras más baratas.

| Fase | Qué añade el genoma | Piezas de arte |
| --- | --- | --- |
| P0 | Nada | 0 |
| P1 | Solo ranuras de semilla, un único chasis | ~30 |
| P2 | Cambio de chasis por rama | ~15 |
| P3 | Recetas de las 9 formas II + variantes de rareza | ~35 |
| P4 | 18 recetas de etapa III + hábitats. Pie vs rueda: 1–2 posturas/chasis extra | ~20 |

### P0 — Arreglar el suelo (prerrequisito)

XP de cardio con techo, misma fórmula de racha para fuerza y cardio, y tope de XP por sesión de fuerza. Sin esto el árbol miente. Es trabajo en `useGamification` y el cierre de cardio, no ilustración.

### P1 — Turista vivo

Modelo: forma actual, genoma congelado, afinidades 8 semanas, chispas, inventario. Ritual de nacimiento con 3 candidatos y nombre. Widget del dashboard con el Turista. Ritual de nivel + ofrenda. Todavía sin horquilla: un solo chasis, toda la variedad viene de las ranuras de semilla.

**Pregunta que cierra P1:** “¿Alguien ha enseñado su Turista a otra persona?” Si el genoma no genera ese impulso con 30 piezas, no lo va a generar con 92.

### P2 — Primera horquilla

Nivel 5 → Forjador / Nómada / Todoterreno. Barras de afinidad visibles. Proyección desde nivel 3. Hábitat básico (2–3). El perfil muestra la Forma. Valida dos cosas: que la gente cambia su semana para empujar una rama, y que **el cambio de chasis se lee a 40 px**.

**Pregunta que cierra P2:** “¿Has hecho un cardio (o un gym) esta semana porque querías empujar a Todoterreno?” Si nadie responde que sí, era un adorno. Si alguien responde que sí, y además lo enseña en el perfil, esto diferencia fitAI.

### P3 — Especialización y tienda

Nivel 20 → las nueve formas II como recetas de genoma. Variantes de rareza enganchadas a datos reales. Catálogo corto de accesorios bloqueados por rama y por logro. Ánimo ligado a la zona de forma. Si P2 no movió comportamiento, no se dibuja P3.

### P4 — Definitiva y, solo entonces, packs

Nivel 50: horquilla binaria dentro de la forma II (18 recetas, no 9). Proyección desde el nivel 35. Pie vs rueda tiene que cambiar **postura o chasis** a 40 px, no solo paleta; si Titán y Gladiador no se distinguen en el widget, esta fase no cierra. Cosméticos de logros diamante. Packs de pago solo si hay gente enseñando la Forma en comunidad sin que se lo pidamos. Esta horquilla vive aquí: P0–P3 no se tocan. Si P2 no movió comportamiento, no se dibuja P4.

---

## Estado actual en código (contexto)

- Niveles: `calculateLevel` = `floor(xp / 1000) + 1`.
- XP de fuerza al cerrar un entreno: 100 base + 5 por serie completada + bonus de racha semanal (`(racha - 1) * 20` desde la 2.ª semana).
- El cardio **no** otorga XP hoy.
- Widget: `GamificationWidget` (nivel, barra de XP, racha).
- Logros incrementales de nivel: 5, 10, 20, 35, 50.
- Carga / forma: Banister (`TrainingLoadWidget`, `src/components/dashboard/training-load/` — `FormGauge`, `FormHero`, `formZones.ts`).
- Ranking muscular: `MuscleRankingWidget`.
- Rachas semanales: `computeStreakStats` en `src/lib/streakWeeks.ts`.

### Señales verificadas para el árbol ampliado

Todas existen ya en `src/integrations/supabase/types.ts`. Ninguna forma del árbol depende de datos que haya que inventar:

| Necesidad | Columna |
| --- | --- |
| Intensidad y cercanía al fallo | `serie.peso_kg`, `serie.repeticiones`, `serie.rir` |
| Densidad de sesión | `serie.descanso`, `serie.duracion_seg` |
| Duración y distancia de cardio | `cardio_bloque.duracion_seg`, `cardio_bloque.distancia_m` |
| Desnivel | `cardio_ruta.elevacion_positiva_m`, `cardio_bloque.elevacion_m`, `cardio_sesion_cycling.desnivel_positivo_m` |
| Tipo de cardio | `cardio_disciplina.codigo` vía `cardio_sesion.cardio_disciplina_id` |
| Superseries | `superset_id` en el ejercicio de la sesión |
| Frecuencia semanal | calendario / `actividad.fecha_inicio` (sesiones de fuerza por semana desde Evolución II) |
| Esfuerzo percibido | `cardio_sesion.rpe`, RPE de sesión de fuerza |
| Recuperación | `salud_diaria` (`sueno_min`, `calidad_sueno`, `fc_reposo`) |
| Hora del entreno | `actividad.fecha_fin` |

Lo único que falta es lo de P0: que el cardio otorgue XP.
