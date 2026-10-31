import type { AltarImageResponse, FormInput, GenerateResponse, Tone } from "./types";

// En desarrollo usa el proxy de Vite (/api). En producción define VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Could not connect to the server. Is it running on port 3001?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data as T;
}

export async function generateOfrenda(input: FormInput, photo: File | null): Promise<GenerateResponse> {
  const body = new FormData();
  (Object.keys(input) as (keyof FormInput)[]).forEach((k) => body.append(k, input[k]));
  if (photo) body.append("photo", photo);
  return request("/generate-ofrenda", { method: "POST", body });
}

export async function generateAltarImage(tone: Tone, items: string[]): Promise<AltarImageResponse> {
  return request("/generate-altar-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tone, items }),
  });
}
