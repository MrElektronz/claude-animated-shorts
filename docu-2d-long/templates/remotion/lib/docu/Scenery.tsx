// Night scenery with strong warm/cool contrast: starry gradient sky, a hot gold horizon glow, layered mountain
// silhouettes with gold rim light, a town with warm windows, a foreground hill. SVG, any size (w x h).
// User rule (2026-11-16): more gold/orange vs navy contrast in thumbnails AND videos.
import React from "react";
import { C } from "./theme";

const rnd = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

export const GOLD_HOT = "#ffcf6e";
export const ORANGE_HOT = "#ff9a3c";

/** Sky gradient + stars. `horizon` = y where the sky is brightest. */
export const NightSky: React.FC<{ id: string; w: number; h: number; horizon: number; stars?: number; seed?: number; twinkle?: number }> = ({ id, w, h, horizon, stars = 170, seed = 3, twinkle = 0 }) => {
  const r = rnd(seed);
  const st = [];
  for (let i = 0; i < stars; i++) {
    const x = r() * w, y = Math.pow(r(), 1.35) * horizon * 0.95, s = r();
    const big = s > 0.94;
    const o = 0.35 + 0.6 * r();
    const tw = twinkle ? 0.75 + 0.25 * Math.sin(twinkle * 0.12 + i) : 1;
    st.push(
      <g key={i} opacity={o * tw}>
        <circle cx={x} cy={y} r={big ? 2.6 : 0.8 + s * 1.4} fill="#eef3ff" />
        {big && <path d={`M ${x - 9} ${y} H ${x + 9} M ${x} ${y - 9} V ${y + 9}`} stroke="#eef3ff" strokeWidth={1} opacity={0.6} />}
      </g>,
    );
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2={horizon} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#040a24" />
          <stop offset="0.55" stopColor="#0b1b56" />
          <stop offset="0.85" stopColor="#1f3f9a" />
          <stop offset="1" stopColor="#3561c4" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill={`url(#${id}sky)`} />
      {st}
    </g>
  );
};

/** Big warm glow at the horizon (the hot accent). */
export const HorizonGlow: React.FC<{ id: string; x: number; y: number; r: number; o?: number; color?: string }> = ({ id, x, y, r, o = 1, color = GOLD_HOT }) => (
  <g opacity={o}>
    <defs>
      <radialGradient id={`${id}hg`}>
        <stop offset="0" stopColor="#fff4d6" stopOpacity={0.95} />
        <stop offset="0.12" stopColor={color} stopOpacity={0.8} />
        <stop offset="0.4" stopColor={ORANGE_HOT} stopOpacity={0.3} />
        <stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={x} cy={y} rx={r * 1.5} ry={r} fill={`url(#${id}hg)`} />
  </g>
);

const ridge = (w: number, base: number, amp: number, seed: number, step = 40) => {
  const r = rnd(seed);
  const p1 = r() * 6, p2 = r() * 6, p3 = r() * 6;
  let d = `M -20 ${base + amp}`;
  for (let x = -20; x <= w + 40; x += step) {
    const y = base - amp * (0.55 * Math.sin(x / 310 + p1) + 0.3 * Math.sin(x / 130 + p2) + 0.15 * Math.sin(x / 47 + p3)) - amp * 0.35;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d;
};

/** Layered mountain silhouettes. Far layers lighter (haze), each with a gold rim facing `glowX`. */
export const Mountains: React.FC<{ id: string; w: number; h: number; base: number; amp?: number; glowX?: number; seed?: number; rim?: number }> = ({ id, w, h, base, amp = 140, glowX = w * 0.7, seed = 11, rim = 1 }) => {
  const layers = [
    { off: -70, a: amp * 1.15, fill: "#1c3a8e", rimO: 0.55 },
    { off: 0, a: amp * 0.9, fill: "#13296a", rimO: 0.35 },
    { off: 80, a: amp * 0.6, fill: "#0b1a4a", rimO: 0.2 },
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2={w} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset={Math.max(0, glowX / w - 0.45)} stopColor={GOLD_HOT} stopOpacity={0} />
          <stop offset={glowX / w} stopColor={GOLD_HOT} stopOpacity={1} />
          <stop offset={Math.min(1, glowX / w + 0.45)} stopColor={GOLD_HOT} stopOpacity={0} />
        </linearGradient>
      </defs>
      {layers.map((l, i) => {
        const d = ridge(w, base + l.off, l.a, seed + i * 7);
        return (
          <g key={i}>
            <path d={`${d} L ${w + 40} ${h + 10} L -20 ${h + 10} Z`} fill={l.fill} />
            <path d={d} stroke={`url(#${id}rim)`} strokeWidth={3} fill="none" opacity={l.rimO * rim} />
          </g>
        );
      })}
    </g>
  );
};

/** Small town at the foot of the hills: dark blocks, warm windows. */
export const Town: React.FC<{ x0: number; x1: number; y: number; seed?: number; scale?: number }> = ({ x0, x1, y, seed = 5, scale = 1 }) => {
  const r = rnd(seed);
  const els = [];
  let x = x0;
  let k = 0;
  while (x < x1) {
    const bw = (26 + r() * 40) * scale, bh = (30 + r() * 90) * scale;
    els.push(<rect key={`b${k}`} x={x} y={y - bh} width={bw} height={bh + 4} fill="#081436" />);
    for (let wy = y - bh + 8 * scale; wy < y - 10 * scale; wy += 14 * scale)
      for (let wx = x + 6 * scale; wx < x + bw - 8 * scale; wx += 12 * scale)
        if (r() > 0.62) els.push(<rect key={`w${k}_${wx}_${wy}`} x={wx} y={wy} width={4 * scale} height={6 * scale} fill={r() > 0.25 ? ORANGE_HOT : GOLD_HOT} opacity={0.65 + 0.35 * r()} />);
    x += bw + (2 + r() * 10) * scale;
    k++;
  }
  return <g>{els}</g>;
};

/** Foreground hill (where the hero stands) with a warm rim on its crest. */
export const Hill: React.FC<{ id: string; w: number; h: number; cx: number; top: number; rimO?: number }> = ({ id, w, h, cx, top, rimO = 0.8 }) => {
  const d = `M -20 ${top + 160} Q ${cx - 420} ${top + 10} ${cx} ${top} Q ${cx + 520} ${top - 6} ${w + 40} ${top + 190}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}hr`} x1={cx - 600} y1="0" x2={cx + 600} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD_HOT} stopOpacity={0} />
          <stop offset="0.6" stopColor={GOLD_HOT} stopOpacity={1} />
          <stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w + 40} ${h + 20} L -20 ${h + 20} Z`} fill="#050d2c" />
      <path d={d} stroke={`url(#${id}hr)`} strokeWidth={4} fill="none" opacity={rimO} />
    </g>
  );
};

/** Hot light beam (line with soft bloom) – e.g. the "2022" mark. `id` must be unique per frame. */
export const Beam: React.FC<{ id: string; x1: number; y1: number; x2: number; y2: number; w?: number; o?: number; color?: string }> = ({ id, x1, y1, x2, y2, w = 8, o = 1, color = GOLD_HOT }) => (
  <g opacity={o} strokeLinecap="round">
    <defs>
      <filter id={`${id}bl`} filterUnits="userSpaceOnUse" x={Math.min(x1, x2) - 200} y={Math.min(y1, y2) - 200} width={Math.abs(x2 - x1) + 400} height={Math.abs(y2 - y1) + 400}><feGaussianBlur stdDeviation={w * 2.2} /></filter>
    </defs>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ORANGE_HOT} strokeWidth={w * 5} opacity={0.55} filter={`url(#${id}bl)`} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff6dc" strokeWidth={w * 0.4} />
  </g>
);

export { C };
