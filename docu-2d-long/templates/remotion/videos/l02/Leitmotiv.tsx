// L02 Leitmotiv: "Das Haus mit den vierzig Fenstern". Your work week as a house at night, every lit window = one hour.
// The light in a window is double-edged: it goes out cold (nobody is hired) or warm (Feierabend).
// Plus the shared place pieces of this video: night backdrop, ground, signposts, street lamp, crane.
import React from "react";
import { Layer } from "../../lib/docu/Stage";
import { NightSky, HorizonGlow, Mountains, GOLD_HOT, ORANGE_HOT } from "../../lib/docu/Scenery";
import { Parallax, Building, Moon, Bloom } from "../../lib/docu/Setpieces";
import { C } from "../../lib/docu/theme";
import { lerp, clamp01 } from "../../lib/docu/anim";

export const FLOOR = 860;
const COLD_WIN = "#7f93bd";

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`;
};

/**
 * The house. cols x rows windows (default 5 x 8 = 40), lit from the bottom row up: window k shines with clamp(lit - k).
 * grow: floors get taller (productivity: "the house has grown"). cold 0..1: lit windows turn grey-blue.
 * door 0..1: warm light in the entrance. off: set of window indices forced dark (e.g. the freed Friday floor).
 * ghost: draw as a dashed outline only (Keynes' house of 15).
 */
export const House: React.FC<{
  id: string; x: number; y?: number; w?: number; floorH?: number; cols?: number; rows?: number; lit: number; cold?: number;
  door?: number; grow?: number; off?: Set<number>; ghost?: boolean; o?: number; attic?: number; glow?: number; atticR?: number;
}> = ({ id, x, y = FLOOR, w = 420, floorH = 64, cols = 5, rows = 8, lit, cold = 0, door = 0, grow = 1, off, ghost, o = 1, attic, glow = 1, atticR = 26 }) => {
  const fh = floorH * grow;
  const bodyH = rows * fh + 110; // + ground floor with door
  const top = y - bodyH;
  const cw = w / cols;
  const ww = cw * 0.5, wh = fh * 0.56;
  const warm = mix(GOLD_HOT, COLD_WIN, cold);
  const warm2 = mix(ORANGE_HOT, COLD_WIN, cold);
  const wins = [];
  let litSum = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = (rows - 1 - r) * cols + c; // bottom row first
      const v = off?.has(k) ? 0 : clamp01(lit - k);
      litSum += v;
      const wx = x - w / 2 + c * cw + (cw - ww) / 2, wy = top + 18 + r * fh + (fh - wh) / 2;
      wins.push(
        <g key={k}>
          <rect x={wx} y={wy} width={ww} height={wh} fill={ghost ? "none" : "#0b1a46"} stroke={ghost ? C.cream : "none"} strokeDasharray={ghost ? "5 5" : undefined} strokeWidth={1.5} opacity={ghost ? 0.5 + 0.5 * v : 1} />
          {!ghost && v > 0 && <rect x={wx} y={wy} width={ww} height={wh} fill={(k * 7) % 5 === 0 ? warm2 : warm} opacity={0.15 + 0.85 * v} />}
          {!ghost && v > 0 && <rect x={wx + ww * 0.47} y={wy} width={ww * 0.06} height={wh} fill="#0b1a46" opacity={0.6 * v} />}
          {ghost && v > 0 && <rect x={wx + 3} y={wy + 3} width={ww - 6} height={wh - 6} fill={GOLD_HOT} opacity={0.55 * v} />}
        </g>,
      );
    }
  const share = litSum / (rows * cols);
  const dx = x, dw = 74, dh = 104;
  return (
    <g opacity={o}>
      {!ghost && (
        <defs>
          <radialGradient id={`${id}hb`}><stop offset="0" stopColor={warm} stopOpacity={0.35} /><stop offset="1" stopColor={warm} stopOpacity={0} /></radialGradient>
          <radialGradient id={`${id}db`}><stop offset="0" stopColor={GOLD_HOT} stopOpacity={0.7} /><stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} /></radialGradient>
        </defs>
      )}
      {!ghost && <ellipse cx={x} cy={top + bodyH * 0.45} rx={w * 1.05} ry={bodyH * 0.62} fill={`url(#${id}hb)`} opacity={share * (1 - 0.6 * cold) * glow} />}
      {/* gable roof + attic window */}
      <path d={`M ${x - w / 2 - 16} ${top} L ${x} ${top - w * 0.36} L ${x + w / 2 + 16} ${top} Z`} fill={ghost ? "none" : "#081436"} stroke={ghost ? C.cream : C.floorEdge} strokeDasharray={ghost ? "6 6" : undefined} strokeWidth={ghost ? 1.5 : 1} opacity={ghost ? 0.6 : 1} />
      {attic !== undefined && !ghost && (
        <g>
          <circle cx={x} cy={top - w * 0.15} r={atticR} fill="#0b1a46" />
          <circle cx={x} cy={top - w * 0.15} r={atticR} fill={mix(GOLD_HOT, COLD_WIN, Math.max(cold, 1 - attic))} opacity={0.2 + 0.8 * attic} />
          <path d={`M ${x - atticR} ${top - w * 0.15} H ${x + atticR} M ${x} ${top - w * 0.15 - atticR} V ${top - w * 0.15 + atticR}`} stroke="#0b1a46" strokeWidth={3} />
        </g>
      )}
      <rect x={x - w / 2} y={top} width={w} height={bodyH} fill={ghost ? "none" : "#0a1740"} stroke={ghost ? C.cream : "none"} strokeDasharray={ghost ? "6 6" : undefined} strokeWidth={1.5} opacity={ghost ? 0.6 : 1} />
      {!ghost && <rect x={x - w / 2} y={top} width={w} height={2} fill={C.floorEdge} opacity={0.6} />}
      {wins}
      {/* ground floor: door */}
      {!ghost && (
        <g>
          <rect x={x - w / 2} y={y - 110} width={w} height={3} fill={C.floorEdge} opacity={0.5} />
          {door > 0 && <ellipse cx={dx} cy={y - dh / 2} rx={150} ry={110} fill={`url(#${id}db)`} opacity={door} />}
          <rect x={dx - dw / 2} y={y - dh} width={dw} height={dh} fill="#071030" />
          <rect x={dx - dw / 2 + 6} y={y - dh + 6} width={dw - 12} height={dh - 6} fill={GOLD_HOT} opacity={0.9 * door} />
          <rect x={dx - 50} y={y - 4} width={100} height={6} fill={C.floorEdge} />
        </g>
      )}
    </g>
  );
};
export const houseTop = (rows = 8, floorH = 64, grow = 1, y = FLOOR) => y - (rows * floorH * grow + 110);
/** Centre of window k (bottom row first), for labels/arrows. */
export const winPos = (k: number, x: number, w = 420, rows = 8, cols = 5, floorH = 64, grow = 1, y = FLOOR) => {
  const fh = floorH * grow, top = houseTop(rows, floorH, grow, y), cw = w / cols;
  const r = rows - 1 - Math.floor(k / cols), c = k % cols;
  return { x: x - w / 2 + c * cw + cw / 2, y: top + 18 + r * fh + fh / 2 };
};

/**
 * Shared night backdrop for every set (local coords 0..1920, scene centre ax in WORLD coords for parallax).
 * cold 0..1 turns the horizon glow off and the town windows grey. city 0..1 = share of lit town windows.
 */
export const Backdrop: React.FC<{ id: string; ax: number; f: number; cold?: number; city?: number; glowX?: number; seed?: number; glow?: number }> = ({ id, ax, f, cold = 0, city = 0.35, glowX = 1500, seed = 3, glow = 0.8 }) => (
  <>
    <Parallax depth={0.85} ax={ax}>
      <Layer x={-500} y={-1000} w={2920} h={2200}>
        {/* NightSky draws from (0,0): shift it so it covers the whole layer (camera may look high up into the stars) */}
        <g transform="translate(-500 -1000)">
          <NightSky id={`${id}s`} w={2920} h={2200} horizon={2250} stars={330} seed={seed} twinkle={f} />
        </g>
        <Moon x={1700 + seed * 40} y={260} r={20} />
      </Layer>
    </Parallax>
    <Parallax depth={0.5} ax={ax}>
      <Layer x={-500} y={0} w={2920} h={1300}>
        <HorizonGlow id={`${id}g`} x={glowX + 500} y={800} r={560} o={glow * (1 - 0.85 * cold)} />
        <Mountains id={`${id}m`} w={2920} h={1300} base={760} amp={110} glowX={glowX + 500} seed={seed + 5} rim={1 - 0.8 * cold} />
      </Layer>
    </Parallax>
    <Parallax depth={0.22} ax={ax}>
      <Layer x={-400} y={0} w={2720} h={1200}>
        {[[-300, 140, 240], [-140, 110, 320], [0, 150, 200], [180, 120, 280], [2050, 140, 300], [2220, 120, 230], [2370, 160, 340]].map(([x, w, h], i) => (
          <Building key={i} x={x} y={FLOOR + 10} w={w} h={h} lit={city * (1 - 0.7 * cold)} seed={seed * 10 + i} />
        ))}
      </Layer>
    </Parallax>
    <Layer x={-400} y={FLOOR - 40} w={2720} h={700}>
      <defs>
        <linearGradient id={`${id}gr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1c4e" />
          <stop offset="0.3" stopColor="#071235" />
          <stop offset="1" stopColor="#030920" />
        </linearGradient>
        <linearGradient id={`${id}ge`} x1="-400" y1="0" x2="2320" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD_HOT} stopOpacity={0} />
          <stop offset={0.5} stopColor={GOLD_HOT} stopOpacity={0.55 * (1 - cold)} />
          <stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-400} y={FLOOR} width={2720} height={700} fill={`url(#${id}gr)`} />
      <rect x={-400} y={FLOOR - 1} width={2720} height={2.5} fill={`url(#${id}ge)`} />
    </Layer>
  </>
);

/** Street lamp (warm), `on` 0..1. SVG, goes into a Layer. */
export const StreetLamp: React.FC<{ id: string; x: number; y?: number; h?: number; on?: number }> = ({ id, x, y = FLOOR, h = 230, on = 1 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1c8" stopOpacity={0.4 * on} /><stop offset="1" stopColor={GOLD_HOT} stopOpacity={0.03 * on} /></linearGradient>
      <radialGradient id={`${id}p`}><stop offset="0" stopColor={GOLD_HOT} stopOpacity={0.6 * on} /><stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} /></radialGradient>
    </defs>
    <path d={`M ${x - 16} ${y - h + 18} L ${x + 16} ${y - h + 18} L ${x + 120} ${y} L ${x - 120} ${y} Z`} fill={`url(#${id}c)`} />
    <ellipse cx={x} cy={y} rx={150} ry={18} fill={`url(#${id}p)`} />
    <rect x={x - 3} y={y - h} width={6} height={h} fill="#08122f" />
    <path d={`M ${x - 20} ${y - h + 18} L ${x - 12} ${y - h} L ${x + 12} ${y - h} L ${x + 20} ${y - h + 18} Z`} fill="#0d1b45" />
    <rect x={x - 14} y={y - h + 14} width={28} height={6} fill={on > 0.05 ? "#fff3cf" : "#1d2a55"} opacity={0.3 + 0.7 * on} />
  </g>
);

/** Construction crane silhouette that lowers extra floors (counter-voice "mehr arbeiten"). */
export const Crane: React.FC<{ x: number; y?: number; h?: number; hook: number }> = ({ x, y = FLOOR, h = 640, hook }) => {
  const top = y - h;
  return (
    <g stroke={C.bgLift} strokeWidth={4} fill="none">
      <path d={`M ${x - 18} ${y} L ${x - 18} ${top} M ${x + 18} ${y} L ${x + 18} ${top}`} />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${x - 18} ${y - (i * h) / 14} L ${x + 18} ${y - ((i + 1) * h) / 14}`} opacity={0.7} />)}
      <path d={`M ${x - 140} ${top} L ${x + 520} ${top} M ${x - 18} ${top} L ${x} ${top - 70} L ${x + 520} ${top} M ${x} ${top - 70} L ${x - 140} ${top}`} />
      <rect x={x - 150} y={top} width={60} height={40} fill={C.bgLift} />
      <line x1={x + 360} y1={top} x2={x + 360} y2={top + hook} strokeWidth={2} />
    </g>
  );
};

export { Bloom };
