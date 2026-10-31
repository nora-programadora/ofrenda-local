import { useState } from "react";
import AltarIllustration from "./AltarIllustration";
import type { AltarImageState, GenerateResponse } from "./types";

interface Props {
  data: GenerateResponse;
  altarImage: AltarImageState | null;
}

export default function OfrendaResult({ data, altarImage }: Props) {
  const { ofrenda, traditional, warnings, meta } = data;
  const [remembrance, setRemembrance] = useState(ofrenda.remembrance);
  const [calaverita, setCalaverita] = useState(ofrenda.calaverita.join("\n"));
  const [cartelito, setCartelito] = useState(ofrenda.cartelito);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(`${cartelito}\n\n${remembrance}\n\n${calaverita}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <section className="card no-print">
        <div className="card-head">
          <h2>Your ofrenda</h2>
          <span className="meta">
            {meta.model} · {meta.seconds}s{meta.hadPhoto ? " · with photo" : ""}
          </span>
        </div>

        {warnings.length > 0 && (
          <ul className="warnings">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        <p className="hint">It's a draft to keep you company. Edit it until it sounds like you and the person you remember.</p>

        <label className="field">
          <span>Cartelito</span>
          <input type="text" maxLength={80} value={cartelito} onChange={(e) => setCartelito(e.target.value)} />
        </label>
        <label className="field">
          <span>Remembrance</span>
          <textarea rows={7} value={remembrance} onChange={(e) => setRemembrance(e.target.value)} />
        </label>
        <label className="field">
          <span>Calaverita</span>
          <textarea rows={8} value={calaverita} onChange={(e) => setCalaverita(e.target.value)} />
        </label>

        {meta.hadPhoto && ofrenda.photoDescription && (
          <p className="photo-note">
            <strong>What the AI saw in the photo:</strong> {ofrenda.photoDescription}
          </p>
        )}

        <div className="actions">
          <button className="primary" onClick={copy}>
            {copied ? "Copied!" : "Copy text"}
          </button>
          <button className="ghost" onClick={() => window.print()}>
            Print for the ofrenda
          </button>
        </div>
      </section>

      <section className="card no-print">
        <h2>Building your ofrenda</h2>

        <h3>From what you told me</h3>
        {ofrenda.personalItems.length > 0 ? (
          <ul className="items">
            {ofrenda.personalItems.map((i) => (
              <li key={i.item}>
                <strong>{i.item}</strong>
                <span>{i.why}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">Tell me more about this person and the things they loved will show up here.</p>
        )}

        <h3>The traditional elements</h3>
        <ul className="items">
          {traditional.map((t) => (
            <li key={t.name}>
              <strong>{t.name}</strong>
              <span>{t.meaning}</span>
            </li>
          ))}
        </ul>
        <p className="hint">Customs vary by region and by family: take whatever feels right to you.</p>
      </section>

      {altarImage && (
        <section className="card no-print">
          <div className="card-head">
            <h2>How your altar could look</h2>
            {altarImage.status === "ready" && (
              <span className="meta">
                {altarImage.data.meta.model} · {altarImage.data.meta.seconds}s
              </span>
            )}
          </div>

          {altarImage.status === "loading" && (
            <div className="altar-placeholder">
              <p className="hint">Painting the altar… Image generation can take a few minutes.</p>
            </div>
          )}
          {/* Sin modelo de imagen (por ejemplo, sin MLX) se muestra el dibujo hecho por la app. */}
          {altarImage.status === "error" && (
            <AltarIllustration tone={meta.tone} items={ofrenda.personalItems.map((i) => i.item)} />
          )}
          {altarImage.status === "ready" && (
            <>
              <img className="altar-image" src={altarImage.data.image} alt="AI-generated illustration of an ofrenda" />
              <p className="hint">An AI-generated idea for inspiration, not a rule. Your altar can look however you like.</p>
              <div className="actions">
                <a className="button ghost" href={altarImage.data.image} download="ofrenda.png">
                  Download image
                </a>
              </div>
            </>
          )}
        </section>
      )}

      {/* Hoja que solo aparece al imprimir */}
      <section className="print-sheet">
        <h1>{cartelito}</h1>
        <p className="print-text">{remembrance}</p>
        <div className="print-verse">
          {calaverita.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </section>
    </>
  );
}
