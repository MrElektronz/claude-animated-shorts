// Look v2 demo (after L01 feedback): a PLACE instead of a slide. Parallax night backdrop, topic props (city, pylons,
// road), ONE emissive warm focus object that lights the frame, hero with warm halo, pixel-snapped slow camera.
// Frame 0-149: scene. Frame 150-299: original-footage quote over the dimmed scene (test clip).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, Layer, camAt } from "../../lib/docu/Stage";
import { NightSky, HorizonGlow, Mountains, Hill } from "../../lib/docu/Scenery";
import { Parallax, Emissive, Building, Pylon, Moon, Road, Bloom, Spot } from "../../lib/docu/Setpieces";
import { FootageQuote, ClipInfo } from "../../lib/docu/Footage";
import { Figure } from "../../lib/docu/Figure";
import { Label, ChapterTag } from "../../lib/docu/Text";
import { C, FONT } from "../../lib/docu/theme";
import { ramp } from "../../lib/docu/anim";

export const LOOK_V2_FRAMES = 300;

const CLIP: ClipInfo = {
  id: "demo", file: "clips/demo/demo.mp4", startF: 165, durF: 120,
  who: "Vorname Nachname", role: "Rolle · Organisation", event: "Anlass · 1.1.2026", label: "Firmenangabe · eigene Zahl", translated: true,
};

export const LookV2: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, [{ f: 0, x: 960, y: 560, zoom: 1.0 }, { f: 120, x: 1010, y: 545, zoom: 1.04 }], 0);
  const camC = { ...cam, x: cam.x + 10 * Math.sin(f / 310), y: cam.y + 5 * Math.sin(f / 270) };
  const lit = ramp(f, 20, 40);
  const win = 0.15 + 0.6 * ramp(f, 40, 90);
  const world = (
    <>
      {/* far: sky + stars + moon (moves least) */}
      <Parallax depth={0.85}>
        <Layer x={-400} y={-300} w={2800} h={1500}>
          <NightSky id="lv2s" w={2800} h={1500} horizon={1050} stars={260} seed={4} twinkle={f} />
          <Moon x={1900} y={200} r={20} />
        </Layer>
      </Parallax>
      {/* mid-far: mountains with gold rim facing the focus light */}
      <Parallax depth={0.5}>
        <Layer x={-400} y={0} w={2800} h={1200}>
          <HorizonGlow id="lv2g" x={1500} y={760} r={520} o={0.55 + 0.45 * lit} />
          <Mountains id="lv2m" w={2800} h={1200} base={720} amp={120} glowX={1500} seed={8} />
        </Layer>
      </Parallax>
      {/* mid: the topic's place - a city whose windows switch on, power pylons */}
      <Parallax depth={0.2}>
        <Layer x={-300} y={0} w={2600} h={1200}>
          {[[-200, 150, 260], [-20, 120, 330], [130, 170, 210], [330, 140, 380], [500, 120, 250], [1880, 150, 300], [2060, 130, 420], [2220, 170, 240]].map(([x, w, h], i) => (
            <Building key={i} x={x} y={800} w={w} h={h} lit={win} seed={i + 3} />
          ))}
          <Pylon x={720} y={800} h={260} o={0.8} />
          <Pylon x={1700} y={800} h={230} o={0.7} />
          <path d="M 720 560 Q 1210 640 1700 590" stroke={C.bgLift} strokeWidth={2} fill="none" opacity={0.8} />
        </Layer>
      </Parallax>
      {/* near: hill, road, spot onto the hero */}
      <Layer x={-300} y={0} w={2600} h={1300}>
        <Hill id="lv2h" w={2600} h={1300} cx={960} top={850} />
        <Road x0={-100} y0={1150} cx={700} cy={860} x1={1260} y1={872} draw={ramp(f, 10, 60)} />
        <Spot id="lv2sp" x={760} top={0} floorY={870} spread={300} o={0.5 * lit} />
      </Layer>
      {/* the ONE emissive focus object: lights the frame */}
      <Emissive x={1260} y={420} w={300} h={360} shape="tag" hangTo={-200} floorY={870} on={lit}>
        <div style={{ fontFamily: FONT.serif, fontSize: 120, lineHeight: 1, marginTop: 60, opacity: lit }}>93 %</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", marginTop: 10, color: "#5b4a2a", opacity: lit }}>DER TÄTIGKEITEN</div>
      </Emissive>
      <Label x={1450} y={300} text="Ersetzbarkeit 2022" sub={["SUBSTITUIERBARKEIT · IAB 2024"]} inF={50} />
      <Bloom x={760} y={800} r={110} o={0.55} />
      <Layer>
        <Figure x={760} y={872} h={170} kind="hero" light={1} />
        <Figure x={560} y={880} h={140} kind="crowd" />
        <Figure x={980} y={884} h={130} kind="crowd" />
      </Layer>
    </>
  );
  const overlay = (
    <>
      <ChapterTag text="Wer zuerst?" inF={10} />
      <FootageQuote clip={CLIP} />
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={camC} world={world} overlay={overlay} />
    </AbsoluteFill>
  );
};
