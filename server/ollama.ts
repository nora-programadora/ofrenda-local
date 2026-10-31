import { config, schema, systemPrompt } from "./config.js";

export class OllamaError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

async function post(path: string, body: unknown, timeoutMs: number): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${config.ollamaUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(body),
    });
  } catch (err) {
    if ((err as Error).name === "TimeoutError") {
      throw new OllamaError("The model took too long to respond.", 504);
    }
    throw new OllamaError(`Could not connect to Ollama at ${config.ollamaUrl}. Is it running?`);
  }
  if (!res.ok) throw new OllamaError(`Ollama responded ${res.status}: ${await res.text()}`);
  return res;
}

/** Llama a Ollama forzando la estructura del esquema con `format`. La foto es opcional. */
export async function generateRaw(userMessage: string, imageBase64?: string): Promise<unknown> {
  const res = await post(
    "/api/chat",
    {
      model: config.model,
      stream: false,
      format: schema,
      options: { temperature: 0.7 },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage, images: imageBase64 ? [imageBase64] : undefined },
      ],
    },
    config.timeoutMs,
  );

  const data = (await res.json()) as { message?: { content?: string } };
  try {
    return JSON.parse(data.message?.content ?? "");
  } catch {
    throw new OllamaError("The model's response is not valid JSON.", 422);
  }
}

/** Genera una imagen con un modelo de imagen de Ollama. Devuelve el PNG en base64. */
export async function generateImage(prompt: string): Promise<string> {
  let res: Response;
  try {
    res = await post(
      "/api/generate",
      { model: config.imageModel, prompt, stream: false, width: config.imageWidth, height: config.imageHeight },
      config.imageTimeoutMs,
    );
  } catch (err) {
    if (err instanceof OllamaError && err.message.includes("not found")) {
      throw new OllamaError(`The image model is not downloaded. Run: ollama pull ${config.imageModel}`, 404);
    }
    throw err;
  }

  const data = (await res.json()) as { image?: string; images?: string[] };
  const image = data.image ?? data.images?.[0];
  if (!image) {
    throw new OllamaError(
      `"${config.imageModel}" did not return an image. Make sure it is an image-generation model.`,
      422,
    );
  }
  return image;
}

export async function ollamaStatus() {
  try {
    const res = await fetch(`${config.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = (data.models ?? []).map((m) => m.name);
    const has = (m: string) => names.includes(m) || names.includes(`${m}:latest`);
    return { reachable: true, modelAvailable: has(config.model), imageModelAvailable: has(config.imageModel) };
  } catch {
    return { reachable: false, modelAvailable: false, imageModelAvailable: false };
  }
}
