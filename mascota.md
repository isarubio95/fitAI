# La Forma: compañero de entrenamiento

Propuesta de producto. El compañero no es un segundo juego ni un Tamagotchi pegado al dashboard: es la identidad visual de cómo entrenas. Dos personas en el nivel 20 no deberían verse iguales si una vive en el rack y la otra en la carretera.

Nombre de trabajo: **Forma**. Ya es el vocabulario de la app (“tu forma hoy”). El usuario le pone nombre propio en el onboarding; Forma es la especie. Alternativas: Compañero (claro, genérico) o Eco (poético, menos obvio).

---

## Por qué ahora

Ya existen las tres capas que otras apps de deporte suelen tener sueltas:

- Nivel, XP y racha semanal (`useGamification`, widget del dashboard).
- Logros por hitos (niveles 5, 20, 50, entre otros).
- Carga de entrenamiento y “tu forma hoy” (Banister).

Falta el objeto emocional que una esas tres cosas: un cuerpo que crece con el diario.

Hevy y Strong son el cuaderno. Strava es el feed. Fitbit son insignias. Duolingo es culpa por racha. Nadie convierte el estilo de entrenamiento en un personaje que se puede enseñar en el perfil. Ese es el hueco.

---

## Tres reglas

1. **Un compañero, no una colección.** El mismo ser cambia de silueta. Coleccionar mascotas diluye el apego y dispara el arte.
2. **El nivel abre puertas; el entreno elige la puerta.** Subir de nivel no te hace “más fuerte” en abstracto. Te deja evolucionar. El mix de sesiones decide hacia dónde.
3. **Nunca se muere.** Si dejas de entrenar, se duerme. Castigar con hambre o muerte genera abandono, no constancia. La racha ya cubre la presión sana.

Tres palancas, no una:

| Palanca | Qué controla |
| --- | --- |
| Nivel | Capacidad: evoluciones, huecos de tienda, rareza |
| Afinidad | Dirección: fuerza, resistencia o equilibrio |
| Forma (Banister) | Estado: fresca, productiva o cargada |

---

## El bucle

Cada sesión cerrada hace tres cosas, no una: suma XP (nivel), deposita afinidad (rama) y actualiza el ánimo del compañero con la zona de forma.

El ritual de subir de nivel es el único momento en el que la tienda aparece de forma insistente: chispas, ofrenda y, si toca, evolución.

| Momento | Qué gana el usuario | Qué gana el compañero |
| --- | --- | --- |
| Cierra un entreno de fuerza | XP + racha + logros | Afinidad fuerza, posible rasgo muscular |
| Cierra un cardio | XP (hoy no existe: hay que crearlo) | Afinidad resistencia + disciplina |
| Semana con los dos | Bonus de equilibrio | Empuja hacia Nexo / Prisma |
| Forma en zona productiva | Nada extra de XP | Ánimo “afilado”; calidad para Prisma |
| Sobreentrenamiento | La carga ya lo avisa | Se ve pesado. No se le viste de fiesta |
| Sube de nivel | Chispas + ofrenda | Si es 5 / 20 / 50, evolución |

---

## Árbol de evolución

Un compañero, tres caminos, dos evoluciones. Cuatro sprites de etapa × tres ramas es inabordable al principio, así que el árbol es corto:

- Nacimiento (nivel 1).
- Horquilla en el **nivel 5** (logro Ascenso).
- Especialización en el **nivel 20** (logro Élite).
- El **nivel 50** no cambia de especie: desbloquea la silueta definitiva de la rama ya elegida.

```
                    Chispa
           /           |           \
       Forja         Nexo        Zancada
      /     \          |         /      \
  Yunque  Coloso    Prisma   Marea    Ritmo
```

| Forma | Etapa | Nivel | Rama | Cómo se alcanza | Aspecto |
| --- | --- | --- | --- | --- | --- |
| Chispa | Nacimiento | 1 | Común | Todos empiezan aquí | Pequeña y neutra. Cambia de color con la racha, no con el deporte |
| Forja | Evolución I | 5 | Fuerza | Afinidad de fuerza ≥ 58 % en las últimas 8 semanas | Compacta, hombros marcados. Cinturón, tiza |
| Zancada | Evolución I | 5 | Resistencia | Afinidad de resistencia ≥ 58 % | Más ligera y alargada. Zapatillas, dorsal |
| Nexo | Evolución I | 5 | Equilibrio | Ninguna afinidad supera el 58 %. Vía híbrida, no consuelo: exige fuerza y cardio de verdad | Silueta intermedia. Puede llevar rasgos de ambos |
| Yunque | Evolución II | 20 | Fuerza / potencia | Desde Forja. Volumen pesado y series cerca del fallo, no series basura | Bloque denso. Hábitat de gimnasio |
| Coloso | Evolución II | 20 | Fuerza / hipertrofia | Desde Forja. Variedad muscular y volumen repartido | Más llena; rasgos por grupo dominante (pecho, espalda, pierna) |
| Marea | Evolución II | 20 | Resistencia / fondo | Desde Zancada. Distancia y duración, no picos. Sesiones > 45 min | Línea continua. Hábitat de trail o carretera |
| Ritmo | Evolución II | 20 | Resistencia / velocidad | Desde Zancada. Intervalos, desnivel, ritmo. Calidad > kilometraje vacío | Más angular. Hábitat de pista |
| Prisma | Evolución II | 20 | Equilibrio / atleta | Desde Nexo. Semanas con fuerza y cardio, y carga en zona productiva | La forma más rara. Debe sentirse especial, no “la que no se decidió” |

### Cadencia con el XP actual

Fórmula actual: 1000 XP por nivel, ~200–250 XP por sesión de fuerza. Cálculo a 220 XP de media:

| Hito | Sesiones de fuerza aprox. | Tiempo a 3–4 días/semana |
| --- | --- | --- |
| Nivel 5 (Evolución I) | 18 | 5–6 semanas |
| Nivel 20 (Evolución II) | 86 | ~6 meses |
| Nivel 50 (definitiva) | 223 | ~1,5 años |

Si el cardio empieza a dar XP, estos tiempos se acortan: hay que topar la XP por sesión para no inflar niveles.

---

## Afinidad

La afinidad es el volante, no un contador oculto. Si la barra es secreta, la evolución se siente aleatoria y se rompe la confianza.

- Ventana: **últimas 8 semanas**, no la vida entera, para que un mes de trail pueda mover a un powerlifter y al revés.
- El usuario ve la proyección desde el **nivel 3**.

### Cómo se deposita (datos que ya existen)

| Señal | Tabla / sistema actual | Qué suma | Tope |
| --- | --- | --- | --- |
| Sesión de fuerza cerrada | `actividad` + serie completada | Fuerza | Por sesión, no por serie infinita. Evita 40 series basura |
| Sesión de cardio cerrada | `cardio_sesion` + `cardio_bloque` | Resistencia | Por duración o distancia, con techo. El easy run cuenta menos que un intervalo |
| Misma semana con ambos | Racha semanal + calendario | Empuje a equilibrio | Un cardio de 8 min no vale. Umbral mínimo de sesión seria |
| Grupo muscular dominante | Ranking muscular / heatmap | Rasgo visual, no rama | No castiga músculos olvidados. Propone un reto, no una deformidad |
| Zona de forma | Banister / FormScale | Calidad (ánimo + Prisma) | Sobreentrenar no acelera la evolución: la ralentiza |
| Logro de hito | `logro` / `usuario_logro` | Cosmético exclusivo | Nunca cambia la rama. Solo el armario |

### Fórmula de horquilla (niveles 5 y 20)

Sea F y R la afinidad normalizada de 8 semanas:

- Si `F / (F+R) ≥ 0,58` → Forja.
- Si `R / (F+R) ≥ 0,58` → Zancada.
- En cualquier otro caso → Nexo.

Frase de proyección, ejemplo: “vas a Forja; 3 cardios esta semana te acercan a Nexo”. Agencia, no sorpresa.

### Arquetipos (proyección)

| Estilo | Fuerza | Resistencia | Camino | Nota |
| --- | --- | --- | --- | --- |
| Fuerza pesada | 82 | 8 | Chispa → Forja → Yunque | 4 días de gym, casi sin cardio. Nexo y Prisma quedan cerrados |
| Hipertrofia | 74 | 14 | Chispa → Forja → Coloso | PPL con variedad. El ranking de músculos decide el rasgo visual |
| Fondo | 12 | 80 | Chispa → Zancada → Marea | Hoy el cardio no da XP: esta vía no existe de verdad hasta igualar la fórmula |
| Ritmo | 18 | 70 | Chispa → Zancada → Ritmo | Intervalos, desnivel, sesiones cortas e intensas |
| Híbrido | 46 | 44 | Chispa → Nexo → Prisma | La vía que diferencia fitAI: los dos deportes y zona de forma productiva |
| Inconstante | 40 | 20 | Sigue en Chispa más tiempo | No se le mata: se duerme. El nivel llega; la evolución I se retrasa si la ventana de 8 semanas es floja |

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

**Qué no se compra:** racha, nivel, afinidad, ni “comida” para que no se duerma. El inventario sobrevive a las evoluciones: el cinturón de Forja se reinterpreta en Yunque. Si un objeto no pega en la nueva silueta, se guarda en el armario, no se borra.

**Dinero real, si algún día:** solo packs cosméticos. Nunca chispas, nunca XP, nunca saltar una evolución. En v1 ni siquiera eso: primero que la gente quiera enseñar la Forma.

---

## Dónde vive en la app

| Superficie | Qué se ve |
| --- | --- |
| Widget de gamificación (dashboard) | Sustituir la barra seca por la Forma + nivel + racha. Un tap abre ficha |
| Ficha de la Forma (drawer) | Barras de afinidad, proyección, hábitat, armario, ánimo según carga |
| Toast de nivel (ya existe el de logros) | Misma familia visual: subida, ofrenda, botón “ver tienda” |
| Perfil y comunidad | La Forma al lado del avatar. Es el screenshot que se comparte |
| Tú → Progreso | No hace falta una cuarta tab. La ficha es un overlay, no otra sección |

---

## Riesgos

El potencial es alto precisamente porque el fracaso es fácil.

- **Tamagotchi de culpa.** Si hay que “alimentar” al compañero o se pone triste a las 48 h, la app pasa de entrenador a acoso. La racha semanal ya es el palo. El compañero es la zanahoria.
- **Premiar basura.** 5 XP por serie, sin tope, empuja a inflar el diario. La afinidad de fuerza tiene que caparse por sesión y mirar series completadas con sentido (RIR, rutina prevista), no el recuento bruto.
- **Cardio como ciudadano de segunda.** Hoy solo el logger de fuerza da XP. Zancada y Marea serían un cartel falso. Igualar cardio (con techo por duración) es un prerrequisito, no una fase 3.
- **Arte que no se puede mantener.** Diez siluetas × cuatro hábitats × veinte accesorios es un estudio de animación. Una base, tres ramas, overlays de accesorios. Si no cabe en ilustración 2D simple, no cabe en el roadmap.
- **Cuerpo como burla.** Usar el ranking de músculos menos entrenados para deformar al compañero es un chiste que se vuelve *body shaming*. Los músculos olvidados desbloquean un reto de logro, no una joroba.
- **Peleas entre mascotas.** Un PvP de Formas es otro producto. Rompe el tono serio de carga, RIR y planes. El social es enseñar, no combatir.

Criterio para aceptar una feature: si no cambia cómo entrenas esta semana, o no cambia cómo se te ve en comunidad, no entra. Un minijuego de acariciar al compañero no pasa. Un hábitat de pista que solo sale si haces intervalos, sí.

---

## Hoja de ruta

Construir al revés de lo vistoso. El error clásico es encargar el arte de Prisma antes de saber si alguien mira el widget. Cada fase tiene una pregunta de producto; si la respuesta es no, se para.

### P0 — Arreglar el suelo (prerrequisito)

XP de cardio con techo, misma fórmula de racha para fuerza y cardio, y tope de XP por sesión de fuerza. Sin esto el árbol miente. Es trabajo en `useGamification` y el cierre de cardio, no ilustración.

### P1 — Chispa viva

Modelo: forma actual, afinidades 8 semanas, chispas, inventario. Widget del dashboard con la Chispa. Ritual de nivel + ofrenda. Todavía sin horquilla. Se valida apego con un solo sprite.

### P2 — Primera horquilla

Nivel 5 → Forja / Zancada / Nexo. Barras de afinidad visibles. Proyección desde nivel 3. Hábitat básico (2–3). El perfil muestra la Forma. Aquí se ve si la gente cambia su semana para empujar una rama.

**Pregunta que cierra P2:** “¿Has hecho un cardio (o un gym) esta semana porque querías empujar a Nexo?” Si nadie responde que sí, era un adorno. Si alguien responde que sí, y además lo enseña en el perfil, esto diferencia fitAI.

### P3 — Especialización y tienda

Nivel 20 → cinco formas II. Catálogo corto de accesorios bloqueados por rama y por logro. Ánimo ligado a FormScale. Si P2 no movió comportamiento, no se dibuja P3.

### P4 — Definitiva y, solo entonces, packs

Nivel 50 como silueta final de rama. Cosméticos de logros diamante. Packs de pago solo si hay gente enseñando la Forma en comunidad sin que se lo pidamos.

---

## Estado actual en código (contexto)

- Niveles: `calculateLevel` = `floor(xp / 1000) + 1`.
- XP de fuerza al cerrar un entreno: 100 base + 5 por serie completada + bonus de racha semanal (`(racha - 1) * 20` desde la 2.ª semana).
- El cardio **no** otorga XP hoy.
- Widget: `GamificationWidget` (nivel, barra de XP, racha).
- Logros incrementales de nivel: 5, 10, 20, 35, 50.
- Carga / forma: Banister (`TrainingLoadWidget`, `FormScale`).
- Ranking muscular: `MuscleRankingWidget`.
