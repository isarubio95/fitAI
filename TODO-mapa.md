# Mejoras de mapa (cardio)

Notas sobre el estado actual: hay 3 UIs MapLibre (`CardioRouteMap`, `RouteDrawMap`, `LiveCardioMap`), basemap compartido Mapa/Satélite/Híbrido (`mapBasemap.ts` + `MapBasemapControl`), orientación heading/north en live, y capas de ruta GeoJSON propias por componente.

---

## Alta prioridad

- [x] **Híbrido satélite + etiquetas**
  - **Qué:** tercer modo que muestra imagen aérea **y** nombres de calles, barrios y pueblos encima.
  - **Hecho:** `MapBasemapId = "hybrid"`; Esri World Imagery + labels/carreteras OpenMapTiles (OpenFreeMap); opción “Híbrido” en el menú de capas; attribution Esri + OSM; fallback a satélite puro si falla el fetch vectorial.

- [ ] **Unificar “Mi ubicación” en dibujo / detalle**
  - **Qué:** el mismo control de centrar en GPS que ya existe en live (y parcialmente en `RouteDrawMap`) también en vistas de detalle interactivas donde tenga sentido.
  - **Por qué:** el usuario espera el mismo gesto en todos los mapas “grandes”; hoy el comportamiento está repartido.
  - **Cómo:** reutilizar el patrón de `Locate` / `LocateFixed`, pedir permiso solo al tocar, y no pelear con `fitBounds` de la ruta (p. ej. un toque centra, otro vuelve al encuadre de la ruta).

- [ ] **Persistir zoom / encuadre por contexto**
  - **Qué:** recordar centro, zoom (y bearing si aplica) al cerrar/reabrir una ruta concreta, o al pausar/retomar una grabación.
  - **Por qué:** hoy muchos mapas arrancan en Madrid (`DEFAULT_CENTER`) o recalculan fit siempre; se pierde el encuadre que el usuario había ajustado a mano.
  - **Cómo:** clave en `localStorage` (o estado de sesión) por `routeId` / pantalla (`live` | `draw` | `detail`). Restaurar solo si hay preferencia válida; si no, fallback a `fitBounds` de la polilínea.
  - **Cuidado:** no persistir encuadres absurdos (zoom 2 del mundo entero) ni mezclar preferencias entre usuarios en el mismo dispositivo si hay multi-cuenta.

- [ ] **Feedback al cambiar de basemap**
  - **Qué:** transición visible al pulsar Mapa ↔ Satélite: overlay semitransparente, spinner o fade del canvas mientras `setStyle` carga tiles.
  - **Por qué:** `map.setStyle()` vacía capas un momento; se ve un flash / mapa en blanco aunque luego se reinyecten las GeoJSON.
  - **Cómo:** flag `basemapSwitching` en los 3 mapas; mostrar UI encima del canvas hasta `style.load` + primer `idle` (con timeout de seguridad, como el skeleton de `CardioRouteMap`).
  - **Bonus:** no permitir otro cambio de basemap hasta terminar el actual.

---

## Media prioridad

- [ ] **Capas de utilidad: heatmap / rutas populares**
  - **Qué:** capa opcional que pinta densidad de recorridos propios (heatmap) o corredores frecuentes de la comunidad.
  - **Por qué:** ayuda a elegir dónde entrenar y da sensación de “app de running” madura (patrón Strava).
  - **Cómo:** agregar source GeoJSON o tiles agregados; toggle en el menú de capas junto a Mapa/Satélite/Híbrido. Empezar solo con **historial del usuario** (menos privacidad/legal).
  - **Requisitos:** datos agregados (no tracks crudos públicos sin consentimiento); límite de puntos / downsample para no matar el mapa.

- [ ] **Elevación / perfil junto al mapa**
  - **Qué:** gráfico de altitud del recorrido; al tocar un punto del perfil se destaca en el mapa (y viceversa).
  - **Por qué:** en trail/bici la elevación importa tanto como la distancia; el mapa 2D solo no la cuenta.
  - **Cómo:** si el track ya trae `altitude`, usarla; si no, enriquecer offline/API de elevación al guardar. UI tipo scrubber bajo el mapa en detalle y post-actividad.
  - **Cuidado:** GPS altitude es ruidosa; conviene suavizar.

- [ ] **Agrupar controles en móvil**
  - **Qué:** un cluster de botones (Layers, brújula/orientación, localize) en una sola columna o menú expandible, alineado con `controlsBottomPx`.
  - **Por qué:** en live ya hay Layers + CameraControl; en draw hay 4–5 botones; en pantallas bajas pisan métricas, hints y attribution.
  - **Cómo:** componente `MapControlsStack` compartido; en portrait colapsar secundarios tras un FAB “herramientas”. Respetar `touch-styled` y el hit area ≥ 40px.

- [ ] **Modo “seguir ruta” en live (ruta objetivo)**
  - **Qué:** con `referencePoints` activos, mostrar desvío lateral (m), distancia al siguiente waypoint / meta, y quizá una flecha de corrección de rumbo.
  - **Por qué:** la polilínea fantasma ya existe, pero no guía activamente; el valor está en no salirse del recorrido planeado.
  - **Cómo:** proyectar la posición GPS sobre la polilínea de referencia; umbral de “off-route”; UI discreta (chip o dial) que no tape el mapa.
  - **Cuidado:** no spamear vibración/alertas; configurable.

---

## Calidad / DX

- [ ] **Extraer `BaseMap` compartido**
  - **Qué:** un componente/hook que centralice: worker MapLibre, CSS attribution, carga de basemap, `ResizeObserver`, cambio de estilo + reinyección de capas, y el `MapBasemapControl`.
  - **Por qué:** hoy `CardioRouteMap`, `RouteDrawMap` y `LiveCardioMap` duplican ~el mismo bootstrap; cada feature de basemap se toca en 3 sitios.
  - **Cómo:** API tipo `useCardioMap({ onStyleReady })` o `<CardioBaseMap onLoad={map => ...} />` donde cada UI solo registra sus sources/layers y markers.
  - **Criterio de éxito:** cambiar basemap o attribution una sola vez.

- [ ] **Offline / caché de tiles en zona habitual**
  - **Qué:** precargar o cachear tiles del área donde el usuario suele entrenar, para que live/draw no dependan de red perfecta.
  - **Por qué:** en montaña o con datos móviles malos el mapa en blanco rompe la grabación.
  - **Cómo:** Service Worker (PWA) o capa nativa (Capacitor) con bounding box + zoom range; respetar términos de Esri/OpenFreeMap (límites de almacenamiento y uso).
  - **Cuidado:** tamaño en disco; invalidación de caché; satélite pesa más que vector.

- [ ] **Accesibilidad**
  - **Qué:** labels/`aria-*` consistentes, foco de teclado en el menú de capas, contraste legible del menú **sobre satélite claro**, y textos de botón que no dependan solo del icono.
  - **Por qué:** el menú oscuro sobre imagen brillante puede fallar contraste; el mapa interactivo suele quedar fuera de flujos de teclado/lector de pantalla.
  - **Cómo:** revisar `MapBasemapControl` y controles live/draw; `prefers-reduced-motion` en fades; no atrapar gestos del drawer (ya hay `data-vaul-no-drag`).

---

## Siguiente recomendada

- [ ] **Feedback al cambiar de basemap** — evita el flash vacío al hacer `setStyle` entre Mapa / Satélite / Híbrido.
