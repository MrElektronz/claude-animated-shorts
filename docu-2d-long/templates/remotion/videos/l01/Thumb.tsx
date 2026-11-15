// L01 thumbnail v2: starry sky, mountains with gold rim, hot horizon glow behind the overflowing Pegel,
// a hot gold "2022" beam the water has already passed, warm town windows, orange hero on a gold-rimmed hill.
import React from "react";
import { Thumb } from "../../lib/docu/Thumb";
import { Figure } from "../../lib/docu/Figure";
import { FONT } from "../../lib/docu/theme";
import { NightSky, HorizonGlow, Mountains, Town, Hill, Beam, GOLD_HOT, ORANGE_HOT } from "../../lib/docu/Scenery";
import { Gauge } from "./Leitmotiv";

export const L01Thumb: React.FC = () => {
  const gx = 1480;
  return (
    <Thumb lines={["Schon", "überholt?"]}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="l01hero"><stop offset="0" stopColor={ORANGE_HOT} stopOpacity={0.55} /><stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} /></radialGradient>
          <radialGradient id="l01top"><stop offset="0" stopColor="#fff2cc" stopOpacity={0.85} /><stop offset="0.35" stopColor={GOLD_HOT} stopOpacity={0.45} /><stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} /></radialGradient>
          <radialGradient id="l01lbl"><stop offset="0" stopColor="#fff1c8" stopOpacity={0.6} /><stop offset="1" stopColor={GOLD_HOT} stopOpacity={0} /></radialGradient>
        </defs>
        <NightSky id="ts" w={1920} h={1080} horizon={800} stars={190} />
        <HorizonGlow id="tg" x={1120} y={830} r={560} />
        <Mountains id="tm" w={1920} h={1080} base={790} amp={150} glowX={1120} />
        <Town x0={1080} x1={1940} y={930} />
        <Gauge id="th" x={gx} y={980} f={20} h={860} w={160} level={93} />
        {/* overflow: cyan drops + gold sparks */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={gx + (i % 2 ? 1 : -1) * (105 + i * 14)} cy={150 + i * 62} r={i % 3 === 0 ? 10 : 7} fill={i % 2 ? GOLD_HOT : "#9fe0ff"} opacity={0.9 - i * 0.1} />
        ))}
        <Beam id="tb" x1={760} y1={575} x2={1920} y2={575} w={11} />
        <ellipse cx={1720} cy={520} rx={210} ry={90} fill="url(#l01lbl)" />
        <text x={1640} y={545} fontFamily={FONT.serif} fontSize={96} fill="#ffe7a8" style={{ filter: "drop-shadow(0 0 18px rgba(255,190,90,0.9))" }}>2022</text>
        {/* hot overflow at the top of the Pegel (additive) */}
        <g style={{ mixBlendMode: "screen" }}>
          <ellipse cx={gx} cy={190} rx={260} ry={150} fill="url(#l01top)" />
        </g>
        <Hill id="thl" w={1920} h={1080} cx={1060} top={935} />
        <ellipse cx={1060} cy={860} rx={120} ry={130} fill="url(#l01hero)" />
        <Figure x={1060} y={938} h={175} kind="hero" light={1} />
      </svg>
    </Thumb>
  );
};
