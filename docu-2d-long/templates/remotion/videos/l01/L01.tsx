// L01 "Wie schnell KI unsere Jobs einholt" – long-form docu, 16:9, voice = the user's own recording.
// One world: 12 scene sets side by side (SCENE_X), the camera glides between them. Every cue = a spoken phrase (A()).
// Numbers: videos/L01-welcher-beruf-zuerst/SOURCES.md (F-numbers in comments).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, Lamp, Layer, Room, camAt, CamKey } from "../../lib/docu/Stage";
import { Figure } from "../../lib/docu/Figure";
import { Label, SerifNumber, Placard, ChapterTag, QuoteCard, Captions, DrawPath } from "../../lib/docu/Text";
import { ramp, life, lerp } from "../../lib/docu/anim";
import { C, FONT } from "../../lib/docu/theme";
import { A, S, ORDER, SceneId, SCENE_X, sceneEnd, WORDS, L01_FRAMES } from "./story";
import { Gauge, Stairs, wave } from "./Leitmotiv";
import { Icon, IconKind } from "./Icons";

export { L01_FRAMES };
const FLOOR = 800;

// ---------- small helpers ----------
const fade = (f: number, a: number, b = Infinity, fi = 12, fo = 12) => life(f, a, b, fi, fo);
const Txt: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; size?: number; color?: string; serif?: boolean; w?: number; align?: "left" | "center"; weight?: number; caps?: boolean; track?: string }> = ({
  x, y, o, children, size = 22, color = C.white, serif, w, align = "left", weight = 700, caps = true, track = "0.06em",
}) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: align === "center" ? x - (w ?? 1600) / 2 : x, top: y, width: w ?? (align === "center" ? 1600 : undefined), textAlign: align, opacity: o, transform: `translateY(${(1 - Math.min(1, o)) * 12}px)`, fontFamily: serif ? FONT.serif : FONT.sans, fontWeight: serif ? 400 : weight, fontSize: size, color, letterSpacing: serif ? 0 : track, textTransform: caps && !serif ? "uppercase" : "none", lineHeight: serif ? 1.05 : 1.2 }}>
      {children}
    </div>
  );
const Src: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; align?: "left" | "center"; w?: number }> = ({ x, y, o, children, align, w }) => (
  <Txt x={x} y={y} o={o} size={15} color={C.muted} weight={600} track="0.08em" align={align} w={w}>{children}</Txt>
);

/** Paper card with the 2022 sentence (cold open + callback). strikes[i] = frame line i gets the cyan strike. */
const DocCard: React.FC<{ x: number; y: number; f: number; o: number; lineAt: number[]; strikes?: number[]; glow3?: number }> = ({ x, y, f, o, lineAt, strikes = [], glow3 = -1 }) => {
  if (o <= 0.001) return null;
  const lines = ["Systematisch argumentieren", "Zusammenhänge erkennen", "Bedeutung schaffen"];
  return (
    <div style={{ position: "absolute", left: x - 380, top: y, width: 760, opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
      <div style={{ background: `linear-gradient(170deg, #f8f0d2, ${C.paper} 60%, #e6d6a6)`, padding: "30px 44px 30px", boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 60px rgba(236,224,183,0.18)", borderRadius: 3 }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", color: "#6b6450" }}>IAB-KURZBERICHT 5/2024 · STAND DER TECHNIK 2022</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 21, letterSpacing: "0.05em", color: C.ink, marginTop: 14, textTransform: "uppercase" }}>Was ein Sprachmodell laut IAB nicht kann:</div>
        {lines.map((l, i) => {
          const lo = ramp(f, lineAt[i] ?? -999, 10);
          const st = strikes[i] !== undefined ? ramp(f, strikes[i], 18) : 0;
          const g = i === 2 && glow3 >= 0 ? ramp(f, glow3, 20) : 0;
          return (
            <div key={i} style={{ position: "relative", marginTop: 12, fontFamily: FONT.serif, fontSize: 54, lineHeight: 1.1, color: g > 0 ? `rgba(160,110,20,${0.5 + 0.5 * g})` : C.ink, opacity: 0.12 + 0.88 * lo, textShadow: g > 0 ? `0 0 ${24 * g}px rgba(217,184,120,0.9)` : "none" }}>
              {l}
              {st > 0 && <div style={{ position: "absolute", left: 0, top: "54%", height: 5, width: `${st * 100}%`, background: C.techDeep, boxShadow: `0 0 12px ${C.tech}` }} />}
            </div>
          );
        })}
        <div style={{ marginTop: 18, fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", color: "#6b6450" }}>SINNGEMÄSS · GRIENBERGER, MATTHES, PAULUS (IAB)</div>
      </div>
    </div>
  );
};

/** Ranking strip top-right: 10 mini columns, filled once a place's 2022 value has been said. */
const RANK: { place: number; v: number; at: number }[] = [];
const RankStrip: React.FC<{ f: number; cur: number; o: number }> = ({ f, cur, o }) => {
  if (o <= 0.001) return null;
  const x0 = 1180, y = 150, h = 84, w = 34, gap = 62;
  return (
    <>
      <Txt x={x0 - 4} y={30} o={o} size={15} color={C.muted}>Rangliste · Potenzial 2022</Txt>
      <Layer>
        <g opacity={o}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((p, k) => {
            const r = RANK.find((q) => q.place === p);
            const v = r ? r.v * ramp(f, r.at, 24) : 0;
            const x = x0 + k * gap;
            const hi = p === cur;
            return (
              <g key={p}>
                <rect x={x} y={y - h} width={w} height={h} fill="#071233" stroke={hi ? C.gold : "rgba(236,224,183,0.45)"} strokeWidth={hi ? 3 : 1.5} rx={3} />
                <rect x={x + 2} y={y - (h * v) / 100} width={w - 4} height={(h * v) / 100} fill={C.techDeep} opacity={0.9} />
                <text x={x + w / 2} y={y + 26} textAnchor="middle" fontFamily={FONT.serif} fontSize={24} fill={hi ? C.gold : C.cream}>{p === 1 ? "?" : p}</text>
              </g>
            );
          })}
        </g>
      </Layer>
    </>
  );
};

// ---------- ranking data (IAB-Kurzbericht 5/2024) ----------
type Item = { place: number; job: string; sub?: string; icon: IconKind; v19?: number; v22: number; f: string; at: number; at22: number; atToday: number; today: string; delta?: string; deltaAt?: number };
const mk = (place: number, start: string, after: number, v22phrase: string, todayPhrase: string, rest: Omit<Item, "place" | "at" | "at22" | "atToday">): Item => {
  const at = A(start, after);
  const at22 = A(v22phrase, at);
  return { place, at, at22, atToday: A(todayPhrase, at22), ...rest };
};
const ITEMS_A: Item[] = [
  mk(10, "Platz 10 Komponistinnen", 0, "2022 25", "Heute vier Jahre später generieren", { job: "Komponist*innen", icon: "note", v19: 0, v22: 25, f: "F13", today: "KI erzeugt Soundtracks samt Gesang" }),
  mk(9, "Platz 9", S.rankA, "auf 40", "Aus heutiger Sicht", { job: "Journalist*innen, Schriftsteller*innen", icon: "pen", v19: 20, v22: 40, f: "F8", today: "Reasoning-Modelle bauen Argumente" }),
  mk(8, "Platz 8", S.rankA, "auf 43", "könnte genauso gut", { job: "Sprecher*innen in Radio und TV", icon: "mic", v19: 14, v22: 43, f: "F7", today: "Stimmklone mit Betonung und Pausen" }),
  mk(7, "Platz 7", S.rankA, "auf 50", "ist heute fotorealistisches", { job: "Stuntfrauen und Stuntmen", icon: "stunt", v19: 0, v22: 50, f: "F14", today: "Fotorealistische KI-Videos" }),
];
const ITEMS_B: Item[] = [
  mk(6, "Platz 6", S.cta, "auf 67", "Heutzutage", { job: "Assistenz im Hotelmanagement", icon: "bell", v19: 50, v22: 67, f: "F10", today: "Sprachagenten am Telefon" }),
  mk(5, "Platz 5", S.cta, "auf 68", "läuft heute", { job: "Betriebswirt*innen im Handel", sub: "mit Studium", icon: "cart", v19: 53, v22: 68, f: "F12", today: "Automatische Kampagnen" }),
  { ...mk(4, "Platz 4", S.cta, "auf 69", "Heute sitzen", { job: "Betriebswirt*innen in der Industrie", sub: "mit Studium", icon: "case", v19: 46, v22: 69, f: "F9", today: "KI-Assistenten im Videocall", delta: "+23 Punkte" }), deltaAt: A("Plus 23") },
  { ...mk(0, "Am Rande", S.cta, "30 Punkte", "Heute bauen KI-Agenten", { job: "Softwareentwickler*innen", sub: "am Rande · nicht im Ranking", icon: "code", v22: -1, f: "F16", today: "KI-Agenten bauen ganze Software", delta: "+30 Punkte" }) },
  mk(3, "Platz 3", S.cta, "auf 88", "Heute generieren Modelle", { job: "Gestalter*innen für Bekleidung und Mode", icon: "hanger", v19: 50, v22: 88, f: "F11", today: "Modelle liefern fertige Schnittmuster" }),
];
const P2_AT = A("Platz 2 der Beruf");
const P2_100 = A("100", P2_AT);
for (const it of [...ITEMS_A, ...ITEMS_B]) if (it.place > 0) RANK.push({ place: it.place, v: it.v22, at: it.at22 });
RANK.push({ place: 2, v: 100, at: P2_100 });

/** One ranking set (big gauge left, facts right, strip top-right). Used by rankA and rankB. */
const RankSet: React.FC<{ f: number; items: Item[]; end: number; prevLevel: number }> = ({ f, items, end, prevLevel }) => {
  // gauge level: carries over from the previous item, drops to v19 at the item start, rises to v22 when it is said
  let level = prevLevel, today = { v: 0, o: 0 }, ghost: { v: number; text: string; o: number } | undefined, gaugeO = 1;
  let cur = -1;
  items.forEach((it, k) => {
    if (f < it.at - 6) return;
    cur = k;
    if (it.v22 < 0) { gaugeO = 1 - 0.7 * ramp(f, it.at, 12); return; }
    gaugeO = 1;
    const v19 = it.v19 ?? it.v22;
    level = lerp(level, v19, ramp(f, it.at, 18));
    level = lerp(level, it.v22, ramp(f, it.at22, 30));
    ghost = { v: v19, text: "2019", o: ramp(f, it.at22, 12) };
    today = { v: Math.min(100, it.v22 + 22), o: ramp(f, it.atToday, 20) };
  });
  const it = cur >= 0 ? items[cur] : undefined;
  const itEnd = cur >= 0 && cur + 1 < items.length ? items[cur + 1].at : end;
  const o = it ? fade(f, it.at, itEnd - 4, 12, 10) : 0;
  return (
    <>
      <Lamp x={470} y={70} floorY={FLOOR + 20} spread={300} on={0.75} />
      <Layer>
        <Gauge id="rk" x={470} y={FLOOR} f={f} h={560} level={level} ghost={ghost} today={today} mark={{ v: 0, text: "", o: 0 }} o={gaugeO} />
      </Layer>
      {it && (
        <>
          <Txt x={860} y={230} o={o} size={26} color={C.gold} weight={800}>{it.place > 0 ? `Platz ${it.place}` : "Am Rande"}</Txt>
          <Txt x={860} y={270} o={o} serif size={68} color={C.cream} w={760} caps={false}>{it.job}</Txt>
          {it.sub && <Src x={860} y={it.job.length > 26 ? 420 : 350} o={o}>{it.sub}</Src>}
          <Layer><Icon kind={it.icon} x={1700} y={520} s={0.75} o={o * 0.9} /></Layer>
          {it.v22 >= 0 ? (
            <>
              <Src x={860} y={470} o={o * ramp(f, it.at22 - 40, 12)}>2019</Src>
              <SerifNumber x={860} y={495} value={`${it.v19} %`} inF={it.at22 - 40} outF={itEnd - 4} size={84} color={C.muted} />
              <Txt x={1080} y={510} o={o * ramp(f, it.at22, 10)} serif size={70} color={C.cream}>→</Txt>
              <Src x={1190} y={470} o={o * ramp(f, it.at22, 12)}>2022</Src>
              <SerifNumber x={1190} y={495} value={it.v22} from={it.v19} countF={30} inF={it.at22} outF={itEnd - 4} size={84} color={C.cream} format={(n) => `${Math.round(n)} %`} />
              <Src x={860} y={it.deltaAt ? 640 : 600} o={o * ramp(f, it.at22, 12)}>{`Automatisierbare Aufgaben · IAB-Kurzbericht 5/2024 · technisches Potenzial`}</Src>
            </>
          ) : (
            <>
              <SerifNumber x={860} y={480} value={it.delta ?? ""} inF={it.at22} outF={itEnd - 4} size={110} color={C.cream} />
              <Src x={860} y={600} o={o * ramp(f, it.at22, 12)}>2019 → 2022 · Endwert nicht genannt · IAB-Kurzbericht 5/2024</Src>
            </>
          )}
          {it.delta && it.deltaAt && <Txt x={1195} y={590} o={o * ramp(f, it.deltaAt, 12)} size={30} color={C.gold} weight={800}>{it.delta}</Txt>}
          <Txt x={860} y={it.deltaAt ? 680 : 650} o={o * ramp(f, it.atToday, 14)} size={24} color={C.tech} weight={800}>{`Heute: ${it.today}`}</Txt>
          <Src x={860} y={it.deltaAt ? 716 : 686} o={o * ramp(f, it.atToday, 14)}>Einschätzung · keine neue IAB-Messung seit 2022</Src>
        </>
      )}
      <RankStrip f={f} cur={it?.place ?? -1} o={1} />
    </>
  );
};
const levelAfter = (items: Item[]) => [...items].reverse().find((i) => i.v22 >= 0)!.v22;

// ---------- scenes (local coordinates 0..1920 x 0..1080) ----------
type SceneProps = { f: number };

const Cold: React.FC<SceneProps> = ({ f }) => {
  const tMach = A("schreibt eine Maschine");
  const tGauge = A("ein Messgerät gebaut");
  const tOver = A("überholt");
  const tWash = A("echte Stellen");
  const typed = "Systematisch argumentieren. Zusammenhänge erkennen. Bedeutung schaffen.";
  const n = Math.floor(typed.length * Math.min(1, Math.max(0, (f - tMach) / 70)));
  const level = lerp(lerp(0, 42, ramp(f, tGauge, 40)), 80, ramp(f, tOver, 45));
  const flood = 70 * ramp(f, tWash, 40);
  return (
    <>
      <Lamp x={560} y={90} floorY={FLOOR + 20} spread={420} on={1 - 0.4 * ramp(f, tGauge, 30)} />
      <DocCard x={560} y={150} f={f} o={fade(f, 4, tGauge + 10, 12, 20)} lineAt={[A("Systematisch"), A("Zusammenhänge"), A("Bedeutung")]} />
      {f > tMach - 2 && (
        <div style={{ position: "absolute", left: 180, top: 590, width: 760, opacity: fade(f, tMach, tGauge + 10, 12, 20) }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", color: C.tech }}>KI · 2026</div>
          <div style={{ marginTop: 8, fontFamily: "Consolas, monospace", fontSize: 26, color: C.tech, textShadow: `0 0 14px ${C.techDeep}` }}>
            {typed.slice(0, n)}
            <span style={{ opacity: Math.floor(f / 12) % 2 ? 1 : 0 }}>▌</span>
          </div>
        </div>
      )}
      <Layer>
        <Gauge id="cg" x={1450} y={FLOOR} f={f} h={540} level={level} o={ramp(f, tGauge, 20)} mark={{ v: 45, text: "STAND 2022", o: ramp(f, tGauge + 25, 15) }} />
        {[1180, 1280, 1640, 1740].map((x, i) => (
          <g key={x} transform={`translate(${ramp(f, tWash + i * 6, 70) * 160} ${-ramp(f, tWash + i * 6, 70) * 30})`} opacity={(1 - ramp(f, tWash + 30 + i * 6, 40)) * ramp(f, tGauge, 20)}>
            <Icon kind="desk" x={x} y={FLOOR - 40} s={0.35} />
          </g>
        ))}
        {flood > 0 && (
          <path d={`${wave(1000, 1950, FLOOR - flood, f, 4, 30)} L 1950 ${FLOOR + 200} L 1000 ${FLOOR + 200} Z`} fill={C.techDeep} opacity={0.45} />
        )}
      </Layer>
      <Src x={1290} y={FLOOR + 30} o={ramp(f, tGauge, 20)}>Symbolbild</Src>
      <Label x={1600} y={300} text="Erster Beweis" sub={["IFO-FRÜHINDIKATOR · NOV 2026"]} inF={A("erste Beweis")} />
    </>
  );
};

const Frage: React.FC<SceneProps> = ({ f }) => {
  const t13 = A("13 Millionen");
  const tIab = A("Wir schauen uns an");
  const tPl = A("Von Platz 10");
  const tRad = A("wie radikal");
  const crowdO = fade(f, S.frage - 10, tIab, 15, 18);
  const figs = [];
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 12; i++) {
      const k = r * 12 + i;
      const hit = (k * 7) % 36 < 14; // 14 of 36 ≈ 38 % (F5)
      const x = 300 + i * 120 + (r % 2) * 50;
      const y = 560 + r * 85;
      figs.push({ k, x, y, h: 140 + r * 22, hit });
    }
  const hi = ramp(f, A("70 Prozent"), 20);
  return (
    <>
      {crowdO > 0 && (
        <>
          <SerifNumber x={960} y={90} align="center" value={13.03} from={0} countF={40} inF={t13} outF={tIab} size={130} format={(n) => `${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })} Mio.`} />
          <Label x={960} y={240} align="center" text="arbeiten in Berufen mit > 70 % automatisierbaren Aufgaben" sub={["38 % ALLER BESCHÄFTIGTEN · STAND 2022", "IAB-KURZBERICHT 5/2024"]} inF={A("70 Prozent") - 10} outF={tIab} />
          <Txt x={960} y={385} o={fade(f, A("Mehr als jeder Dritte"), tIab)} align="center" size={28} color={C.gold} weight={800}>Mehr als jeder Dritte</Txt>
          <Layer>
            <g opacity={crowdO}>
              {figs.map((p) => (
                <g key={p.k}>
                  {p.hit && <ellipse cx={p.x} cy={p.y - p.h * 0.45} rx={42} ry={p.h * 0.6} fill={C.tech} opacity={0.18 * hi} />}
                  <Figure x={p.x} y={p.y} h={p.h} kind={p.hit && hi > 0.5 ? "worker" : "crowd"} />
                </g>
              ))}
            </g>
          </Layer>
        </>
      )}
      <Label x={960} y={170} align="center" text="IAB · Institut für Arbeitsmarkt- und Berufsforschung" sub={["FORSCHUNGSINSTITUT DER BUNDESAGENTUR FÜR ARBEIT"]} inF={A("Institut für Arbeitsmarkt")} />
      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((p, k) => (
        <Placard key={p} x={330 + k * 140} y={680} text={p === 1 ? "?" : String(p)} inF={tPl + k * 3} w={110} dim={p === 1 ? 1.15 : 0.9} />
      ))}
      <Layer>
        <g opacity={fade(f, tRad, Infinity)}>
          <line x1={260} x2={1660} y1={560} y2={560} stroke={C.gold} strokeWidth={3} strokeDasharray="12 8" />
        </g>
        <DrawPath d="M 260 600 C 700 600, 1200 520, 1660 380" inF={A("verschoben")} dur={40} color={C.tech} width={5} glow />
      </Layer>
      <Txt x={1680} y={530} o={fade(f, tRad, Infinity)} size={20} color={C.gold} weight={800}>Grenze 2022</Txt>
      <Txt x={1680} y={350} o={fade(f, A("verschoben"), Infinity)} size={20} color={C.tech} weight={800}>Heute?</Txt>
    </>
  );
};

const Mess: React.FC<SceneProps> = ({ f }) => {
  const tPeg = A("Stell dir einen Pegel");
  const t0 = A("0", tPeg);
  const t100 = A("100", tPeg);
  const tStudie = A("Für seine große Studie");
  const tCod = A("Drei Codiererinnen");
  const t9 = A("9.000");
  const tTech = A("Stand der Technik von 2022");
  const tSub = A("Substituierbarkeitspotenzial");
  const tHoch = A("Wie hoch steht das Wasser");
  const tSpann = A("Das Spannende ist");
  const tGpt = A("ChatGPT");
  const tKap = A("Zeitkapsel");
  const tSturm = A("Ruhe vor dem eigentlichen Sturm");
  let level = lerp(0, 100, ramp(f, t100, 30));
  level = lerp(level, 8, ramp(f, tStudie, 40));
  level = lerp(level, 40, ramp(f, tHoch, 50));
  const left = fade(f, tStudie, tSub, 12, 14);
  return (
    <>
      <Lamp x={1100} y={60} floorY={FLOOR + 20} spread={380} on={1 - 0.5 * ramp(f, tSturm, 30)} />
      <Layer>
        <Gauge id="mg" x={1100} y={FLOOR} f={f} h={600} level={level} o={ramp(f, tPeg, 20)} mark={{ v: 40, text: "STAND 2022", o: ramp(f, tSpann, 15) }} />
        <Figure x={1330} y={FLOOR} h={230} kind="hero" light={-1} opacity={ramp(f, tPeg + 20, 20)} />
        {/* time capsule frame */}
        <DrawPath d="M 880 150 H 1450 Q 1500 150 1500 200 V 790 Q 1500 840 1450 840 H 880 Q 830 840 830 790 V 200 Q 830 150 880 150 Z" inF={tKap} dur={40} color={C.gold} width={4} outF={tSturm + 40} />
        {/* storm: cyan flashes behind */}
        {[0, 1, 2].map((i) => {
          const a = tSturm + 15 + i * 22;
          const fl = Math.max(0, 1 - Math.abs(f - a) / 6);
          return <path key={i} d={`M ${1560 + i * 90} 120 L ${1530 + i * 90} 220 L ${1575 + i * 90} 220 L ${1540 + i * 90} 330`} stroke={C.tech} strokeWidth={5} fill="none" opacity={fl} />;
        })}
      </Layer>
      <Label x={200} y={200} text="Ein Pegel für Arbeit" sub={["ANTEIL DER AUFGABEN, DIE EINE MASCHINE", "VOLLAUTOMATISCH ERLEDIGEN KÖNNTE"]} inF={A("er misst Arbeit")} outF={tStudie} />
      <Txt x={1230} y={FLOOR - 70} o={fade(f, t0, tStudie)} size={22} color={C.cream}>0 % = keine Maschine kann etwas davon</Txt>
      <Txt x={1220} y={FLOOR - 620} o={fade(f, t100, tStudie)} size={20} color={C.cream}>100 % = alles</Txt>
      {left > 0 && (
        <>
          <SerifNumber x={160} y={150} value={4600} from={0} countF={40} inF={tStudie + 20} outF={tSub} size={110} />
          <Src x={165} y={270} o={left}>Berufe zerlegt · IAB</Src>
          <SerifNumber x={160} y={330} value="> 9.000" inF={t9} outF={tSub} size={110} />
          <Src x={165} y={450} o={fade(f, t9, tSub)}>Tätigkeiten geprüft</Src>
          <Layer>
            {[260, 380, 500].map((x, i) => <Figure key={x} x={x} y={FLOOR} h={190} kind="crowd" light={1} opacity={fade(f, tCod + i * 5, tSub)} />)}
          </Layer>
          <Txt x={200} y={FLOOR + 20} o={fade(f, tCod, tSub)} size={18} color={C.muted}>3 Codiererinnen, unabhängig</Txt>
          <Txt x={160} y={520} o={fade(f, tTech, tSub)} size={24} color={C.gold} weight={800}>Stand der Technik: 2022</Txt>
        </>
      )}
      <Txt x={120} y={330} o={fade(f, tSub, tSpann)} size={40} color={C.cream} weight={800} track="0.08em">Substituierbarkeitspotenzial</Txt>
      <Src x={124} y={385} o={fade(f, tSub, tSpann)}>Fachbegriff des IAB · „Wie hoch steht das Wasser?“</Src>
      <Label x={160} y={300} text="30.11.2022: ChatGPT erscheint" sub={["DIE IAB-ZAHLEN SIND DER STAND DAVOR"]} inF={tGpt} color={C.tech} />
      <Label x={160} y={460} text="Zeitkapsel 2022" sub={["LETZTE OFFIZIELLE PEGELSTÄNDE"]} inF={tKap} color={C.gold} />
    </>
  );
};

const Problem: React.FC<SceneProps> = ({ f }) => {
  // F1-F4: 2022 value and 2019 value (2022 minus change)
  const G = [
    { name: "Helfer", sub: "OHNE AUSBILDUNG", v19: 58.9, v22: 57.1, d: "≈ gleich", at: A("Helferjobs") },
    { name: "Fachkräfte", sub: "MIT AUSBILDUNG", v19: 58.1, v22: 61.6, d: "+3,5", at: A("Fachkräften mit") },
    { name: "Spezialisten", sub: "MEISTER, TECHNIKER", v19: 44.6, v22: 49.7, d: "+5,1", at: A("Spezialisten, Meistern") },
    { name: "Experten", sub: "MIT STUDIUM", v19: 26.1, v22: 35.8, d: "+9,7", at: A("Experten mit Studium") },
  ];
  const tTop = A("oben am schnellsten");
  const tFab = A("Jahrzehntelang");
  const tAnf = A("Und das war erst der Anfang");
  const gO = fade(f, S.problem, tFab, 15, 15);
  return (
    <>
      <Label x={960} y={60} align="center" text="2019 → 2022: Wo steigt der Pegel?" sub={["IAB-KURZBERICHT 5/2024 · ANTEIL AUTOMATISIERBARER AUFGABEN"]} inF={S.problem + 10} outF={tFab} />
      <Layer>
        {G.map((g, i) => {
          const x = 330 + i * 420;
          const lv = lerp(g.v19, g.v22, ramp(f, g.at + 20, 30));
          return <Gauge key={i} id={`pg${i}`} x={x} y={760} f={f} h={420} w={70} big={false} level={ramp(f, S.problem, 20) * lv} o={gO} ghost={{ v: g.v19, text: "2019", o: ramp(f, g.at, 12) * gO }} />;
        })}
        <DrawPath d="M 1590 300 L 1590 230 M 1560 260 L 1590 230 L 1620 260" inF={tTop} dur={20} color={C.gold} width={6} outF={tFab} />
      </Layer>
      {G.map((g, i) => {
        const x = 330 + i * 420;
        const o = gO * ramp(f, g.at, 12);
        return (
          <React.Fragment key={i}>
            <Txt x={x - 150} y={250} w={300} align="center" o={o} size={22} color={C.white} weight={800}>{g.name}</Txt>
            <Txt x={x - 150} y={280} w={300} align="center" o={o * 0.9} size={14} color={C.muted}>{g.sub}</Txt>
            <SerifNumber x={x + 60} y={760 - (420 * g.v22) / 100 - 40} value={`${g.v22.toLocaleString("de-DE")} %`} inF={g.at + 20} outF={tFab} size={46} />
            <Txt x={x + 62} y={765 - (420 * g.v22) / 100 + 12} o={o * ramp(f, g.at + 30, 10)} size={22} color={i === 3 && f > tTop ? C.gold : C.cream} weight={800}>{g.d}</Txt>
          </React.Fragment>
        );
      })}
      <Layer>
        <Icon kind="factory" x={620} y={430} s={1.3} o={fade(f, A("Fabrik"), tAnf)} />
        <DrawPath d="M 820 430 L 1080 430 M 1050 405 L 1080 430 L 1050 455" inF={A("Diesmal")} dur={20} color={C.cream} width={5} outF={tAnf} />
        <Icon kind="desk" x={1320} y={430} s={1.3} o={fade(f, A("Schreibtisch"), tAnf)} color={C.tech} />
      </Layer>
      <Txt x={620} y={580} w={400} align="center" o={fade(f, A("Fabrik"), tAnf)} size={20} color={C.muted}>Früher</Txt>
      <Txt x={1320} y={580} w={400} align="center" o={fade(f, A("Schreibtisch"), tAnf)} size={20} color={C.tech}>Diesmal</Txt>
      <Txt x={960} y={380} align="center" o={fade(f, A("Schauen wir auf die 10"), Infinity)} serif size={78} color={C.cream}>10 Berufe, die 2022 schon Alarm schlugen</Txt>
    </>
  );
};

const RankA: React.FC<SceneProps> = ({ f }) => <RankSet f={f} items={ITEMS_A} end={S.cta} prevLevel={0} />;
const RankB: React.FC<SceneProps> = ({ f }) => <RankSet f={f} items={ITEMS_B} end={S.p2} prevLevel={levelAfter(ITEMS_A)} />;

const Cta: React.FC<SceneProps> = ({ f }) => {
  const tAll = A("bei allen ankommt");
  const tKon = A("Konzernen");
  const tAbo = A("abonniere", S.cta);
  const tHals = A("bis zum Hals");
  const water = 190 * ramp(f, tHals, 40);
  return (
    <>
      <Lamp x={960} y={60} floorY={FLOOR + 20} spread={360} />
      <Txt x={960} y={150} align="center" o={fade(f, S.cta + 6, Infinity)} size={20} color={C.muted}>Kurz zwischendurch</Txt>
      <Txt x={960} y={190} align="center" o={fade(f, A("Dieser Kanal will"), Infinity)} serif size={80} color={C.cream}>Die KI-Zukunft für alle.</Txt>
      <Layer>
        {[1500, 1620, 1740].map((x, i) => <rect key={x} x={x} y={FLOOR - 420 + i * 60} width={100} height={420 - i * 60} fill="#0b1640" stroke="rgba(236,224,183,0.2)" opacity={fade(f, tKon, Infinity) * 0.9} />)}
        {[620, 740, 1180, 1300].map((x, i) => <Figure key={x} x={x} y={FLOOR} h={210 + (i % 2) * 15} kind={i === 0 ? "elder" : "crowd"} opacity={fade(f, tAll + i * 4, Infinity)} />)}
        <Figure x={960} y={FLOOR} h={250} kind="hero" />
        {water > 0 && <path d={`${wave(-200, 2120, FLOOR - water, f, 5, 50)} L 2120 ${FLOOR + 300} L -200 ${FLOOR + 300} Z`} fill={C.techDeep} opacity={0.5} />}
      </Layer>
      <Placard x={960} y={FLOOR + 82} text="ABONNIEREN" w={240} serif={false} inF={tAbo} />
    </>
  );
};

const P2: React.FC<SceneProps> = ({ f }) => {
  const tKino = A("Und wenn wir heute ins Kino");
  const tWarum = A("Warum", P2_AT);
  const tSpuel = A("Deine Spülmaschine");
  const tP1 = A("Und Platz 1");
  const tKein = A("Platz 1 ist kein Beruf");
  const level = lerp(levelAfter(ITEMS_B), 104, ramp(f, P2_100, 40));
  const gaugeO = 1 - ramp(f, tP1, 20);
  const t1 = fade(f, P2_AT, tKino, 12, 12);
  const drops = [];
  if (f > P2_100 + 30 && gaugeO > 0)
    for (let i = 0; i < 6; i++) {
      const ph = ((f - P2_100 + i * 13) % 50) / 50;
      drops.push(<circle key={i} cx={470 + (i % 2 ? 1 : -1) * (50 + ph * 40)} cy={FLOOR - 580 + ph * ph * 560} r={6} fill={C.tech} opacity={(1 - ph) * gaugeO} />);
    }
  return (
    <>
      <Lamp x={470} y={70} floorY={FLOOR + 20} spread={300} on={0.75 * gaugeO} />
      <Layer>
        <Gauge id="p2" x={470} y={FLOOR} f={f} h={560} level={level} o={gaugeO} />
        {drops}
      </Layer>
      <Txt x={860} y={230} o={t1} size={26} color={C.gold} weight={800}>Platz 2</Txt>
      <Txt x={860} y={270} o={t1 * ramp(f, A("Synchronsprecherinnen"), 12)} serif size={68} color={C.cream} w={800} caps={false}>Synchronsprecher*innen</Txt>
      <SerifNumber x={860} y={420} value="100 %" inF={P2_100} outF={tKino} size={130} />
      <Src x={860} y={570} o={fade(f, A("Das IAB stellte"), tKino)}>„Alle typischen Tätigkeiten“ automatisierbar · IAB-Kurzbericht 5/2024 (F15)</Src>
      <Txt x={860} y={620} o={fade(f, A("Das Wasser stand"), tKino)} size={24} color={C.tech} weight={800}>Schon 2022 über der obersten Stufe</Txt>
      <RankStrip f={f} cur={2} o={1 - ramp(f, tKino, 15)} />
      <Layer><Icon kind="film" x={1700} y={520} s={0.75} o={t1 * 0.9} /></Layer>
      {/* still alive: real people */}
      <Layer>
        {[1000, 1140, 1280].map((x, i) => <Figure key={x} x={x} y={FLOOR} h={220} kind="crowd" light={-1} opacity={fade(f, tKino + i * 5, tSpuel)} />)}
        <Icon kind="mic" x={1500} y={560} s={0.8} o={fade(f, tKino, tSpuel)} />
      </Layer>
      <Label x={1000} y={260} text="Den Beruf gibt es noch" sub={["MIT ECHTEN MENSCHEN"]} inF={A("es gibt diesen Beruf")} outF={tWarum} />
      <Txt x={960} y={250} o={fade(f, tWarum, tSpuel)} size={34} color={C.cream} weight={800}>Technisch möglich</Txt>
      <Txt x={960} y={300} o={fade(f, A("nicht heißt", P2_AT), tSpuel)} serif size={60} color={C.gold}>≠ wirklich gemacht</Txt>
      {/* dishwasher analogy */}
      <Layer>
        <Icon kind="dish" x={1050} y={600} s={1.0} o={fade(f, tSpuel, tP1)} />
        <Icon kind="pan" x={1460} y={560} s={0.9} o={fade(f, A("die gute Pfanne"), tP1)} color={C.gold} />
        <Figure x={1300} y={FLOOR} h={230} kind="hero" light={1} opacity={fade(f, A("trotzdem spülst"), tP1)} />
      </Layer>
      {[["Weil es schneller geht", A("Weil es schneller")], ["Weil sie sonst leidet", A("weil sie sonst")], ["Weil du es so willst", A("oder weil du")]].map(([t, a], i) => (
        <Txt key={i} x={1000} y={200 + i * 50} o={fade(f, a as number, tP1)} size={26} color={C.cream} weight={700}>{t as string}</Txt>
      ))}
      {/* platz 1 ? */}
      <Txt x={960} y={180} align="center" o={fade(f, tP1, Infinity)} serif size={320} color={C.gold}>1?</Txt>
      <Txt x={960} y={560} align="center" o={fade(f, A("Wenn selbst bei 100"), Infinity)} size={22} color={C.muted}>Wenn nicht einmal 100 % einen Beruf verschwinden lassen …</Txt>
      <Txt x={960} y={620} align="center" o={fade(f, tKein, Infinity)} size={44} color={C.cream} weight={800} track="0.12em">Kein Beruf.</Txt>
    </>
  );
};

const P1: React.FC<SceneProps> = ({ f }) => {
  const tFrag = A("Die Forscher fragen nicht mehr");
  const tSond = A("sondern wer");
  const tBer = A("In den Berufen, in denen KI");
  const t279 = A("279.000");
  const t239 = A("Jetzt sind es");
  const t14 = A("minus 14");
  const tJob = A("Platz 1 ist der erste Job");
  const tFalck = A("Der Berufseinstieg ist");
  const tRaet = A("Das erklärt das ganze");
  const tNie = A("Niemand wird massenhaft");
  const tEin = A("Aber die Einstiegsstelle");
  const tTrep = A("Die Treppe bleibt stehen");
  const tFair = A("Fair ist aber auch");
  const tIab = A("Eine IAB-Auswertung");
  const ph1 = fade(f, S.p1, tJob, 12, 15);
  const stairsO = ramp(f, tJob, 20) * (1 - 0.6 * ramp(f, tFair, 20));
  const water = lerp(lerp(30, 95, ramp(f, tJob + 10, 40)), 120, ramp(f, tTrep, 40));
  return (
    <>
      {ph1 > 0 && (
        <>
          <Label x={160} y={150} text="ifo-Institut · KI-Frühindikator" sub={["VORGESTELLT 9.11.2026 · LAUT ZDFHEUTE", "140 BERUFE · DATEN DER BUNDESAGENTUR FÜR ARBEIT"]} inF={S.p1 + 4} outF={tJob} />
          <div style={{ position: "absolute", left: 160, top: 290, opacity: fade(f, tFrag, tBer) }}>
            <div style={{ position: "relative", fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: C.muted, letterSpacing: "0.04em" }}>
              WAS KÖNNTE DIE MASCHINE?
              <div style={{ position: "absolute", left: 0, top: "50%", height: 4, width: `${ramp(f, tSond, 15) * 100}%`, background: C.gold }} />
            </div>
            <div style={{ marginTop: 18, fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: C.cream, letterSpacing: "0.04em", opacity: ramp(f, tSond, 12) }}>WER WIRD NOCH EINGESTELLT?</div>
          </div>
          <Txt x={160} y={300} o={fade(f, tBer, tJob)} size={20} color={C.muted}>Junge Leute (20-24 J.) in Vollzeit · Berufe, in denen KI viele Aufgaben übernimmt</Txt>
          <Layer>
            <g opacity={ph1}>
              <rect x={160} y={360} width={760 * ramp(f, t279, 30)} height={70} fill={C.cream} opacity={fade(f, t279, tJob)} />
              <rect x={160} y={460} width={651 * ramp(f, t239, 30)} height={70} fill={C.cream} opacity={fade(f, t239, tJob)} />
              <rect x={811} y={460} width={109} height={70} fill="none" stroke={C.tech} strokeWidth={3} strokeDasharray="8 6" opacity={ramp(f, t14, 12)} />
            </g>
          </Layer>
          <SerifNumber x={950} y={365} value={279000} from={0} countF={30} inF={t279} outF={tJob} size={64} />
          <SerifNumber x={950} y={465} value={239000} from={279000} countF={30} inF={t239} outF={tJob} size={64} />
          <SerifNumber x={1350} y={360} value="−14 %" inF={t14} outF={tJob} size={170} color={C.tech} />
          <Src x={160} y={560} o={fade(f, t279, tJob)}>ifo-Institut, laut ZDFheute 9.11.2026 · Zusammenhang, keine Kausalität (F31, F35)</Src>
        </>
      )}
      <Layer>
        <Stairs id="p1s" x0={460} y={FLOOR} f={f} water={water} o={stairsO} labels={{ 0: "ERSTER JOB", 5: "LEITUNG" }} hiBottom={ramp(f, tJob, 20)}
          figs={(top) => (
            <>
              {[1, 2, 3, 4, 5].map((i) => <Figure key={i} x={top(i).x} y={top(i).y} h={150} kind={i === 5 ? "elder" : "crowd"} />)}
              <g opacity={0.35}>
                <Figure x={top(0).x} y={top(0).y} h={140} kind="crowd" opacity={1 - ramp(f, tEin + 20, 30)} />
              </g>
            </>
          )}
        />
      </Layer>
      <SerifNumber x={555} y={540} align="center" value="1" inF={tJob} outF={tFalck} size={150} color={C.gold} />
      <QuoteCard x={700} y={100} w={760} quote="Der Berufseinstieg ist das Frühwarnsystem des Arbeitsmarkts." who="Oliver Falck · ifo-Institut" source="zitiert nach ZDFheute · 9.11.2026" inF={tFalck} outF={tRaet} />
      <Label x={1300} y={170} text="Keine Massenentlassungen" sub={["IFO: KEIN BREITER JOBABBAU SICHTBAR (F33)"]} inF={tNie} outF={tFair} color={C.cream} />
      <Label x={180} y={560} text="Einstiegsstellen:" sub={["WERDEN NICHT NEU BESETZT"]} inF={tEin} outF={tFair} color={C.tech} />
      <Label x={960} y={160} align="center" text="Zusammenhang, kein Beweis" sub={["AUCH KONJUNKTUR · DEMOGRAFIE · AUSBILDUNG SPIELEN MIT (F35)"]} inF={tFair} outF={tIab} size={34} />
      <Label x={960} y={160} align="center" text="IAB-Auswertung · Oktober 2026" sub={["20- BIS 29-JÄHRIGE: −3,8 % IN KI-NAHEN BERUFEN, −2,6 % IN DEN ÜBRIGEN", "STATISTISCH NICHT SIGNIFIKANT (F40, F41)"]} inF={tIab} size={30} />
    </>
  );
};

const Gegen: React.FC<SceneProps> = ({ f }) => {
  const tIw = A("Das Institut der deutschen Wirtschaft");
  const tMio = A("fast eine Million");
  const t8 = A("Plus 8");
  const tQ1 = A("KI-nahe Beschäftigte weisen");
  const tQ2 = A("Eine Entwarnung");
  const tBeid = A("Beides stimmt gleichzeitig");
  const tSteigt = A("Das Wasser steigt", tBeid);
  const tStuf = A("Aber die Menschen bauen");
  const tFried = A("Ein Beispiel aus dem IAB-Bericht");
  const t44 = A("auf 44");
  const t280 = A("Zwischen 2019 und 2022 sind");
  const tAush = A("Und das IAB schreibt selbst");
  const ph1 = fade(f, S.gegen, tBeid, 12, 15);
  const water = lerp(40, 125, ramp(f, tSteigt, 40));
  return (
    <>
      <Txt x={960} y={90} align="center" o={fade(f, S.gegen, tIw)} serif size={90} color={C.cream}>Die andere Seite</Txt>
      {ph1 > 0 && (
        <>
          <Label x={160} y={130} text="Institut der deutschen Wirtschaft (IW)" sub={["KURZBERICHT 70/2026 · 13.10.2026"]} inF={tIw} outF={tQ1} />
          <SerifNumber x={160} y={250} value={944860} from={0} countF={40} inF={tMio} outF={tQ1} size={120} format={(n) => `+${Math.round(n).toLocaleString("de-DE")}`} />
          <Src x={165} y={385} o={fade(f, tMio, tQ1)}>Beschäftigte in KI-nahen Berufen · Dez 2019 → 2025 (F50)</Src>
          <SerifNumber x={1150} y={250} value="+8,3 %" inF={t8} outF={tQ1} size={120} color={C.gold} />
          <QuoteCard x={960} y={120} w={900} quote="KI-nahe Beschäftigte weisen keine auffälligen Arbeitsplatzrisiken auf." who="Stefanie Seele · IW" source="IW-Kurzbericht 70/2026" inF={tQ1} outF={tBeid} />
          <QuoteCard x={960} y={470} w={900} quote="Eine Entwarnung lässt sich daraus allerdings nicht ableiten." who="Stefanie Seele · IW" source="IW-Kurzbericht 70/2026" inF={tQ2} outF={tBeid} />
        </>
      )}
      <Layer>
        <Stairs id="gs" x0={140} y={FLOOR} f={f} sw={150} water={water} o={ramp(f, tBeid, 20) * (1 - 0.6 * ramp(f, tAush, 20))} extra={ramp(f, tStuf + 10, 30)} labels={{ 0: "EINSTIEG" }}
          figs={(top) => (
            <>
              {[2, 3, 4].map((i) => <Figure key={i} x={top(i).x} y={top(i).y} h={130} kind="crowd" />)}
              <Figure x={top(5).x + 40} y={top(5).y} h={130} kind="worker" opacity={ramp(f, tStuf, 20)} />
            </>
          )}
        />
      </Layer>
      <Txt x={280} y={180} o={fade(f, tStuf, Infinity)} size={26} color={C.gold} weight={800}>Menschen bauen Stufen</Txt>
      {/* Friedhof: the gauge sinks (F17) */}
      <Layer>
        <Gauge id="fr" x={1620} y={FLOOR - 20} f={f} h={340} w={64} big={false} level={lerp(60, 44, ramp(f, t44, 40))} ghost={{ v: 60, text: "2019", o: ramp(f, t44, 12) }} o={fade(f, tFried, t280)} />
      </Layer>
      <Label x={1320} y={150} text="Friedhofsarbeiter*in" sub={["60 % → 44 % · DER PEGEL SINKT", "NEU IM BERUF: HECKENSCHNITT, WINTERDIENST", "IAB-KURZBERICHT 5/2024 (F17)"]} inF={tFried} outF={t280} />
      <SerifNumber x={1350} y={180} value="> 280" inF={t280} outF={tAush} size={120} />
      <Src x={1355} y={310} o={fade(f, t280, tAush)}>Neue Berufe 2019-2022 · IAB (F19)</Src>
      <Placard x={1420} y={500} text="KI-MANAGER*IN" w={250} serif={false} inF={A("KI-Managerin")} outF={tAush} />
      <Placard x={1560} y={600} text="ETHICAL HACKER" w={250} serif={false} inF={A("Ethical Hacker")} outF={tAush} />
      <Placard x={1700} y={700} text="SOLARMONTEUR*IN" w={250} serif={false} inF={A("Solarmonteur")} outF={tAush} />
      <QuoteCard x={1260} y={150} w={760} quote="Die Entscheidung, welche Tätigkeiten tatsächlich automatisiert werden, ist nicht alleine durch die Technologie vorgegeben, sondern das Ergebnis von Aushandlungsprozessen." who="IAB-Kurzbericht 5/2024" source="Grienberger, Matthes, Paulus (F23)" inF={tAush} />
    </>
  );
};

const Hebel: React.FC<SceneProps> = ({ f }) => {
  const t1 = A("Eins", S.hebel);
  const tHoch = A("heute deutlich höher");
  const t2 = A("2 Schau nicht nur");
  const tUnter = A("unter der Wasserlinie");
  const tUrt = A("Urteilsvermögen");
  const t3 = A("3 Wenn du Leute");
  const tWeg = A("Wer heute die unterste");
  const cards = [t1, t2, t3];
  const Card: React.FC<{ k: number; title: string; children?: React.ReactNode }> = ({ k, title, children }) => {
    const o = ramp(f, cards[k], 14);
    if (o <= 0) return null;
    return (
      <div style={{ position: "absolute", left: 120 + k * 580, top: 170, width: 520, height: 560, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, background: "rgba(11,26,70,0.85)", border: `1.5px solid ${C.line}`, borderRadius: 6 }}>
        <div style={{ position: "absolute", left: 30, top: 14, fontFamily: FONT.serif, fontSize: 110, color: C.gold, lineHeight: 1 }}>{k + 1}</div>
        <div style={{ position: "absolute", left: 120, top: 46, right: 20, fontFamily: FONT.sans, fontWeight: 800, fontSize: 28, letterSpacing: "0.05em", color: C.cream, textTransform: "uppercase", lineHeight: 1.15 }}>{title}</div>
        {children}
      </div>
    );
  };
  const tasks = [["Routine", 0], ["Zusammenfassung", 0], ["Erster Entwurf", 0], ["Urteilsvermögen", 1], ["Verantwortung", 1], ["Menschliche Beziehung", 1]] as const;
  return (
    <>
      <Txt x={960} y={110} align="center" o={fade(f, S.hebel, A("Eins", S.hebel))} size={22} color={C.muted}>Was nimmst du mit?</Txt>
      <Card k={0} title="Schau, wo dein Pegel steht">
        <div style={{ position: "absolute", left: 30, top: 160, fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, color: C.tech, letterSpacing: "0.04em" }}>JOB-FUTUROMAT.IAB.DE</div>
        <div style={{ position: "absolute", left: 30, top: 192, fontFamily: FONT.sans, fontWeight: 600, fontSize: 14, color: C.muted, letterSpacing: "0.08em" }}>KOSTENLOS · WERTE = STAND DER TECHNIK 2022</div>
        <svg width={520} height={560} style={{ position: "absolute", left: 0, top: 0 }}>
          <Gauge id="hb" x={260} y={520} f={f} h={260} w={60} big={false} level={45} mark={{ v: 45, text: "2022", o: 1 }} today={{ v: 75, o: ramp(f, tHoch, 20) }} />
        </svg>
      </Card>
      <Card k={1} title="Schau auf deine Aufgaben">
        <div style={{ position: "absolute", left: 40, right: 40, top: 160 }}>
          {tasks.map(([t, up], i) => {
            const uo = up ? ramp(f, tUrt + (i - 3) * 8, 12) : ramp(f, t2 + 30 + i * 8, 12);
            return (
              <div key={t} style={{ marginTop: i === 3 ? 34 : 10, padding: "8px 14px", fontFamily: FONT.sans, fontWeight: 700, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", opacity: uo, color: up ? C.ink : C.white, background: up ? C.gold : `rgba(47,143,216,${0.25 + 0.45 * ramp(f, tUnter, 15)})` }}>{t}</div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, top: 333, height: 3, background: C.tech, boxShadow: `0 0 12px ${C.tech}`, opacity: ramp(f, tUnter, 15) }} />
      </Card>
      <Card k={2} title="Stell die Jungen trotzdem ein">
        <div style={{ position: "absolute", left: 30, top: 160, right: 30, fontFamily: FONT.sans, fontWeight: 600, fontSize: 15, color: C.muted, letterSpacing: "0.08em" }}>SONST FEHLEN IN EIN PAAR JAHREN ERFAHRENE FACHKRÄFTE · IFO</div>
        <svg width={520} height={560} style={{ position: "absolute", left: 0, top: 0 }}>
          <Stairs id="hs" x0={40} y={520} f={f} n={4} sw={110} sh={60} water={0} bottomO={1 - 0.85 * ramp(f, tWeg + 20, 30)}
            figs={(top) => <>{[1, 2, 3].map((i) => <Figure key={i} x={top(i).x} y={top(i).y} h={90} kind={i === 3 ? "elder" : "crowd"} />)}<Figure x={top(0).x} y={top(0).y} h={80} kind="hero" opacity={1 - ramp(f, tWeg + 20, 30)} /></>}
          />
        </svg>
      </Card>
    </>
  );
};

const End: React.FC<SceneProps> = ({ f }) => {
  const tKomm = A("Schreib mir in die Kommentare");
  const tMir = A("Bei mir war es");
  const tAbo = A("abonniere", A("Und wenn du willst"));
  const tWel = A("Welcher Beruf fällt zuerst");
  const tKein = A("Keiner");
  const tStufe = A("Zuerst fällt die erste Stufe");
  const tArg = A("kann argumentieren");
  const tZus = A("sie kann Zusammenhänge");
  const tBed = A("Aber Bedeutung schaffen");
  const docO = fade(f, S.end, tKomm, 14, 14);
  const water = lerp(40, 100, ramp(f, tStufe, 40));
  const outro = 1 - ramp(f, L01_FRAMES - 50, 45);
  return (
    <>
      <DocCard x={960} y={180} f={f} o={docO} lineAt={[S.end, A("Systematisch", S.end), A("Bedeutung", S.end)]} strikes={[tArg, tZus]} glow3={tBed} />
      <Layer><Icon kind="bubble" x={960} y={300} s={1.2} o={fade(f, tKomm, tWel)} /></Layer>
      <Txt x={960} y={420} align="center" o={fade(f, tKomm, tWel)} size={30} color={C.cream} weight={800} w={1300}>In welchem Bereich hat dich die KI am meisten überrascht?</Txt>
      <Txt x={960} y={500} align="center" o={fade(f, tMir, tWel)} size={18} color={C.muted}>Bei mir: Softwareentwicklung</Txt>
      <Placard x={960} y={680} text="ABONNIEREN" w={240} serif={false} inF={tAbo} outF={tWel} />
      <g />
      <div style={{ position: "absolute", inset: 0, opacity: outro }}>
        <Layer>
          <Stairs id="es" x0={390} y={FLOOR} f={f} water={water} o={ramp(f, tWel, 20)} labels={{ 0: "ERSTER JOB" }} hiBottom={ramp(f, tStufe, 20)}
            figs={(top) => <>{[2, 3, 4, 5].map((i) => <Figure key={i} x={top(i).x} y={top(i).y} h={150} kind={i === 5 ? "elder" : "crowd"} />)}<Figure x={top(0).x} y={top(0).y} h={150} kind="hero" /></>}
          />
        </Layer>
        <Txt x={960} y={120} align="center" o={fade(f, tWel, Infinity)} serif size={80} color={C.cream}>Welcher Beruf fällt zuerst?</Txt>
        <Txt x={960} y={230} align="center" o={fade(f, tKein, Infinity)} size={40} color={C.gold} weight={800} track="0.12em">Keiner.</Txt>
      </div>
    </>
  );
};

const SCENES: Record<SceneId, React.FC<SceneProps>> = { cold: Cold, frage: Frage, mess: Mess, problem: Problem, rankA: RankA, cta: Cta, rankB: RankB, p2: P2, p1: P1, gegen: Gegen, hebel: Hebel, end: End };

// ---------- camera ----------
type Move = { at: number; x: number; y: number; zoom: number; d?: number };
const LOCAL_MOVES: Partial<Record<SceneId, Move[]>> = {
  cold: [
    { at: A("Damals, Ende 2022"), x: 960, y: 540, zoom: 1.0, d: 50 },
    { at: A("ein Messgerät gebaut"), x: 1200, y: 520, zoom: 1.1, d: 45 },
    { at: A("echte Stellen"), x: 1250, y: 580, zoom: 1.05, d: 40 },
  ],
  frage: [{ at: A("Wir schauen uns an"), x: 960, y: 520, zoom: 1.02, d: 40 }],
  mess: [
    { at: A("Für seine große Studie"), x: 760, y: 520, zoom: 1.04, d: 45 },
    { at: A("Substituierbarkeitspotenzial"), x: 960, y: 530, zoom: 1.0, d: 40 },
    { at: A("Zeitkapsel"), x: 1060, y: 520, zoom: 1.08, d: 50 },
  ],
  problem: [
    { at: A("oben am schnellsten"), x: 1180, y: 520, zoom: 1.12, d: 40 },
    { at: A("Jahrzehntelang"), x: 960, y: 540, zoom: 1.0, d: 40 },
  ],
  p2: [
    { at: A("Deine Spülmaschine"), x: 1000, y: 540, zoom: 1.04, d: 45 },
    { at: A("Und Platz 1"), x: 960, y: 540, zoom: 1.0, d: 40 },
  ],
  p1: [
    { at: A("Platz 1 ist der erste Job"), x: 960, y: 560, zoom: 1.0, d: 45 },
    { at: A("Niemand wird massenhaft"), x: 900, y: 600, zoom: 1.1, d: 50 },
    { at: A("Fair ist aber auch"), x: 960, y: 540, zoom: 1.0, d: 40 },
  ],
  gegen: [
    { at: A("Beides stimmt gleichzeitig"), x: 820, y: 560, zoom: 1.05, d: 45 },
    { at: A("Ein Beispiel aus dem IAB-Bericht"), x: 1100, y: 540, zoom: 1.0, d: 45 },
    { at: A("Und das IAB schreibt selbst"), x: 1100, y: 520, zoom: 1.0, d: 45 },
  ],
  hebel: [
    { at: A("Eins", S.hebel), x: 380, y: 500, zoom: 1.25, d: 40 },
    { at: A("2 Schau nicht nur"), x: 960, y: 500, zoom: 1.25, d: 40 },
    { at: A("3 Wenn du Leute"), x: 1540, y: 500, zoom: 1.25, d: 40 },
    { at: A("Wer heute die unterste"), x: 960, y: 520, zoom: 1.0, d: 45 },
  ],
  end: [
    { at: A("Welcher Beruf fällt zuerst", S.end), x: 960, y: 540, zoom: 1.0, d: 40 },
    { at: A("Zuerst fällt die erste Stufe"), x: 650, y: 660, zoom: 1.3, d: 60 },
  ],
};
// rank scenes: small hop per item so the frame never sits dead
for (const [id, items] of [["rankA", ITEMS_A], ["rankB", ITEMS_B]] as const) {
  LOCAL_MOVES[id] = items.slice(1).map((it, k) => ({ at: it.at - 4, x: 960 + (k % 2 ? -25 : 25), y: 540, zoom: k % 2 ? 1.0 : 1.03, d: 30 }));
}

const CAM_KEYS: CamKey[] = (() => {
  const moves: Move[] = [];
  ORDER.forEach((id, i) => {
    const X = SCENE_X(id);
    const start = id === "cold" ? { at: 0, x: 600, y: 420, zoom: 1.3, d: 1 } : { at: S[id] - 12, x: 960, y: 540, zoom: 1.0, d: 42 };
    if (id === "cold") moves.push({ ...start, x: X + start.x });
    else moves.push({ ...start, x: X + start.x });
    for (const m of LOCAL_MOVES[id] ?? []) moves.push({ ...m, x: X + m.x });
  });
  moves.sort((a, b) => a.at - b.at);
  const ks: CamKey[] = [{ f: 0, x: moves[0].x, y: moves[0].y, zoom: moves[0].zoom }];
  for (const m of moves.slice(1)) {
    const prev = ks[ks.length - 1];
    const a = Math.max(m.at, prev.f + 1);
    ks.push({ f: a, x: prev.x, y: prev.y, zoom: prev.zoom });
    ks.push({ f: a + (m.d ?? 40), x: m.x, y: m.y, zoom: m.zoom });
  }
  return ks;
})();

// ---------- chapters (screen-fixed tag; same questions go to CHAPTERS.json) ----------
const CHAPTERS: { text: string; at: number }[] = [
  { text: "Wie misst man das?", at: S.mess },
  { text: "Was 2022 schon zu sehen war", at: S.problem },
  { text: "Die Zeitkapsel: Platz 10 bis 7", at: S.rankA },
  { text: "Bis zum Hals: Platz 6 bis 3", at: S.rankB },
  { text: "Die 100-Prozent-Marke", at: S.p2 },
  { text: "Platz 1: der erste Job", at: S.p1 },
  { text: "Ist das jetzt schlimm?", at: S.gegen },
  { text: "Was heißt das für dich?", at: S.hebel },
];

export const L01: React.FC = () => {
  const f = useCurrentFrame();
  // creep 0: a 10-minute video would otherwise zoom in 5x; the moves keep it alive instead
  const cam = camAt(f, CAM_KEYS, 0);
  // slow continuous breathing instead of a linear creep (a 10-minute linear creep would zoom 5x)
  const camC = { ...cam, x: cam.x + 10 * Math.sin(f / 310), y: cam.y + 5 * Math.sin(f / 270), zoom: cam.zoom * (1 + 0.012 * Math.sin(f / 240)) };
  const world = (
    <>
      <Room horizon={FLOOR} x0={-1500} x1={SCENE_X("end") + 3500} />
      {ORDER.map((id) => {
        const a = S[id] - 120, b = sceneEnd(id) + 90;
        if (f < a || f > b) return null;
        const Sc = SCENES[id];
        return (
          <div key={id} style={{ position: "absolute", left: SCENE_X(id), top: 0, width: 1920, height: 1080 }}>
            <Sc f={f} />
          </div>
        );
      })}
    </>
  );
  const overlay = (
    <>
      {CHAPTERS.map((c, i) => <ChapterTag key={i} text={c.text} inF={c.at + 20} outF={(CHAPTERS[i + 1]?.at ?? S.end) - 5} />)}
      <Captions words={WORDS} />
      <AbsoluteFill style={{ background: "#000", opacity: ramp(f, L01_FRAMES - 40, 38), pointerEvents: "none" }} />
    </>
  );
  return <Stage cam={camC} world={world} overlay={overlay} glow={{ x: camC.x, y: 520, r: 1000, o: 0.3 }} />;
};

export const L01_CHAPTERS = CHAPTERS;
