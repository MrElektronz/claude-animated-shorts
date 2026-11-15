import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, W, H } from "./theme";
import { keys } from "./anim";

export type Cam = { x: number; y: number; zoom: number; rot?: number };
export type CamKey = { f: number; x: number; y: number; zoom: number; rot?: number };

/** Camera from keys + a constant creep push-in (no hold is ever fully static; reference creeps ~0.02 %/f). */
export function camAt(f: number, ks: CamKey[], creep = 0.00025): Cam {
  return {
    x: keys(f, ks.map((k) => ({ f: k.f, v: k.x }))),
    y: keys(f, ks.map((k) => ({ f: k.f, v: k.y }))),
    zoom: keys(f, ks.map((k) => ({ f: k.f, v: k.zoom }))) * (1 + creep * f),
    rot: keys(f, ks.map((k) => ({ f: k.f, v: k.rot ?? 0 }))),
  };
}

/**
 * The frame: background gradient, camera-transformed world, fixed overlay (captions, chapter tag), grain, vignette.
 * World coordinates: 1920x1080 base canvas, (960,540) = centre; sets may extend beyond it.
 */
export const Stage: React.FC<{
  cam: Cam;
  world: React.ReactNode;
  overlay?: React.ReactNode;
  glow?: { x: number; y: number; r: number; o: number }; // world-space back glow behind the subject
  grain?: number;
}> = ({ cam, world, overlay, glow, grain = 0.07 }) => {
  const f = useCurrentFrame();
  const t = `translate(${W / 2}px, ${H / 2}px) rotate(${cam.rot ?? 0}deg) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgDeep} 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: t, transformOrigin: "0 0" }}>
        {glow && (
          <div
            style={{
              position: "absolute",
              left: glow.x - glow.r,
              top: glow.y - glow.r,
              width: glow.r * 2,
              height: glow.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(60,90,170,${glow.o}) 0%, rgba(30,50,120,${glow.o * 0.4}) 40%, rgba(0,0,0,0) 70%)`,
            }}
          />
        )}
        {world}
      </div>
      <Grain f={f} amount={grain} />
      <Vignette />
      {overlay}
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{ background: `radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,6,22,${strength}) 100%)`, pointerEvents: "none" }}
  />
);

/** Fine film grain; the reference gradients are dithered/noisy, never clean banding. Seed changes every 2 f. */
export const Grain: React.FC<{ f: number; amount: number }> = ({ f, amount }) => (
  <AbsoluteFill style={{ opacity: amount, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <svg width={W} height={H}>
      <filter id={`g${Math.floor(f / 2) % 8}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter={`url(#g${Math.floor(f / 2) % 8})`} />
    </svg>
  </AbsoluteFill>
);

/** Absolutely positioned SVG layer in world space (use for shapes). */
export const Layer: React.FC<{ children: React.ReactNode; w?: number; h?: number; x?: number; y?: number; style?: React.CSSProperties }> = ({
  children,
  w = W,
  h = H,
  x = 0,
  y = 0,
  style,
}) => (
  <svg width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} style={{ position: "absolute", left: x, top: y, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/** The stage set: back wall, a lit floor band with a cream lip, optional perspective lane lines. */
export const Room: React.FC<{ horizon: number; x0?: number; x1?: number; lanes?: number; vanishX?: number; laneOpacity?: number; floorBottom?: number }> = ({
  horizon,
  x0 = -1200,
  x1 = 5200,
  lanes = 0,
  vanishX = 960,
  laneOpacity = 1,
  floorBottom = 1600,
}) => {
  const id = `room${horizon}`;
  const laneLines = [];
  for (let i = 0; i < lanes; i++) {
    const bx = vanishX + (i - (lanes - 1) / 2) * 340;
    laneLines.push(<line key={i} x1={vanishX + (i - (lanes - 1) / 2) * 60} y1={horizon} x2={bx} y2={horizon + 260} stroke={C.line} strokeWidth={2} opacity={laneOpacity * 0.8} />);
  }
  return (
    <Layer x={x0} y={horizon - 1400} w={x1 - x0} h={floorBottom + 1400 - horizon + 400}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bgDeep} />
          <stop offset="1" stopColor={C.wall} />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22397a" />
          <stop offset="0.35" stopColor={C.floor} />
          <stop offset="0.8" stopColor="#0f1f50" />
          <stop offset="1" stopColor={C.bgDeep} />
        </linearGradient>
      </defs>
      <rect x={x0} y={horizon - 1400} width={x1 - x0} height={1400} fill={`url(#${id}w)`} />
      <rect x={x0} y={horizon} width={x1 - x0} height={floorBottom - horizon} fill={`url(#${id}f)`} />
      <rect x={x0} y={horizon - 2} width={x1 - x0} height={3} fill={C.floorEdge} opacity={0.7} />
      {laneLines}
    </Layer>
  );
};

/** Hanging lamp with a soft volumetric cone and a light pool. `on` 0..1 animates the light. */
export const Lamp: React.FC<{ x: number; y: number; floorY: number; spread?: number; on?: number }> = ({ x, y, floorY, spread = 520, on = 1 }) => {
  const id = `lamp${Math.round(x)}_${Math.round(y)}`;
  return (
    <Layer>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cream} stopOpacity={0.42 * on} />
          <stop offset="1" stopColor={C.cream} stopOpacity={0.02 * on} />
        </linearGradient>
        <radialGradient id={`${id}p`}>
          <stop offset="0" stopColor={C.cream} stopOpacity={0.55 * on} />
          <stop offset="1" stopColor={C.cream} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}b`}>
          <stop offset="0" stopColor="#fff8e0" stopOpacity={on} />
          <stop offset="0.35" stopColor={C.cream} stopOpacity={0.6 * on} />
          <stop offset="1" stopColor={C.cream} stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
      </defs>
      <line x1={x} y1={y - 900} x2={x} y2={y - 40} stroke="#0a1230" strokeWidth={4} />
      <polygon points={`${x - 70},${y} ${x + 70},${y} ${x + spread},${floorY} ${x - spread},${floorY}`} fill={`url(#${id}c)`} filter={`url(#${id}blur)`} />
      <ellipse cx={x} cy={floorY + 10} rx={spread * 0.9} ry={46} fill={`url(#${id}p)`} />
      <path d={`M ${x - 110} ${y} Q ${x - 100} ${y - 70} ${x} ${y - 74} Q ${x + 100} ${y - 70} ${x + 110} ${y} Z`} fill="#16244f" stroke="#2c3c6e" strokeWidth={2} />
      <ellipse cx={x} cy={y} rx={110} ry={13} fill={on > 0.05 ? C.cream : "#1d2a55"} opacity={0.35 + 0.65 * on} />
      <circle cx={x} cy={y + 6} r={70} fill={`url(#${id}b)`} />
    </Layer>
  );
};
