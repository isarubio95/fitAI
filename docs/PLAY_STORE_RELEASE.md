# Track Gym - Publicacion en Google Play

## 1) Requisitos locales

- Android Studio instalado (incluye Gradle y herramientas de SDK).
- JDK configurado en `JAVA_HOME`.
- Cuenta de desarrollador en Google Play Console.

## 2) Preparar assets e integrar cambios web

Desde la raiz del proyecto:

```bash
npm run android:assets
npm run android:sync
```

## 3) Generar App Bundle (.aab)

**Importante:** usa `Build > Generate Signed Bundle / APK` con variante **release**.
No uses solo `Build > Build Bundle(s)` (genera un bundle **debug** y no sirve para Play).

Si falla `signDebugBundle` / `FinalizeBundleTask` con poca memoria, el proyecto ya aumenta heap en `android/gradle.properties` (`-Xmx6144m`). Tras cambiarlo: `File > Sync Project with Gradle Files` y reintenta.

Opcion A (Android Studio, recomendada):

1. `npm run android:open`
2. En Android Studio: `Build > Generate Signed Bundle / APK`
3. Seleccionar `Android App Bundle`.
4. Variante **release** y crear o seleccionar un keystore de firma.
5. El `.aab` queda en `android/app/build/outputs/bundle/release/app-release.aab`

Opcion B (CLI):

```bash
npm run android:bundle
```

Si falla con `JAVA_HOME is not set`, configura una ruta valida de JDK en Windows:

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\ruta\de\tu\jdk", "User")
```

Despues, abre una terminal nueva y vuelve a ejecutar el comando.

## 4) Identidad de la app

- `applicationId` / package: `com.trackgym.app`
- Deep link OAuth: `com.trackgym.app://auth-callback`
- En Supabase Auth → Redirect URLs, añade esa URL personalizada.

## 5) Subir a Play Console

1. Crea la app en Play Console.
2. Completa Store Listing (nombre, descripcion, icono, screenshots).
3. Completa `Data safety` y URL de politica de privacidad.
4. Sube el `.aab` en `Testing > Closed testing`.
5. Corrige avisos de pre-lanzamiento y luego promueve a produccion.

## 6) Buenas practicas

- Incrementar `versionCode` en cada release.
- Mantener `versionName` semantico (ej. `0.1.1`, `0.2.0`).
- Probar login, rutas principales y flujos con red lenta antes de publicar.

## 7) Health Connect (FC post-entreno)

La app lee **frecuencia cardiaca** desde Health Connect al guardar cardio live si no hubo sensor BLE.

En Play Console:

1. Declara el permiso / uso de datos de salud (Heart rate) en Data safety y, si aplica, en la seccion de Health Connect.
2. Usa la URL de politica de privacidad de la ficha (la app tambien incluye `public/privacypolicy.html` para el dialogo nativo de Health Connect).
3. En pruebas: conceder permiso en Ajustes de la app → «Conectar Health Connect»; el reloj debe sincronizar FC con Health Connect antes o justo despues del entreno.
