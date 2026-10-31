import { useEffect, useRef, useState } from "react";
import { generateAltarImage, generateOfrenda } from "./api";
import OfrendaForm from "./OfrendaForm";
import OfrendaResult from "./OfrendaResult";
import type { AltarImageState, FormInput, GenerateResponse } from "./types";

type Status = "idle" | "loading" | "ready" | "error";

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [runId, setRunId] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [altarImage, setAltarImage] = useState<AltarImageState | null>(null);
  // Evita que una imagen de una ofrenda anterior reemplace la actual.
  const latestRun = useRef(0);

  useEffect(() => {
    if (status !== "loading") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  async function handleSubmit(input: FormInput, photo: File | null) {
    setStatus("loading");
    setError("");
    setAltarImage(null);
    const run = ++latestRun.current;
    let data: GenerateResponse;
    try {
      data = await generateOfrenda(input, photo);
      setResult(data);
      setRunId(run);
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
      return;
    }

    // La imagen se genera después del texto para no hacer esperar más a quien escribe.
    setAltarImage({ status: "loading" });
    const items = data.ofrenda.personalItems.map((i) => i.item);
    try {
      const image = await generateAltarImage(input.tone, items);
      if (run === latestRun.current) setAltarImage({ status: "ready", data: image });
    } catch (e) {
      if (run === latestRun.current) setAltarImage({ status: "error", error: (e as Error).message });
    }
  }

  const loading = status === "loading";

  return (
    <main className="app">
      <header className="no-print">
        <p className="eyebrow">Day of the Dead</p>
        <h1>Ofrenda local</h1>
        <p>
          Tell me about someone you miss and I'll help you write them a remembrance and a calaverita, plan their
          ofrenda and picture how it could look. The AI runs on your computer, with no internet: what you write and
          your photos stay with you.
        </p>
      </header>

      <OfrendaForm disabled={loading} onSubmit={handleSubmit} />

      {loading && (
        <p className="hint center no-print">
          Writing… {elapsed}s. The model runs on your machine and can take 20 to 60 seconds.
        </p>
      )}
      {status === "error" && <p className="error no-print">{error}</p>}

      {status === "ready" && result && <OfrendaResult key={runId} data={result} altarImage={altarImage} />}
    </main>
  );
}
