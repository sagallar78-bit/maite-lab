# MAITE LAB — APP MÓVIL + IA + INVESTIGACIÓN WEB

Esta versión deja preparada la arquitectura real:

**Celular → API Maite Lab → OpenAI Responses API + web search → carrusel → celular**

## Qué ya está implementado

- App Android/iPhone con Expo + React Native.
- Campo para introducir cualquier tema.
- Backend separado de la app.
- OpenAI Responses API.
- Investigación web mediante `web_search`.
- Salida estructurada mediante JSON Schema.
- Instrucciones editoriales de Maite Lab.
- 5–7 slides.
- Fuentes.
- Guardado de cada slide en Fotos.
- Compartir mediante el menú del teléfono.
- Endpoint `/health` para comprobar el servidor.

## Seguridad

La `OPENAI_API_KEY` **no debe estar dentro de la app móvil**.
Debe configurarse como secreto/variable de entorno en el servidor.

## Lo que falta para ponerla en marcha

1. Crear/usar una cuenta de OpenAI API con facturación habilitada.
2. Crear un servicio web para alojar la carpeta `server`.
3. Configurar en ese servicio:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-6-luna`
4. Obtener la URL HTTPS pública del servidor.
5. Reemplazar en `app.json`:
   `https://REEMPLAZAR-CON-LA-URL-DE-TU-API`
6. Generar el APK con Expo EAS.

## Prueba del servidor

Una vez publicado, abrir:

`https://TU-DOMINIO/health`

Debe responder algo similar a:

`{"ok":true,"service":"maite-lab-api","aiConfigured":true}`

## Importante

El ZIP no contiene ninguna API key real.
El APK todavía no está generado en esta entrega.


## Compilación sin Node.js local
Consulta `GUIA_GITHUB_SIN_NODE.md`. El workflow `.github/workflows/build-android.yml` ejecuta Node/EAS en GitHub Actions y genera el APK en Expo EAS.
