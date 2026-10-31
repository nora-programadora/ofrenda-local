import { useRef } from "react";
import type { Tone } from "./types";

interface Props {
  tone: Tone;
  items: string[];
}

// Colores según el tono pedido: pared, manteles de cada nivel e intensidad del brillo de las velas.
const PALETTES: Record<Tone, { wall: string; cloths: [string, string, string]; glow: number }> = {
  Tierno: { wall: "#2a1838", cloths: ["#9e4669", "#8c3a5c", "#7a2e4f"], glow: 0.35 },
  Alegre: { wall: "#2b1640", cloths: ["#00897b", "#7b1fa2", "#c2185b"], glow: 0.45 },
  Solemne: { wall: "#120d1a", cloths: ["#4b3657", "#43304f", "#3b2a4a"], glow: 0.2 },
};

const PICADO = ["#e83f6f", "#f6a623", "#2bb3a3", "#8e5cd9", "#3d8bfd"];

// Niveles del altar, de arriba hacia abajo: [x, y de la superficie, ancho].
const TIERS: [number, number, number][] = [
  [250, 200, 300],
  [170, 290, 460],
  [90, 390, 620],
];

// Lugares para los objetos personales: primero el nivel de en medio, luego el de abajo.
const SLOTS: [number, number][] = [
  [320, 290],
  [480, 290],
  [400, 290],
  [280, 390],
  [520, 390],
  [400, 390],
];

function Marigold({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f6a623" />
      <circle cx={x} cy={y} r={r * 0.65} fill="#f08c00" />
      <circle cx={x} cy={y} r={r * 0.3} fill="#c25e00" />
    </g>
  );
}

function Candle({ x, base, h = 40 }: { x: number; base: number; h?: number }) {
  return (
    <g>
      <circle cx={x} cy={base - h - 8} r={26} fill="url(#flameGlow)" />
      <rect x={x - 7} y={base - h} width={14} height={h} rx={2} fill="#f4ecdf" />
      <path d={`M${x} ${base - h - 18} q7 10 0 14 q-7 -4 0 -14z`} fill="#ffd166" />
    </g>
  );
}

function Plate({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y - 4} rx={30} ry={8} fill="#e9dcc6" />
      <circle cx={x} cy={y - 22} r={15} fill="#f6a623" stroke="#2a1a00" strokeWidth={2} />
      <text x={x} y={y - 17} textAnchor="middle" fontSize={15} fontWeight={700} fill="#2a1a00">
        {n}
      </text>
    </g>
  );
}

/** Dibujo del altar hecho por la app, para equipos donde no hay modelo de imagen local. */
export default function AltarIllustration({ tone, items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const p = PALETTES[tone];
  const shown = items.slice(0, SLOTS.length);

  function download() {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ofrenda.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <svg
        ref={svgRef}
        className="altar-image"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Illustration of an ofrenda"
      >
        <defs>
          <radialGradient id="flameGlow">
            <stop offset="0%" stopColor="#ffd166" stopOpacity={p.glow * 2} />
            <stop offset="100%" stopColor="#ffd166" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="wallGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f6a623" stopOpacity={p.glow} />
            <stop offset="100%" stopColor="#f6a623" stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect width={800} height={600} fill={p.wall} />
        <rect width={800} height={600} fill="url(#wallGlow)" />
        <rect y={490} width={800} height={110} fill="#1a1022" />

        {/* Papel picado */}
        <path d="M0 30 Q400 70 800 30" stroke="#b9aecb" strokeWidth={2} fill="none" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = i * 74 + 6;
          const y = 30 + 40 * (1 - ((x + 31 - 400) / 400) ** 2) * 0.5;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y} h62 v48 l-10.3 -8 l-10.3 8 l-10.3 -8 l-10.3 8 l-10.3 -8 l-10.5 8z`}
                fill={PICADO[i % PICADO.length]}
              />
              <circle cx={x + 31} cy={y + 20} r={8} fill={p.wall} />
              <path d={`M${x + 12} ${y + 10} l6 6 l-6 6 l-6 -6z M${x + 50} ${y + 10} l6 6 l-6 6 l-6 -6z`} fill={p.wall} />
            </g>
          );
        })}

        {/* Niveles con mantel y encaje */}
        {[...TIERS].reverse().map(([x, y, w], i) => {
          const h = (TIERS.find((t) => t[1] > y)?.[1] ?? 490) - y;
          return (
            <g key={y}>
              <rect x={x} y={y} width={w} height={h} fill={p.cloths[2 - i]} />
              <rect x={x} y={y} width={w} height={8} fill="#f4ecdf" opacity={0.85} />
              {Array.from({ length: Math.floor(w / 20) }, (_, j) => (
                <circle key={j} cx={x + 10 + j * 20} cy={y + 9} r={6} fill="#f4ecdf" opacity={0.85} />
              ))}
            </g>
          );
        })}

        {/* Nivel de arriba: retrato vacío entre velas y flores */}
        <rect x={345} y={105} width={110} height={95} rx={4} fill="#d4a017" />
        <rect x={355} y={115} width={90} height={75} fill="#0e0914" />
        <path d="M370 180 q30 -40 60 0" stroke="#3b2d57" strokeWidth={3} fill="none" />
        <circle cx={400} cy={145} r={14} fill="#3b2d57" />
        <Marigold x={345} y={105} r={11} />
        <Marigold x={455} y={105} r={11} />
        <Candle x={290} base={200} />
        <Candle x={510} base={200} />
        <Marigold x={265} y={192} />
        <Marigold x={535} y={192} />

        {/* Nivel de en medio: pan de muerto y calaverita de azúcar */}
        <ellipse cx={210} cy={276} rx={32} ry={16} fill="#c98a3c" />
        <path d="M186 272 h48 M210 262 v22" stroke="#e8b46a" strokeWidth={5} strokeLinecap="round" />
        <circle cx={210} cy={264} r={6} fill="#e8b46a" />
        <circle cx={590} cy={266} r={20} fill="#f4ecdf" />
        <rect x={580} y={278} width={20} height={10} rx={3} fill="#f4ecdf" />
        <circle cx={582} cy={264} r={6} fill="#2bb3a3" />
        <circle cx={598} cy={264} r={6} fill="#e83f6f" />
        <path d="M584 282 v6 M590 282 v6 M596 282 v6" stroke="#8e5cd9" strokeWidth={2} />

        {/* Nivel de abajo: agua, sal, copal y velas */}
        <path d="M135 345 h30 l-4 45 h-22z" fill="#9ad3f5" opacity={0.6} stroke="#cfeaff" />
        <ellipse cx={210} cy={386} rx={22} ry={6} fill="#e9dcc6" />
        <path d="M194 384 q16 -16 32 0z" fill="#ffffff" />
        <path d="M640 372 h40 l-6 18 h-28z" fill="#7a4a2a" />
        <path
          d="M660 368 c-12 -18 12 -28 0 -48 c-10 -16 10 -24 4 -40"
          stroke="#b9aecb"
          strokeWidth={4}
          fill="none"
          opacity={0.5}
          strokeLinecap="round"
        />
        <Candle x={110} base={390} h={50} />
        <Candle x={720} base={390} h={50} />
        <Marigold x={600} y={382} />
        <Marigold x={340} y={382} />
        <Marigold x={460} y={382} />

        {/* Objetos personales */}
        {shown.map((_, i) => (
          <Plate key={i} x={SLOTS[i][0]} y={SLOTS[i][1]} n={i + 1} />
        ))}

        {/* Camino de pétalos */}
        {Array.from({ length: 40 }, (_, i) => {
          const t = i / 39;
          const x = 400 + Math.sin(i * 2.3) * (12 + t * 110);
          const y = 500 + t * 95;
          return <ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill={i % 3 ? "#f6a623" : "#f08c00"} transform={`rotate(${i * 37} ${x} ${y})`} />;
        })}
      </svg>

      {shown.length > 0 && (
        <ol className="altar-legend">
          {shown.map((item, i) => (
            <li key={i}>
              <span>{i + 1}</span> {item}
            </li>
          ))}
        </ol>
      )}
      <p className="hint">
        Drawn by the app, because this computer can't run a local image model. Your altar can look however you like.
      </p>
      <div className="actions">
        <button type="button" className="ghost" onClick={download}>
          Download illustration
        </button>
      </div>
    </>
  );
}
