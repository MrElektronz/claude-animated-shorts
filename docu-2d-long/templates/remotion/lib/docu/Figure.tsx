import React from "react";
import { C } from "./theme";

export type FigureKind = "hero" | "crowd" | "elder" | "child" | "worker";

/**
 * Faceless silhouette person, anchored at the feet (x, y), `h` = full height in px.
 * Long soft coat, round head, no face, no outline: shape + two-tone light from above (lamp side `light` = -1 left / 1 right).
 * `walk` = phase in cycles (e.g. frame / 18); 0 keeps the figure standing.
 * The hero ("Du-Figur") is the only warm-coloured person on screen.
 */
export const Figure: React.FC<{
  x: number;
  y: number;
  h: number;
  kind?: FigureKind;
  walk?: number;
  light?: number;
  opacity?: number;
  facing?: 1 | -1;
}> = ({ x, y, h, kind = "crowd", walk = 0, light = -1, opacity = 1, facing = 1 }) => {
  const s = h / 300; // design height 300
  const id = `fig${kind}${Math.round(x)}${Math.round(y)}`;
  const coat = kind === "hero" ? [C.heroLight, C.hero, C.heroShade] : kind === "worker" ? ["#4a6ab8", "#2c4a92", "#1a2e66"] : [C.crowdLight, C.crowd, "#121f4a"];
  const walking = walk !== 0;
  const ph = walk * Math.PI * 2;
  const swing = walking ? Math.sin(ph) * 14 : 0;
  const bob = walking ? Math.abs(Math.cos(ph)) * 4 : 0;
  const child = kind === "child";
  const headR = child ? 30 : 24;
  const coatTop = child ? 150 : 92;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s}) translate(0 ${-bob})`} opacity={opacity}>
      <defs>
        <linearGradient id={`${id}c`} x1={light < 0 ? "0" : "1"} y1="0" x2={light < 0 ? "1" : "0"} y2="1">
          <stop offset="0" stopColor={coat[0]} />
          <stop offset="0.45" stopColor={coat[1]} />
          <stop offset="1" stopColor={coat[2]} />
        </linearGradient>
        <radialGradient id={`${id}s`}>
          <stop offset="0" stopColor="#000" stopOpacity={0.45} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* contact shadow */}
      <ellipse cx={0} cy={bob} rx={46} ry={9} fill={`url(#${id}s)`} />
      {/* legs */}
      <rect x={-17 + swing * 0.5} y={-62} width={13} height={62} rx={6} fill="#0d173c" transform={`rotate(${swing * 0.6} -10 -62)`} />
      <rect x={4 - swing * 0.5} y={-62} width={13} height={62} rx={6} fill="#0b1434" transform={`rotate(${-swing * 0.6} 10 -62)`} />
      {/* coat */}
      <path
        d={`M ${-30} ${-300 + coatTop + 40}
            Q ${-36} ${-300 + coatTop} ${-12} ${-300 + coatTop - 6}
            L ${12} ${-300 + coatTop - 6}
            Q ${36} ${-300 + coatTop} ${30} ${-300 + coatTop + 40}
            L ${44} ${-54} Q ${0} ${-44} ${-44} ${-54} Z`}
        fill={`url(#${id}c)`}
      />
      {/* arm hint */}
      <path d={`M ${-26} ${-300 + coatTop + 30} Q ${-40 - swing * 0.4} ${-150} ${-30 - swing * 0.6} ${-110}`} stroke={coat[2]} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
      {/* head */}
      {kind === "hero" ? (
        <>
          <circle cx={0} cy={-300 + coatTop - 34} r={headR} fill={C.skin} />
          {/* scarf: hero identifier */}
          <path d={`M -20 ${-300 + coatTop - 10} Q 0 ${-300 + coatTop + 2} 20 ${-300 + coatTop - 10} L 18 ${-300 + coatTop + 4} Q 0 ${-300 + coatTop + 14} -18 ${-300 + coatTop + 4} Z`} fill={C.cream} />
          <path d={`M 10 ${-300 + coatTop + 2} L 16 ${-300 + coatTop + 48} L 4 ${-300 + coatTop + 46} Z`} fill={C.cream} opacity={0.9} />
        </>
      ) : (
        <>
          <circle cx={0} cy={-300 + coatTop - 34} r={headR} fill={C.skin} />
          {kind === "elder" && <path d={`M ${-headR} ${-300 + coatTop - 36} A ${headR} ${headR} 0 0 1 ${headR} ${-300 + coatTop - 36} Z`} fill={C.hairWhite} />}
          {/* rim of lamp light on the head */}
          <path d={`M ${-headR * 0.8} ${-300 + coatTop - 50} A ${headR} ${headR} 0 0 1 ${headR * 0.8} ${-300 + coatTop - 50}`} stroke={coat[0]} strokeWidth={3} fill="none" opacity={0.6} />
        </>
      )}
    </g>
  );
};
