import express from "express";
import cors from "cors";
import multer from "multer";
import { config } from "./config.js";
import { generateImage, generateRaw, ollamaStatus, OllamaError } from "./ollama.js";
import { buildUserMessage, normalize, readInput, TONES, validate } from "./ofrenda.js";
import { buildAltarPrompt } from "./altar.js";
import { TRADITIONAL_ELEMENTS } from "./traditional.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json({ limit: "32kb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxPhotoBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

app.get("/health", async (_req, res) => {
  res.json({ ok: true, model: config.model, imageModel: config.imageModel, ollama: await ollamaStatus() });
});

app.post("/generate-ofrenda", upload.single("photo"), async (req, res) => {
  const input = readInput(req.body ?? {});
  if (!input) {
    res.status(400).json({ error: "Please enter at least the name of the person you want to remember." });
    return;
  }

  const photo = req.file;
  const started = Date.now();
  try {
    const raw = await generateRaw(buildUserMessage(input, !!photo), photo?.buffer.toString("base64"));

    const result = validate(raw);
    if (!result.ok) {
      res.status(422).json({ error: "The model returned data that does not match the schema.", details: result.errors });
      return;
    }

    const { ofrenda, warnings } = normalize(result.data, !!photo);
    res.json({
      ofrenda,
      traditional: TRADITIONAL_ELEMENTS,
      warnings,
      meta: {
        model: config.model,
        hadPhoto: !!photo,
        tone: input.tone,
        seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      },
    });
  } catch (err) {
    if (err instanceof OllamaError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/generate-altar-image", async (req, res) => {
  const body = (req.body ?? {}) as { tone?: unknown; items?: unknown };
  const tone = TONES.find((t) => t === body.tone) ?? "Tierno";
  const items = (Array.isArray(body.items) ? body.items : [])
    .filter((i): i is string => typeof i === "string")
    .map((i) => i.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 6);

  const started = Date.now();
  try {
    const image = await generateImage(buildAltarPrompt(items, tone));
    res.json({
      image: `data:image/png;base64,${image}`,
      meta: { model: config.imageModel, seconds: Number(((Date.now() - started) / 1000).toFixed(1)) },
    });
  } catch (err) {
    if (err instanceof OllamaError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Photo upload failed: ${err.message}` });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(config.port, () => {
  console.log(`API ready at http://localhost:${config.port} (text: ${config.model}, image: ${config.imageModel}, Ollama: ${config.ollamaUrl})`);
});
