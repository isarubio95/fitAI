# Fase 2: Health Connect (Android) — FC post-entreno

Complemento al MVP de FC en vivo vía Bluetooth LE (`@capacitor-community/bluetooth-le`).
Health Connect no sustituye el streaming en vivo; cubre relojes (Samsung, Garmin, Pixel Watch, etc.) que **no** emiten el perfil GATT Heart Rate de forma usable durante la sesión.

## Objetivo

Al finalizar (o bajo demanda) una sesión de cardio, importar samples de FC del intervalo `[fecha_inicio, fecha_fin]` desde Health Connect y fusionarlos con lo grabado por BLE.

## Reglas de fusión

1. Si hay samples BLE en un instante, **ganan** frente a Health Connect.
2. Si solo hay Health Connect, rellenar `cardio_track_point.fc` (nearest) y recalcular `cardio_bloque.fc_media` / `fc_max` solo donde estaban null o tras confirmación del usuario.
3. Guardar procedencia en metadatos locales o `cardio_track.fuente` (p. ej. `ble+health-connect`) sin romper el schema actual.

## Alcance técnico

- Plugin Capacitor Health Connect (lectura de `HeartRateRecord` / exercise sessions).
- Permisos Android Health Connect + pantalla de consentimiento.
- UI: ajustes → “Importar FC del teléfono” y/o CTA al guardar el resumen live si no hubo BLE.
- Solo Android (coherente con Capacitor actual; sin iOS/HealthKit en esta fase).

## Fuera de alcance (siguen en roadmap futuro)

- HRV, sueño, pasos, calorías del fabricante como fuente primaria.
- Companion Wear OS.
- Fuerza con FC en vivo.
- iOS / HealthKit.
