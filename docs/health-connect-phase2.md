# Fase 2: Health Connect (Android) — FC post-entreno

Complemento al MVP de FC en vivo vía Bluetooth LE (`@capacitor-community/bluetooth-le`).
Health Connect no sustituye el streaming en vivo; cubre relojes (Samsung, Garmin, Pixel Watch, etc.) que **no** emiten el perfil GATT Heart Rate de forma usable durante la sesión.

## Modelo de producto (implementado)

1. **Setup una vez:** en Ajustes → «Salud / Frecuencia cardíaca», el usuario concede lectura de FC en Health Connect.
2. **Por entreno:** al guardar cardio live, si no hay samples BLE, Track Gym lee `heartRate` del intervalo `[fecha_inicio, fecha_fin]` y rellena `fc` / `fc_media` / `fc_max`.
3. Prefetch en background al entrar en el resumen (da margen a la sync del reloj); al guardar se relee.
4. Si BLE ya aportó FC, **no** se consulta Health Connect.
5. Si HC no tiene datos aún: el guardado continúa sin FC y un toast lo explica.

Las apps del fabricante no se enlazan con Track Gym: escriben en Health Connect; Track Gym solo lee el hub.

## Reglas de fusión

1. Si hay samples BLE en un instante, **ganan** frente a Health Connect (`mergeHeartRateSamples`, ventana 15 s).
2. Si solo hay Health Connect, rellenar `cardio_track_point.fc` (nearest) y `cardio_bloque.fc_media` / `fc_max`.
3. Procedencia: `cardio_track.fuente` pasa a incluir `+health-connect` (p. ej. `gps-web+health-connect`) sin migración de schema.

## Alcance técnico

- Plugin: `@capgo/capacitor-health` (solo Android en esta fase; HealthKit ignorado).
- Wrappers: [`src/lib/healthConnectHr.ts`](../src/lib/healthConnectHr.ts).
- UI Ajustes: [`HealthConnectHrSettings`](../src/components/layout/HealthConnectHrSettings.tsx).
- Guardado live: [`CardioLiveRecorder`](../src/components/cardio/CardioLiveRecorder.tsx).
- Permisos Manifest + `privacypolicy.html` para el diálogo de Health Connect.
- Solo Android.

## Fuera de alcance (roadmap futuro)

- Reimportar FC sobre sesiones ya guardadas.
- Cardio manual (`CardioLogger`).
- HRV, sueño, pasos, calorías del fabricante como fuente primaria.
- Companion Wear OS.
- Fuerza con FC en vivo.
- iOS / HealthKit.
