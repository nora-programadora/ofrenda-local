export type Tone = "Tierno" | "Alegre" | "Solemne";

export interface FormInput {
  name: string;
  relationship: string;
  food: string;
  song: string;
  story: string;
  tone: Tone;
}

export interface PersonalItem {
  item: string;
  why: string;
}

export interface Ofrenda {
  remembrance: string;
  calaverita: string[];
  cartelito: string;
  personalItems: PersonalItem[];
  photoDescription: string;
}

export interface TraditionalElement {
  name: string;
  meaning: string;
}

export interface GenerateResponse {
  ofrenda: Ofrenda;
  traditional: TraditionalElement[];
  warnings: string[];
  meta: { model: string; hadPhoto: boolean; tone: Tone; seconds: number };
}

export interface AltarImageResponse {
  image: string;
  meta: { model: string; seconds: number };
}

export type AltarImageState =
  | { status: "loading" }
  | { status: "ready"; data: AltarImageResponse }
  | { status: "error"; error: string };
