# Configuración final de Maite Lab

## A. OpenAI
Crear una API key desde el panel de la API y guardarla únicamente como secreto del servidor.

## B. Servidor
Publicar la carpeta `server/` como servicio Node.js.
Comando de inicio:

`npm start`

Variables:
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-6-luna`
- `PORT` (si el proveedor lo asigna automáticamente, usar su variable/puerto)

## C. App
Cuando el servidor tenga una URL HTTPS, ponerla en:

`app.json` → `expo.extra.apiBaseUrl`

Ejemplo:

`https://maite-lab-api.example.com`

## D. APK
Con Expo/EAS se puede compilar el APK sin instalar Node.js localmente, una vez que el proyecto esté disponible para EAS.

## E. Prueba
En el teléfono:
1. Escribir un tema.
2. Pulsar “CREAR MI CONTENIDO”.
3. Esperar la investigación.
4. Revisar las fuentes.
5. Guardar o compartir las láminas.
