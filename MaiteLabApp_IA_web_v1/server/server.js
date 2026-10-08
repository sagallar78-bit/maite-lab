import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';

const instructions = `
Eres MAITE LAB, investigador y editor educativo para estudiantes de aproximadamente 15 años.

OBJETIVO
Investiga el tema solicitado y conviértelo en un carrusel educativo para Instagram, entretenido pero rigurosamente factual.

INVESTIGACIÓN
- Usa web search antes de redactar.
- Prioriza fuentes primarias, universidades, organismos públicos, museos científicos y publicaciones académicas.
- Contrasta afirmaciones importantes cuando exista riesgo de error o exageración.
- No inventes hechos, cifras, nombres, fechas, estudios ni URLs.
- Si una afirmación popular es engañosa o simplifica demasiado el fenómeno, acláralo.
- Si existe incertidumbre científica o debate, dilo de forma sencilla.
- Las fuentes deben corresponder a páginas realmente consultadas durante la investigación.

ESTILO
- Español claro y natural.
- Adecuado para una persona de 15 años.
- Frases cortas y visuales.
- Evita lenguaje académico innecesario.
- El primer slide debe tener un gancho fuerte.
- Genera entre 5 y 7 slides.
- Máximo aproximado de 55 palabras por slide.
- El último slide debe dejar una idea o pregunta memorable.
- "Viral" nunca justifica exagerar.

FORMATO
Devuelve exclusivamente el objeto que cumpla el esquema solicitado.
`;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    wow: { type: "string" },
    cards: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          text: { type: "string" }
        },
        required: ["title", "text"]
      }
    },
    slides: {
      type: "array",
      minItems: 5,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          hook: { type: "string" },
          title: { type: "string" },
          text: { type: "string" }
        },
        required: ["hook", "title", "text"]
      }
    },
    sources: {
      type: "array",
      minItems: 1,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" }
        },
        required: ["title", "url"]
      }
    }
  },
  required: ["title", "subtitle", "wow", "cards", "slides", "sources"]
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "maite-lab-api", aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/generate", async (req, res) => {
  try {
    const topic = String(req.body?.topic || "").trim();

    if (!topic) {
      return res.status(400).json({ error: "Falta el tema." });
    }

    if (topic.length > 500) {
      return res.status(400).json({ error: "El tema es demasiado largo." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "Servidor sin OPENAI_API_KEY." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: MODEL,
      instructions,
      input: `Investiga y crea el contenido completo sobre este tema: ${topic}`,
      tools: [{ type: "web_search", search_context_size: "high" }],
      text: {
        format: {
          type: "json_schema",
          name: "maite_lab_carousel",
          strict: true,
          schema
        }
      }
    });

    if (!response.output_text) {
      throw new Error("La IA no devolvió contenido.");
    }

    const data = JSON.parse(response.output_text);

    // Normalización defensiva para que la app siempre reciba las estructuras esperadas.
    data.cards = Array.isArray(data.cards) ? data.cards : [];
    data.slides = Array.isArray(data.slides) ? data.slides.slice(0, 7) : [];
    data.sources = Array.isArray(data.sources) ? data.sources : [];

    return res.json(data);
  } catch (error) {
    console.error("MAITE LAB ERROR:", error);
    return res.status(500).json({
      error: "No pude generar el contenido. Revisa la configuración del servidor de IA."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Maite Lab API activa en puerto ${PORT}`);
});
