// Set pieces that make a frame a PLACE, not a slide (user feedback L01, 2026-11-16: "zu blau, zu leer, wie PowerPoint").
// Rule of thumb per key frame: backdrop (sky/landscape/skyline, parallax) + mid-ground props that fit the topic +
// ONE emissive warm focus object (it is the light source of the frame) + the hero + labels.
// Measured: reference frames have a median 2.4-8.9 % warm-lit pixels, L01 had 0.2 % -> target >= 4 %.
import React, { createContext, useContext } from "react";
import { C } from "./theme";
import { GOLD_HOT, ORANGE_HOT } from "./Scenery";

// ---------- camera context (Stage provides it) ----------
export const CamContext = createContext<{ x: number; y: number; zoom: number }>({ x: 960, y: 540, zoom: 1 });

/**
 * Parallax: children move slower than the world (depth 0 = glued to the world, 0.8 = far away, nearly fixed to screen).
 * Gives depth and life while the camera holds still. NO TEXT inside (subpixel motion makes ClearType text shimmer).
 */
export const Parallax: React.FC<{ depth: number; ax?: number; ay?: number; children: React.ReactNode }> = ({ depth, ax = 960, ay = 540, children }) => {
  const cam = useContext(CamContext);
  return <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${(cam.x - ax) * depth}px, ${(cam.y - ay) * depth * 0.5}px)` }}>{children}</div>;
};

let rs = 1;
const rnd = (seed: number) => {
  rs = seed >>> 0 || 1;
  return () => ((rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/** Soft radial bloom (cheap: CSS gradient, no filter). Put it BEHIND the object it lights. */
export const Bloom: React.FC<{ x: number; y: number; r: number; o?: number; color?: string; ry?: number }> = ({ x, y, r, o = 0.6, color = ORANGE_HOT, ry }) =>
  o <= 0.001 ? null : (
    <div
      style={{
        position: "absolute", left: x - r, top: y - (ry ?? r), width: 2 * r, height: 2 * (ry ?? r), borderRadius: "50%", opacity: o, pointerEvents: "none",
        background: `radial-gradient(closest-side, ${color} 0%, ${color}99 25%, ${color}33 55%, ${color}00 100%)`,
      }}
    />
  );

/** Warm light pool on the floor under an emissive object. */
export const LightPool: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => (
  <Bloom x={x} y={y} r={w / 2} ry={w * 0.09} o={0.75 * o} color={GOLD_HOT} />
);

/**
 * The emissive focus object ("Leuchtkörper"): a card/panel/tag that is ITSELF the light source of the frame.
 * Cream core -> gold edge, big orange bloom, optional hanging string and floor pool. Content (ink text, icon) goes inside.
 * `on` 0..1 animates the light (dark navy shape -> fully lit). `shape` "card" | "tag" (price-tag pentagon) | "panel".
 */
export const Emissive: React.FC<{
  x: number; y: number; w: number; h: number; on?: number; shape?: "card" | "tag" | "panel"; hangTo?: number; floorY?: number;
  children?: React.ReactNode; bloom?: number;
}> = ({ x, y, w, h, on = 1, shape = "card", hangTo, floorY, children, bloom = 1 }) => {
  const lit = Math.max(0, Math.min(1, on));
  const clip = shape === "tag" ? `polygon(50% 0, 100% ${(w * 0.42 / h) * 100}%, 100% 100%, 0 100%, 0 ${(w * 0.42 / h) * 100}%)` : undefined;
  const core = `radial-gradient(ellipse 70% 60% at 50% 45%, #fff8e4 0%, #fbeec2 35%, ${GOLD_HOT} 80%, #e0a64e 100%)`;
  const dark = `linear-gradient(180deg, ${C.bgLift}, ${C.bgMid})`;
  return (
    <>
      {hangTo !== undefined && <div style={{ position: "absolute", left: x - 0.75, top: hangTo, width: 1.5, height: y - h / 2 - hangTo, background: `rgba(236,224,183,${0.25 + 0.4 * lit})` }} />}
      <Bloom x={x} y={y} r={Math.max(w, h) * 1.25} o={0.55 * lit * bloom} />
      <Bloom x={x} y={y} r={Math.max(w, h) * 0.7} o={0.5 * lit * bloom} color={GOLD_HOT} />
      {floorY !== undefined && <LightPool x={x} y={floorY} w={w * 3} o={lit} />}
      <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, clipPath: clip, borderRadius: shape === "card" ? 8 : shape === "panel" ? 3 : 0, background: dark, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: core, opacity: lit }} />
        <div style={{ position: "absolute", inset: shape === "tag" ? `${w * 0.1}px ${w * 0.07}px ${w * 0.07}px` : 10, border: `1.5px solid rgba(160,110,40,${0.45 * lit})`, borderRadius: 4, clipPath: clip }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.ink }}>{children}</div>
      </div>
    </>
  );
};

/** SVG set pieces below render inside a <Layer> (world space, no text). */

/** Moon with a soft halo. */
export const Moon: React.FC<{ x: number; y: number; r?: number; phase?: number }> = ({ x, y, r = 22, phase = 0.35 }) => (
  <g>
    <defs>
      <radialGradient id={`moon${x}`}><stop offset="0" stopColor="#fff6dc" stopOpacity={0.35} /><stop offset="1" stopColor="#fff6dc" stopOpacity={0} /></radialGradient>
      <mask id={`moonm${x}`}><circle cx={x} cy={y} r={r} fill="#fff" /><circle cx={x + r * 2 * phase} cy={y - r * 0.3} r={r} fill="#000" /></mask>
    </defs>
    <circle cx={x} cy={y} r={r * 5} fill={`url(#moon${x})`} />
    <circle cx={x} cy={y} r={r} fill="#fbf1d4" mask={`url(#moonm${x})`} />
  </g>
);

/** Power pylon silhouette (lattice), for energy / infrastructure topics. */
export const Pylon: React.FC<{ x: number; y: number; h: number; o?: number }> = ({ x, y, h, o = 0.9 }) => {
  const w = h * 0.32, top = y - h;
  const s = C.bgLift;
  return (
    <g opacity={o} stroke={s} strokeWidth={Math.max(1.5, h / 120)} fill="none">
      <path d={`M ${x - w / 2} ${y} L ${x - w * 0.1} ${top + h * 0.1} L ${x + w * 0.1} ${top + h * 0.1} L ${x + w / 2} ${y}`} />
      {[0.25, 0.45, 0.65, 0.85].map((k) => {
        const yy = top + h * k, hw = w * 0.1 + (w * 0.4) * k;
        return <path key={k} d={`M ${x - hw} ${yy} L ${x + hw} ${yy} M ${x - hw} ${yy} L ${x + hw * 0.8} ${yy + h * 0.2} M ${x + hw} ${yy} L ${x - hw * 0.8} ${yy + h * 0.2}`} opacity={0.7} />;
      })}
      <path d={`M ${x - w * 0.55} ${top + h * 0.18} H ${x + w * 0.55} M ${x - w * 0.42} ${top + h * 0.32} H ${x + w * 0.42}`} />
    </g>
  );
};

/** Building with a window grid. `lit` 0..1 turns windows on (seeded order) -> great for "it grows / spreads" beats. */
export const Building: React.FC<{ x: number; y: number; w: number; h: number; lit?: number; seed?: number; cols?: number; rows?: number; roof?: "flat" | "gable" }> = ({
  x, y, w, h, lit = 0.4, seed = 1, cols, rows, roof = "flat",
}) => {
  const r = rnd(seed);
  const nc = cols ?? Math.max(2, Math.round(w / 34)), nr = rows ?? Math.max(2, Math.round(h / 42));
  const cw = w / nc, ch = (h - 20) / nr;
  const win = [];
  for (let i = 0; i < nc; i++)
    for (let j = 0; j < nr; j++) {
      const on = r() < lit;
      win.push(<rect key={`${i}_${j}`} x={x + i * cw + cw * 0.28} y={y - h + 14 + j * ch + ch * 0.22} width={cw * 0.44} height={ch * 0.5} fill={on ? (r() > 0.3 ? GOLD_HOT : ORANGE_HOT) : "#0b1a46"} opacity={on ? 0.75 + 0.25 * r() : 0.9} />);
    }
  return (
    <g>
      {roof === "gable" && <path d={`M ${x - 4} ${y - h} L ${x + w / 2} ${y - h - w * 0.4} L ${x + w + 4} ${y - h} Z`} fill="#0a1740" />}
      <rect x={x} y={y - h} width={w} height={h} fill="#0a1740" />
      <rect x={x} y={y - h} width={w} height={2} fill={C.floorEdge} opacity={0.5} />
      {win}
    </g>
  );
};

/** Winding road / path with a warm edge line, from (x0,y0) to (x1,y1) via control (cx,cy). Draws itself with `draw` 0..1. */
export const Road: React.FC<{ x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; draw?: number; w?: number }> = ({ x0, y0, cx, cy, x1, y1, draw = 1, w = 3 }) => {
  const d = `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
  return (
    <g fill="none">
      <path d={d} stroke="#0a1740" strokeWidth={w * 14} strokeLinecap="round" />
      <path d={d} stroke={GOLD_HOT} strokeWidth={w} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={0.85} strokeLinecap="round" />
    </g>
  );
};

/** Light cone from above onto a target (stage spot without a visible lamp). */
export const Spot: React.FC<{ id: string; x: number; top: number; floorY: number; spread?: number; o?: number }> = ({ id, x, top, floorY, spread = 360, o = 1 }) => (
  <g opacity={o}>
    <defs>
      <linearGradient id={`${id}sp`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff1c8" stopOpacity={0.32} />
        <stop offset="1" stopColor={GOLD_HOT} stopOpacity={0.05} />
      </linearGradient>
      <radialGradient id={`${id}pl`}><stop offset="0" stopColor={GOLD_HOT} stopOpacity={0.55} /><stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} /></radialGradient>
    </defs>
    <path d={`M ${x - 30} ${top} L ${x + 30} ${top} L ${x + spread / 2} ${floorY} L ${x - spread / 2} ${floorY} Z`} fill={`url(#${id}sp)`} />
    <ellipse cx={x} cy={floorY} rx={spread * 0.6} ry={spread * 0.08} fill={`url(#${id}pl)`} />
  </g>
);
