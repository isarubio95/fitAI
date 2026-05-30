# FitAI - Publicacion en Google Play

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

Opcion A (Android Studio, recomendada):

1. `npm run android:open`
2. En Android Studio: `Build > Generate Signed Bundle / APK`
3. Seleccionar `Android App Bundle`.
4. Usar (o crear) un keystore de firma.

Opcion B (CLI):

```bash
npm run android:bundle
```

Si falla con `JAVA_HOME is not set`, configura una ruta valida de JDK en Windows:

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\ruta\de\tu\jdk", "User")
```

Despues, abre una terminal nueva y vuelve a ejecutar el comando.

## 4) Subir a Play Console

1. Crea la app en Play Console.
2. Completa Store Listing (nombre, descripcion, icono, screenshots).
3. Completa `Data safety` y URL de politica de privacidad.
4. Sube el `.aab` en `Testing > Closed testing`.
5. Corrige avisos de pre-lanzamiento y luego promueve a produccion.

## 5) Buenas practicas

- Incrementar `versionCode` en cada release.
- Mantener `versionName` semantico (ej. `0.1.1`, `0.2.0`).
- Probar login, rutas principales y flujos con red lenta antes de publicar.
