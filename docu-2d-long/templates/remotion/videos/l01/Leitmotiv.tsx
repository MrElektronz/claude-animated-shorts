// L01 Leitmotiv: the "Pegel" (water gauge: water = share of tasks a machine could do) and the career staircase
// (the water rises from below; the first job is the bottom step).
import React from "react";
import { C, FONT } from "../../lib/docu/theme";

export const wave = (x0: number, x1: number, y: number, f: number, amp = 3, n = 16) => {
  let d = `M ${x0} ${y}`;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    d += ` L ${x.toFixed(1)} ${(y + Math.sin(i * 0.9 + f * 0.11) * amp + Math.sin(i * 2.3 - f * 0.07) * amp * 0.4).toFixed(1)}`;
  }
  return d;
};

/** Vertical water gauge. SVG coordinates (use inside <Layer>). level / ghost / mark / today in percent (0-100). */
export const Gauge: React.FC<{
  id: string; x: number; y: number; f: number; h?: number; w?: number; level: number; o?: number;
  ghost?: { v: number; text: string; o: number }; // dashed earlier level (e.g. 2019)
  mark?: { v: number; text: string; o: number }; // gold reference line (e.g. "STAND 2022")
  today?: { v: number; o: number }; // cyan haze above the water: "HEUTE ?" (no measured value exists)
  big?: boolean;
}> = ({ id, x, y, f, h = 560, w = 96, level, o = 1, ghost, mark, today, big = true }) => {
  const top = y - h;
  const ly = (v: number) => y - (h * Math.max(0, Math.min(104, v))) / 100;
  const wy = ly(level);
  const x0 = x - w / 2, x1 = x + w / 2;
  const ticks = [];
  for (let v = 0; v <= 100; v += 10) {
    const major = v % 50 === 0;
    ticks.push(<line key={v} x1={x0 - (major ? 34 : 18)} x2={x0 - 4} y1={ly(v)} y2={ly(v)} stroke={C.line} strokeWidth={major ? 2.5 : 1.5} />);
    if (major && big) ticks.push(<text key={"t" + v} x={x0 - 44} y={ly(v) + 12} textAnchor="end" fontFamily={FONT.serif} fontSize={36} fill={C.cream}>{v}</text>);
  }
  const fs = big ? 21 : 15;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id={`${id}clip`}><rect x={x0} y={top} width={w} height={h} rx={6} /></clipPath>
        <linearGradient id={`${id}wat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.tech} stopOpacity={0.85} />
          <stop offset="0.25" stopColor={C.techDeep} stopOpacity={0.8} />
          <stop offset="1" stopColor="#123a7a" stopOpacity={0.9} />
        </linearGradient>
        <radialGradient id={`${id}glow`}><stop offset="0" stopColor={C.tech} stopOpacity={0.35} /><stop offset="1" stopColor={C.tech} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={x0 - (big ? 120 : 50)} y={top - 50} width={w + (big ? 160 : 70)} height={h + 80} rx={10} fill="#0b1a46" stroke="rgba(236,224,183,0.25)" strokeWidth={2} />
      {ticks}
      {level > 0.5 && <ellipse cx={x} cy={wy} rx={w * 1.6} ry={60} fill={`url(#${id}glow)`} />}
      <rect x={x0} y={top} width={w} height={h} rx={6} fill="#071233" />
      <g clipPath={`url(#${id}clip)`}>
        {today && today.o > 0 && <rect x={x0} y={ly(today.v)} width={w} height={Math.max(0, wy - ly(today.v))} fill={C.tech} opacity={0.22 * today.o} />}
        <path d={`${wave(x0, x1, wy, f)} L ${x1} ${y + 10} L ${x0} ${y + 10} Z`} fill={`url(#${id}wat)`} />
        <path d={wave(x0, x1, wy, f)} stroke="#c8ecff" strokeWidth={3} fill="none" />
      </g>
      <rect x={x0} y={top} width={w} height={h} rx={6} fill="none" stroke={C.cream} strokeWidth={2.5} />
      {ghost && ghost.o > 0 && (
        <g opacity={ghost.o}>
          <line x1={x0 - 6} x2={x1 + 30} y1={ly(ghost.v)} y2={ly(ghost.v)} stroke={C.cream} strokeWidth={2} strokeDasharray="8 6" />
          <text x={x1 + 38} y={ly(ghost.v) + 7} fontFamily={FONT.sans} fontWeight={700} fontSize={fs} letterSpacing="0.06em" fill={C.muted}>{ghost.text}</text>
        </g>
      )}
      {mark && mark.o > 0 && (
        <g opacity={mark.o}>
          <line x1={x0 - 10} x2={x1 + 30} y1={ly(mark.v)} y2={ly(mark.v)} stroke={C.gold} strokeWidth={4} />
          <text x={x1 + 38} y={ly(mark.v) + 8} fontFamily={FONT.sans} fontWeight={800} fontSize={fs} letterSpacing="0.06em" fill={C.gold}>{mark.text}</text>
        </g>
      )}
      {today && today.o > 0 && (
        <g opacity={today.o}>
          <line x1={x0 - 6} x2={x1 + 30} y1={ly(today.v)} y2={ly(today.v)} stroke={C.tech} strokeWidth={3} strokeDasharray="10 8" />
          <text x={x1 + 38} y={ly(today.v) + 8} fontFamily={FONT.sans} fontWeight={800} fontSize={fs} letterSpacing="0.06em" fill={C.tech}>HEUTE ?</text>
        </g>
      )}
    </g>
  );
};

/**
 * Career staircase: `n` steps rising to the right from (x0, y). `water` = water height in px above y.
 * figs(top) renders figures; top(i) = centre of step i's tread. bottomO fades step 0 (taken away), extra adds a step.
 */
export const Stairs: React.FC<{
  id: string; x0: number; y: number; f: number; n?: number; sw?: number; sh?: number; water: number; o?: number;
  bottomO?: number; extra?: number; labels?: Record<number, string>; hiBottom?: number;
  figs?: (top: (i: number) => { x: number; y: number }) => React.ReactNode;
}> = ({ id, x0, y, f, n = 6, sw = 190, sh = 78, water, o = 1, bottomO = 1, extra = 0, labels = {}, hiBottom = 0, figs }) => {
  const top = (i: number) => ({ x: x0 + i * sw + sw / 2, y: y - (i + 1) * sh });
  const total = n + (extra > 0.001 ? 1 : 0);
  const steps = [];
  for (let i = 0; i < total; i++) {
    const so = i === 0 ? bottomO : i === n ? extra : 1;
    const ty = y - (i + 1) * sh + (i === n ? (1 - extra) * 40 : 0);
    const hi = i === 0 && hiBottom > 0;
    steps.push(
      <g key={i} opacity={so}>
        <rect x={x0 + i * sw} y={ty} width={sw} height={y - ty} fill={i % 2 ? "#14275e" : "#172c66"} />
        <rect x={x0 + i * sw} y={ty} width={sw} height={5} fill={hi ? C.gold : C.cream} opacity={hi ? 0.6 + 0.4 * hiBottom : 0.75} />
        {labels[i] && (
          <text x={x0 + i * sw + sw / 2} y={ty + 40} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={17} letterSpacing="0.07em" fill={hi ? C.gold : C.muted}>{labels[i]}</text>
        )}
      </g>,
    );
  }
  const wx0 = x0 - 400, wx1 = x0 + total * sw + 400;
  const wy = y - water;
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id={`${id}sw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.tech} stopOpacity={0.55} />
          <stop offset="0.3" stopColor={C.techDeep} stopOpacity={0.5} />
          <stop offset="1" stopColor="#0b2460" stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <rect x={x0 - 400} y={y} width={total * sw + 800} height={4} fill={C.floorEdge} opacity={0.6} />
      {steps}
      {figs && figs(top)}
      {water > 0 && (
        <>
          <path d={`${wave(wx0, wx1, wy, f, 4, 40)} L ${wx1} ${y + 160} L ${wx0} ${y + 160} Z`} fill={`url(#${id}sw)`} />
          <path d={wave(wx0, wx1, wy, f, 4, 40)} stroke="#c8ecff" strokeWidth={3} fill="none" opacity={0.85} />
        </>
      )}
    </g>
  );
};
