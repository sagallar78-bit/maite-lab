
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const instructions = `
Eres MAITE LAB, investigador y editor educativo para estudiantes
de aproximadamente 15 años.

Investiga el tema solicitado y conviértelo en un carrusel educativo
para Instagram, entretenido pero rigurosamente factual.

REGLAS
- Redacta utilizando conocimientos generales, sin búsqueda web. No inventes fuentes ni afirmes haber consultado Internet.
- Prioriza universidades, organismos públicos y fuentes científicas.
- No inventes datos, fechas, estudios ni URLs.
- Explica la incertidumbre cuando corresponda.
- Utiliza español claro, natural y entretenido.
- Genera entre 2 y 3 láminas.
- Cada lámina debe tener un máximo aproximado de 55 palabras.
- El primer slide debe tener un gancho atractivo.
- El último debe dejar una idea o pregunta memorable.
- Devuelve exclusivamente JSON válido.
`;

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    wow: { type: 'string' },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['title', 'text']
      }
    },
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hook: { type: 'string' },
          title: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['hook', 'title', 'text']
      }
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string' }
        },
        required: ['title', 'url']
      }
    }
  },
  required: ['title', 'subtitle', 'wow', 'cards', 'slides', 'sources']
};

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'maite-lab-api',
    provider: 'gemini',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const topic = String(req.body?.topic || '').trim();

    if (!topic) {
      return res.status(400).json({ error: 'Falta el tema.' });
    }

    if (topic.length > 500) {
      return res.status(400).json({
        error: 'El tema es demasiado largo.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Servidor sin GEMINI_API_KEY.'
      });
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(MODEL)}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: instructions }]
        },
        contents: [{
          role: 'user',
          parts: [{
            text:
              `Explica este tema: ${topic}. ` + 
              `Genera un carrusel educativo de 2 a 3 láminas. ` +
              `Devuelve JSON que cumpla este esquema: ` +
              JSON.stringify(schema)
          }]
        }],
        generationConfig: {
          temperature: 0.5
        }
      }),
      signal: AbortSignal.timeout(90000)
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error(
        'Error Gemini:',
        response.status,
        JSON.stringify(payload).slice(0, 500)
      );

      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429
          ? 'Se alcanzó el límite de uso de Gemini.'
          : 'No se pudo consultar Gemini. Revisa el modelo y la clave.'
      });
    }

    const candidate = payload.candidates?.[0];

    const rawText = candidate?.content?.parts
      ?.filter(part => typeof part.text === 'string')
      .map(part => part.text)
      .join('\n');

    if (!rawText) {
      throw new Error('Gemini no devolvió contenido.');
    }

    const cleanText = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    const data = JSON.parse(cleanText);

    if (!Array.isArray(data.slides)) {
      throw new Error('Respuesta sin láminas.');
    }

    data.cards = Array.isArray(data.cards)
      ? data.cards.slice(0, 4)
      : [];

    data.slides = data.slides.slice(0, 7);

    // Sin búsqueda web, no se incluyen fuentes verificadas en tiempo real.
    const chunks =
      candidate?.groundingMetadata?.groundingChunks || [];

    const sources = chunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({
        title: chunk.web.title || 'Fuente consultada',
        url: chunk.web.uri
      }));

    data.sources = Array.from(
      new Map(sources.map(source => [source.url, source])).values()
    ).slice(0, 12);

    return res.json(data);

  } catch (error) {
    console.error('MAITE LAB ERROR:', error);

    return res.status(500).json({
      error: 'No pude generar el contenido. Revisa el servidor.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Maite Lab Gemini activo en puerto ${PORT}`);
});
