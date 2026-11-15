// L01 thumbnail: "SCHON ÜBERHOLT?" + the glowing Pegel overflowing its gold 2022 mark, tiny hero looking up.
import React from "react";
import { Thumb } from "../../lib/docu/Thumb";
import { Figure } from "../../lib/docu/Figure";
import { C, FONT } from "../../lib/docu/theme";
import { Gauge } from "./Leitmotiv";

export const L01Thumb: React.FC = () => (
  <Thumb lines={["Schon", "überholt?"]}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="l01tg"><stop offset="0" stopColor={C.tech} stopOpacity={0.55} /><stop offset="1" stopColor={C.tech} stopOpacity={0} /></radialGradient>
        <radialGradient id="l01gg"><stop offset="0" stopColor="#fff3cf" stopOpacity={0.5} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={0} y={930} width={1920} height={150} fill="#0b1a48" />
      <circle cx={1450} cy={420} r={520} fill="url(#l01tg)" />
      <Gauge id="th" x={1450} y={930} f={20} h={800} w={150} level={92} mark={{ v: 45, text: "", o: 1 }} />
      <rect x={1250} y={540} width={360} height={10} fill={C.gold} />
      <circle cx={1700} cy={545} r={150} fill="url(#l01gg)" />
      <text x={1640} y={565} fontFamily={FONT.serif} fontSize={86} fill={C.gold}>2022</text>
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={1450 + (i % 2 ? 1 : -1) * (95 + i * 12)} cy={170 + i * 70} r={9} fill={C.tech} opacity={0.8 - i * 0.12} />)}
      <Figure x={1180} y={935} h={150} kind="hero" light={1} />
    </svg>
  </Thumb>
);
