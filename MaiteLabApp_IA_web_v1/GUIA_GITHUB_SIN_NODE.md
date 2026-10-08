# MAITE LAB — instalación sin Node.js en el PC

Este paquete está preparado para que la compilación se ejecute en GitHub Actions + Expo EAS.
No necesitas instalar Node.js, Android Studio ni el SDK de Android en tu PC.

## Qué hace el flujo

1. Subes esta carpeta a un repositorio privado de GitHub.
2. Creas dos secretos del repositorio:
   - `EXPO_TOKEN`: token de acceso de Expo.
   - `EXPO_ACCOUNT`: nombre de usuario/organización de Expo.
3. GitHub Actions ejecuta Node.js en sus propios servidores (no en tu PC).
4. El workflow vincula el proyecto con EAS y genera un APK mediante el perfil `preview`.
5. El APK queda disponible en el panel de Expo para descargar e instalar en Android.

## Importante

La documentación actual de Expo indica que EAS Workflows/GitHub requiere que el proyecto esté configurado para EAS. Este workflow automatiza la inicialización (`eas init`) en el runner de GitHub antes de construir, usando tu token de Expo.

## Crear EXPO_TOKEN

En Expo:
1. Abre Account Settings.
2. Busca Access Tokens.
3. Crea un token personal.
4. Copia el token una sola vez y guárdalo temporalmente.
5. En GitHub, Repository > Settings > Secrets and variables > Actions, crea `EXPO_TOKEN`.

## EXPO_ACCOUNT

Es el nombre de usuario de tu cuenta Expo, sin `@`.

## Backend IA

El APK incluido en este paquete todavía tiene en `app.json`:
`https://REEMPLAZAR-CON-LA-URL-DE-TU-API`

Eso significa que podemos probar primero la instalación del APK, pero para que Maite pueda generar contenido con IA debemos desplegar también la carpeta `server/` y poner su URL HTTPS real en `app.json`.

La clave de OpenAI nunca debe ponerse dentro de la app móvil; debe permanecer como secreto del backend.

## Perfil APK

El perfil `preview` usa:
- `distribution: internal`
- `android.buildType: apk`
- imagen EAS `latest`

Esto está pensado para instalar directamente el APK en un dispositivo Android.
