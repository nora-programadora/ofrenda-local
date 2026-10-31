import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface JsonSchema {
  required: string[];
  properties: Record<string, any>;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readText = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), "utf8");

export const config = {
  port: Number(process.env.PORT ?? 3001),
  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
  model: process.env.OLLAMA_MODEL ?? "gemma3:4b",
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 240_000),
  imageModel: process.env.OLLAMA_IMAGE_MODEL ?? "x/z-image-turbo",
  imageTimeoutMs: Number(process.env.OLLAMA_IMAGE_TIMEOUT_MS ?? 600_000),
  imageWidth: Number(process.env.OLLAMA_IMAGE_WIDTH ?? 1024),
  imageHeight: Number(process.env.OLLAMA_IMAGE_HEIGHT ?? 768),
  maxPhotoBytes: 8 * 1024 * 1024,
};

export const schema = JSON.parse(readText("schema.json")) as JsonSchema;
export const systemPrompt = readText("prompts", "system.txt");
