// L02 thumbnail: "40 STUNDEN. WOFÜR?" – the house with 40 hot windows on the right third (the one glowing object),
// hot horizon glow behind it, the tiny orange hero looking up at it from the street.
import React from "react";
import { Thumb } from "../../lib/docu/Thumb";
import { Figure } from "../../lib/docu/Figure";
import { NightSky, HorizonGlow, Mountains, Town, GOLD_HOT, ORANGE_HOT } from "../../lib/docu/Scenery";
import { House } from "./Leitmotiv";

export const L02Thumb: React.FC = () => (
  <Thumb lines={["40 Stunden.", "Wofür?"]}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="t2hero"><stop offset="0" stopColor={ORANGE_HOT} stopOpacity={0.55} /><stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} /></radialGradient>
        <radialGradient id="t2house"><stop offset="0" stopColor="#fff2cc" stopOpacity={0.55} /><stop offset="0.4" stopColor={GOLD_HOT} stopOpacity={0.3} /><stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} /></radialGradient>
      </defs>
      <NightSky id="t2s" w={1920} h={1080} horizon={820} stars={200} seed={4} />
      <HorizonGlow id="t2g" x={1450} y={860} r={620} />
      <Mountains id="t2m" w={1920} h={1080} base={820} amp={130} glowX={1450} seed={9} />
      <Town x0={-20} x1={1000} y={990} seed={7} />
      <g style={{ mixBlendMode: "screen" }}>
        <ellipse cx={1450} cy={560} rx={560} ry={520} fill="url(#t2house)" />
      </g>
      <g transform="translate(1450 1000) scale(1.42) translate(-1450 -1000)">
        <House id="t2h" x={1450} y={1000} w={420} lit={40} door={1} attic={1} atticR={34} />
      </g>
      <rect x={0} y={998} width={1920} height={90} fill="#040b26" />
      <ellipse cx={1020} cy={930} rx={110} ry={120} fill="url(#t2hero)" />
      <Figure x={1020} y={1000} h={165} kind="hero" light={1} />
    </svg>
  </Thumb>
);
