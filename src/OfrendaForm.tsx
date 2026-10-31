import { useEffect, useMemo, useRef, useState } from "react";
import type { FormInput, Tone } from "./types";

interface Props {
  disabled: boolean;
  onSubmit: (input: FormInput, photo: File | null) => void;
}

// El valor se envía en español porque así lo espera el prompt; la etiqueta se muestra en inglés.
const TONES: { value: Tone; label: string }[] = [
  { value: "Tierno", label: "Tender" },
  { value: "Alegre", label: "Cheerful" },
  { value: "Solemne", label: "Solemn" },
];

export default function OfrendaForm({ disabled, onSubmit }: Props) {
  const [input, setInput] = useState<FormInput>({
    name: "",
    relationship: "",
    food: "",
    song: "",
    story: "",
    tone: "Tierno",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = <K extends keyof FormInput>(key: K, value: FormInput[K]) => setInput((p) => ({ ...p, [key]: value }));

  return (
    <form
      className="card no-print"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(input, photo);
      }}
    >
      <h2>Who would you like to remember?</h2>

      <div className="grid">
        <label className="field">
          <span>Name *</span>
          <input
            type="text"
            required
            maxLength={60}
            placeholder="For example: Grandma Chuy"
            value={input.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Who were they to you?</span>
          <input
            type="text"
            maxLength={60}
            placeholder="My grandmother, my uncle, my friend..."
            value={input.relationship}
            onChange={(e) => set("relationship", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Their favorite food</span>
          <input type="text" maxLength={120} value={input.food} onChange={(e) => set("food", e.target.value)} />
        </label>
        <label className="field">
          <span>A song they loved</span>
          <input type="text" maxLength={120} value={input.song} onChange={(e) => set("song", e.target.value)} />
        </label>
        <label className="field full">
          <span>A memory, or something they always did or said</span>
          <textarea
            rows={4}
            maxLength={800}
            placeholder="Write it in your own words. The more real it is, the better the result."
            value={input.story}
            onChange={(e) => set("story", e.target.value)}
          />
        </label>

        <div className="field">
          <span>Tone</span>
          <div className="chips">
            {TONES.map(({ value, label }) => (
              <label key={value} className={`chip${input.tone === value ? " on" : ""}`}>
                <input type="radio" name="tone" checked={input.tone === value} onChange={() => set("tone", value)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <span>A photo (optional)</span>
          <div className="photo-row">
            {preview && <img src={preview} alt="Selected photo" />}
            <button type="button" className="ghost" onClick={() => fileRef.current?.click()} disabled={disabled}>
              {photo ? "Change photo" : "Choose photo"}
            </button>
            {photo && (
              <button type="button" className="ghost" onClick={() => setPhoto(null)} disabled={disabled}>
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <p className="privacy">
        Everything happens on your computer: your memories and your photo are never sent to any cloud service.
      </p>

      <button className="primary" type="submit" disabled={disabled || !input.name.trim()}>
        {disabled ? "Lighting the candles…" : "Create the ofrenda"}
      </button>
    </form>
  );
}
