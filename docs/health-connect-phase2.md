# Fase 2: Health Connect (Android) — FC post-entreno

Complemento al MVP de FC en vivo vía Bluetooth LE (`@capacitor-community/bluetooth-le`).
Health Connect no sustituye el streaming en vivo; cubre relojes (Samsung, Garmin, Pixel Watch, etc.) que **no** emiten el perfil GATT Heart Rate de forma usable durante la sesión.

## Modelo de producto (implementado)

1. **Setup una vez:** en Ajustes → «Salud / Frecuencia cardíaca», el usuario concede lectura de FC en Health Connect y sigue la guía por marcas (Samsung, Pixel/Wear OS, Garmin, otras).
2. **Puente obligatorio:** reloj → app del fabricante → Health Connect → FitAI. El permiso en FitAI no basta si la app del reloj no escribe FC en el hub.
3. **Por entreno:** al guardar cardio live o finalizar fuerza, si no hay samples BLE, Track Gym lee `heartRate` del intervalo y rellena `fc` / `fc_media` / `fc_max` (cardio: track + bloque; fuerza: `actividad` + `actividad_fc_sample`).
4. Prefetch en background al entrar en el resumen de cardio (da margen a la sync del reloj); al guardar se relee.
5. Si BLE ya aportó FC, **no** se consulta Health Connect.
6. Si HC no tiene datos aún: el guardado continúa sin FC y un toast lo explica (cardio). En fuerza los fallos de HC se silencian para no bloquear el fin del entreno.

Las apps del fabricante no se enlazan con Track Gym: escriben en Health Connect; Track Gym solo lee el hub.

## Guía en Ajustes (UI)

[`HealthConnectHrSettings`](../src/components/layout/HealthConnectHrSettings.tsx) muestra:

1. Estado + CTA (conectar / abrir / gestionar permisos Health Connect).
2. Pasos comunes: permiso FitAI → sync en la app del reloj → forzar sync antes de guardar → import al finalizar sin BLE.
3. Aviso: midiendo en el reloj ≠ datos en FitAI hasta que estén en Health Connect.
4. Acordeón por marca:
   - **Samsung / Galaxy Watch:** Samsung Health → Ajustes → Health Connect (incl. FC); abrir Samsung Health tras el entreno para forzar sync.
   - **Pixel Watch / Wear OS:** Fit o app del reloj → Health Connect.
   - **Garmin:** Garmin Connect → Health Connect si está disponible; si no, BLE.
   - **Otras (Polar, etc.):** preferir BLE en vivo; HC solo si su app escribe en el hub.

No hay deep links a pantallas internas de fabricantes (varían por versión); solo se abre Health Connect con la API de Capgo.

## Reglas de fusión

1. Si hay samples BLE en un instante, **ganan** frente a Health Connect (`mergeHeartRateSamples`, ventana 15 s).
2. Si solo hay Health Connect, rellenar `cardio_track_point.fc` (nearest) y `cardio_bloque.fc_media` / `fc_max`.
3. Procedencia: `cardio_track.fuente` pasa a incluir `+health-connect` (p. ej. `gps-web+health-connect`) sin migración de schema.

## Alcance técnico

- Plugin: `@capgo/capacitor-health` (solo Android en esta fase; HealthKit ignorado).
- Wrappers: [`src/lib/healthConnectHr.ts`](../src/lib/healthConnectHr.ts).
- UI Ajustes: [`HealthConnectHrSettings`](../src/components/layout/HealthConnectHrSettings.tsx).
- Guardado live: [`CardioLiveRecorder`](../src/components/cardio/CardioLiveRecorder.tsx).
- Fuerza: [`persistActividadHeartRate`](../src/lib/persistActividadHeartRate.ts) desde el logger activo.
- Permisos Manifest + `privacypolicy.html` para el diálogo de Health Connect.
- Solo Android.

## Fuera de alcance (roadmap futuro)

- Reimportar FC sobre sesiones ya guardadas / reintento post-sync.
- Cardio manual (`CardioLogger`).
- SDK directo Samsung Health / partnership.
- HRV, sueño, pasos, calorías del fabricante como fuente primaria.
- Companion Wear OS.
- iOS / HealthKit.

## Fuerza (implementado)

Al finalizar un entrenamiento de fuerza activo, Track Gym también fusiona BLE + Health Connect
en la ventana `[fecha, fecha_fin]` y persiste `actividad.fc_media` / `fc_max` + `actividad_fc_sample`.
El panel BLE aparece en el logger cuando hay Bluetooth disponible (Android).
