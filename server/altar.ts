import type { Tone } from "./ofrenda.js";

const MOOD: Record<Tone, string> = {
  Tierno: "warm and intimate, soft golden candlelight",
  Alegre: "vibrant and festive, bright saturated colors",
  Solemne: "quiet and reverent, dim candlelight and deep shadows",
};

/** Prompt en inglés para el modelo de imagen. Solo usa elementos de la ofrenda, nunca a la persona. */
export function buildAltarPrompt(items: string[], tone: Tone): string {
  const personal = items.length ? ` Also on the altar: ${items.join(", ")}.` : "";
  return [
    "A traditional Mexican Día de Muertos home ofrenda (altar) with three tiers covered in cloth,",
    "orange cempasúchil marigold flowers and scattered petals, lit candles, colorful papel picado banners,",
    "a glass of water, a small dish of salt, pan de muerto, sugar skulls, smoking copal incense,",
    `and an empty decorative picture frame in the center.${personal}`,
    `Mood: ${MOOD[tone]}. Photorealistic, detailed, no people, no text.`,
  ].join(" ");
}
