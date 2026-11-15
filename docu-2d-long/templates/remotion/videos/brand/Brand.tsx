// Channel branding for the long-form channel: profile picture (800x800, shown as a circle) and banner (2560x1440,
// everything important inside the 1546x423 centre safe area). Same look as the videos: navy night, hot gold accent,
// orange hero. TITLE/TAGLINE are placeholders until the channel name is decided.
import React from "react";
import { AbsoluteFill } from "remotion";

const Halo: React.FC<{ id: string; x: number; y: number; rx: number; ry: number; o?: number }> = ({ id, x, y, rx, ry, o = 0.55 }) => (
  <g>
    <defs><radialGradient id={id}><stop offset="0" stopColor="#ff9a3c" stopOpacity={o} /><stop offset="1" stopColor="#ff9a3c" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} />
  </g>
);
import { Figure } from "../../lib/docu/Figure";
import { C, FONT } from "../../lib/docu/theme";
import { NightSky, HorizonGlow, Mountains, Town, Hill, Beam, GOLD_HOT, ORANGE_HOT } from "../../lib/docu/Scenery";

export const BANNER_TITLE = "KI & Zukunft";
export const BANNER_TAGLINE = "Ruhig erklärt. Mit Zahlen statt Hype.";

const Pegel: React.FC<{ x: number; y: number; h: number; w: number; level: number; id: string }> = ({ x, y, h, w, level, id }) => {
  const top = y - h, wy = y - (h * level) / 100;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f3ff" />
          <stop offset="0.2" stopColor={C.tech} />
          <stop offset="1" stopColor={C.techDeep} />
        </linearGradient>
      </defs>
      <rect x={x - w / 2} y={top} width={w} height={h} rx={w * 0.18} fill="#071233" stroke={C.cream} strokeWidth={Math.max(3, w * 0.06)} />
      <rect x={x - w / 2 + w * 0.08} y={wy} width={w * 0.84} height={y - wy - w * 0.08} rx={w * 0.1} fill={`url(#${id}w)`} />
    </g>
  );
};

/** Profile picture: orange hero on a gold-rimmed hill, looking at a glowing Pegel that has passed the gold line. */
export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: C.bgDeep }}>
    <svg width={800} height={800}>
      <NightSky id="as" w={800} h={800} horizon={560} stars={60} seed={9} />
      <HorizonGlow id="ag" x={505} y={560} r={360} />
      <Mountains id="am" w={800} h={800} base={560} amp={70} glowX={505} seed={4} />
      <Pegel id="ap" x={505} y={640} h={420} w={120} level={88} />
      <Beam id="ab" x1={150} y1={420} x2={700} y2={420} w={10} />
      <Hill id="ah" w={800} h={800} cx={330} top={640} />
      <Halo id="aha" x={330} y={540} rx={150} ry={170} />
      <Figure x={330} y={644} h={230} kind="hero" light={1} />
    </svg>
  </AbsoluteFill>
);

/** Banner 2560x1440. Safe area (all devices): x 507-2053, y 508-931. */
export const ChannelBanner: React.FC = () => (
  <AbsoluteFill style={{ background: C.bgDeep }}>
    <svg width={2560} height={1440} style={{ position: "absolute" }}>
      <NightSky id="bs" w={2560} h={1440} horizon={880} stars={320} seed={21} />
      <HorizonGlow id="bg" x={1760} y={880} r={520} />
      <Mountains id="bm" w={2560} h={1440} base={860} amp={110} glowX={1760} seed={17} />
      <Town x0={1480} x1={2300} y={905} seed={8} scale={0.85} />
      {[1600, 1730, 1860, 1990].map((x, i) => <Pegel key={x} id={`bp${i}`} x={x} y={903} h={120 + i * 70} w={54} level={40 + i * 17} />)}
      <Beam id="bb" x1={560} y1={744} x2={1500} y2={744} w={6} />
      <Hill id="bh" w={2560} h={1440} cx={1420} top={905} rimO={0.9} />
      <Halo id="bha" x={1420} y={845} rx={90} ry={100} />
      <Figure x={1420} y={908} h={110} kind="hero" light={1} />
    </svg>
    <div style={{ position: "absolute", left: 560, top: 560, width: 900 }}>
      <div style={{ fontFamily: FONT.poster, fontSize: 150, lineHeight: 1.05, color: C.paper, textTransform: "uppercase", textShadow: "0 0 40px rgba(243,233,198,0.45), 0 6px 18px rgba(0,0,0,0.5)" }}>{BANNER_TITLE}</div>
      <div style={{ marginTop: 52, fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: GOLD_HOT, textTransform: "uppercase", textShadow: "0 0 18px rgba(255,170,60,0.5)" }}>{BANNER_TAGLINE}</div>
    </div>
  </AbsoluteFill>
);
