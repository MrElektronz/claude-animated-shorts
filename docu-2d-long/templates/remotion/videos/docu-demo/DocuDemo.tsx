// Look demo for the docu-2d-long skill: every building block once, 24 s, 1920x1080.
// Numbers here are placeholders (marked DEMO); a real video takes every number from SOURCES.md.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, Room, Lamp, Layer, camAt } from "../../lib/docu/Stage";
import { Figure } from "../../lib/docu/Figure";
import { Label, SerifNumber, Placard, ChapterTag, QuoteCard, Captions, DrawPath } from "../../lib/docu/Text";
import { ramp, Word } from "../../lib/docu/anim";
import { C } from "../../lib/docu/theme";

export const DOCU_DEMO_FRAMES = 720;

const TEXT =
  "Stell dir vor, du sitzt an deinem Schreibtisch. Gleiches Büro, gleicher Kaffee. Aber die Hälfte deiner Aufgaben erledigt inzwischen eine Maschine. " +
  "Wer ist zuerst dran? Schauen wir uns die Kurve an. Die Menschen werden jedes Jahr ein bisschen produktiver. Die Maschinen nicht ein bisschen. " +
  "Und genau das hat jemand schon vor Jahren aufgeschrieben.";
// Fake timings at 2.4 words/s for the demo; real videos use voice/words.json.
const WORDS: Word[] = (() => {
  let t = 0.8;
  return TEXT.split(" ").map((w) => {
    const d = 0.18 + w.length * 0.035;
    const x = { word: w, start: t, end: t + d };
    t += d + (/[.?]$/.test(w) ? 0.45 : 0.06);
    return x;
  });
})();

const HORIZON = 640;
const CHART = { x0: 2380, x1: 3420, y0: 780, y1: 360 };

export const DocuDemo: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, [
    { f: 0, x: 960, y: 260, zoom: 1.35 },
    { f: 20, x: 960, y: 260, zoom: 1.35 },
    { f: 75, x: 960, y: 540, zoom: 1.0 },
    { f: 230, x: 960, y: 540, zoom: 1.04 },
    { f: 290, x: 2900, y: 560, zoom: 1.0 },
    { f: 700, x: 2900, y: 560, zoom: 1.06 },
  ]);
  const lampOn = 1 - 0.7 * ramp(f, 150, 20);
  const walk = f > 100 && f < 230 ? (f - 100) / 20 : 0;

  // chart paths
  const human = `M ${CHART.x0} ${CHART.y0 - 40} C ${CHART.x0 + 400} ${CHART.y0 - 90}, ${CHART.x0 + 800} ${CHART.y0 - 150}, ${CHART.x1} ${CHART.y0 - 200}`;
  const machine = `M ${CHART.x0} ${CHART.y0 - 10} C ${CHART.x0 + 600} ${CHART.y0 - 20}, ${CHART.x0 + 900} ${CHART.y0 - 120}, ${CHART.x1 - 40} ${CHART.y1 - 120}`;

  const world = (
    <>
      <Room horizon={HORIZON} lanes={0} />
      {/* back panel behind the crowd: the one warm-lit surface of scene 1 */}
      <Layer>
        <defs>
          <radialGradient id="panel" cx="0.5" cy="1" r="0.9">
            <stop offset="0" stopColor="#f1e2b0" stopOpacity={0.35 + 0.6 * lampOn} />
            <stop offset="0.55" stopColor={C.gold} stopOpacity={0.25 + 0.55 * lampOn} />
            <stop offset="1" stopColor="#6e5c3e" stopOpacity={0.3 + 0.5 * lampOn} />
          </radialGradient>
        </defs>
        <path d={`M 560 ${HORIZON} A 400 400 0 0 1 1360 ${HORIZON} Z`} fill="url(#panel)" stroke={C.line} strokeWidth={2} opacity={0.9} />
      </Layer>
      <Lamp x={960} y={170} floorY={HORIZON + 140} on={lampOn} />
      <Layer>
        <Figure x={620} y={HORIZON + 120} h={200} kind="elder" />
        <Figure x={820} y={HORIZON + 150} h={215} kind="crowd" walk={walk * 0.9} />
        <Figure x={1080} y={HORIZON + 140} h={215} kind="hero" light={-1} walk={walk} />
        <Figure x={1330} y={HORIZON + 120} h={120} kind="child" />
      </Layer>
      <Placard x={620} y={HORIZON + 210} text="1960" />
      <Placard x={830} y={HORIZON + 210} text="1985" />
      <Placard x={1080} y={HORIZON + 210} text="DU" serif={false} />
      <Placard x={1330} y={HORIZON + 210} text="2015" />

      {/* chart set to the right */}
      <Layer>
        <line x1={CHART.x0} y1={CHART.y0} x2={CHART.x1} y2={CHART.y0} stroke={C.line} strokeWidth={2} opacity={ramp(f, 270, 15)} />
        <line x1={CHART.x0} y1={CHART.y0} x2={CHART.x0} y2={CHART.y1 - 160} stroke={C.line} strokeWidth={2} opacity={ramp(f, 270, 15) * 0.6} />
        <DrawPath d={human} inF={300} dur={50} color={C.cream} width={4} />
        <DrawPath d={machine} inF={380} dur={70} color={C.tech} width={4} glow />
        <Figure x={CHART.x0 + 120} y={CHART.y0 - 4} h={90} kind="hero" />
      </Layer>
      <Label x={CHART.x0} y={CHART.y1 - 170} text="Produktivität pro Stunde" sub={["DEMO · PLATZHALTER", "INDEX 2000 = 100"]} inF={275} />
      <Label x={CHART.x1 + 20} y={CHART.y0 - 230} text="Mensch" sub={["+1 % PRO JAHR · DEMO"]} inF={340} color={C.cream} />
      <Label x={CHART.x1 - 20} y={CHART.y1 - 160} text="Maschine" sub={["DEMO-WERT"]} inF={440} color={C.tech} />
      <SerifNumber x={CHART.x1 - 300} y={CHART.y1 - 70} value={12} from={1} countF={40} inF={450} size={120} format={(n) => `×${Math.round(n)}`} color={C.cream} />
    </>
  );

  const overlay = (
    <>
      <ChapterTag text="Wer ist zuerst dran?" inF={160} />
      <QuoteCard x={960} y={300} quote="Was sich automatisieren lässt, wird automatisiert. Die Frage ist nur, wann." who="Beispiel-Zitat · Demo" source="Platzhalter · Quelle immer angeben" inF={560} />
      <Captions words={WORDS} />
    </>
  );

  return <Stage cam={cam} world={world} overlay={overlay} glow={{ x: 960, y: 520, r: 900, o: 0.35 }} />;
};

// Demo thumbnail (Still): 2-4 words, one glowing gold object, the small hero looking at it.
import { Thumb } from "../../lib/docu/Thumb";
export const DocuThumb: React.FC = () => (
  <Thumb lines={["Wer ist", "zuerst dran?"]}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="tg"><stop offset="0" stopColor="#fff3cf" /><stop offset="0.4" stopColor={C.gold} stopOpacity={0.6} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
        <linearGradient id="tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1c4" /><stop offset="1" stopColor="#c99a4a" /></linearGradient>
      </defs>
      {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 977) % 1920} cy={(i * 431) % 560} r={i % 5 === 0 ? 2.2 : 1.2} fill="#dfe6ff" opacity={0.25 + (i % 4) * 0.12} />)}
      <rect x={0} y={900} width={1920} height={180} fill="#0b1a48" />
      <circle cx={1500} cy={560} r={380} fill="url(#tg)" />
      <rect x={1360} y={420} width={280} height={280} rx={26} fill="url(#tb)" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={1385 + i * 36} y={395} width={14} height={30} rx={4} fill="#e9c97c" />)}
      {Array.from({ length: 7 }, (_, i) => <rect key={"b" + i} x={1385 + i * 36} y={695} width={14} height={30} rx={4} fill="#c99a4a" />)}
      <Figure x={1050} y={905} h={170} kind="hero" light={1} />
    </svg>
  </Thumb>
);
