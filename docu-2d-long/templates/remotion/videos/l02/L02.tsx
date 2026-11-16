// L02 "Hoffnungslos?" – long-form docu, 16:9, voice = the user's own recording + two original-footage clips.
// One world: 13 scene sets side by side (SCENE_X), every set is a PLACE (night backdrop, house/street/room) with ONE warm
// focus light. Every cue = a spoken phrase (A()). Numbers: videos/L02-hoffnungslos/SOURCES.md (F-numbers in comments).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, Layer, camAt, CamKey } from "../../lib/docu/Stage";
import { Figure } from "../../lib/docu/Figure";
import { Label, SerifNumber, ChapterTag, QuoteCard, Captions, Placard } from "../../lib/docu/Text";
import { Emissive, Bloom } from "../../lib/docu/Setpieces";
import { FootageQuote } from "../../lib/docu/Footage";
import { GOLD_HOT } from "../../lib/docu/Scenery";
import { ramp, life, lerp, clamp01 } from "../../lib/docu/anim";
import { C, FONT } from "../../lib/docu/theme";
import { A, S, ORDER, SceneId, SCENE_X, sceneEnd, WORDS, L02_FRAMES, COLD, CLIPS } from "./story";
import { House, Backdrop, StreetLamp, Crane, FLOOR, winPos, houseTop } from "./Leitmotiv";

export { L02_FRAMES };

// ---------- helpers ----------
const fade = (f: number, a: number, b = Infinity, fi = 12, fo = 12) => life(f, a, b, fi, fo);
const Txt: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; size?: number; color?: string; serif?: boolean; w?: number; align?: "left" | "center" | "right"; weight?: number; caps?: boolean; track?: string }> = ({
  x, y, o, children, size = 22, color = C.white, serif, w, align = "left", weight = 700, caps = true, track = "0.06em",
}) => {
  if (o <= 0.001) return null;
  const ww = w ?? 1600;
  const left = align === "center" ? x - ww / 2 : align === "right" ? x - ww : x;
  return (
    <div style={{ position: "absolute", left, top: y, width: w || align !== "left" ? ww : undefined, textAlign: align, opacity: Math.min(1, o), transform: `translateY(${(1 - Math.min(1, o)) * 12}px)`, fontFamily: serif ? FONT.serif : FONT.sans, fontWeight: serif ? 400 : weight, fontSize: size, color, letterSpacing: serif ? 0 : track, textTransform: caps && !serif ? "uppercase" : "none", lineHeight: serif ? 1.05 : 1.2 }}>
      {children}
    </div>
  );
};
const Src: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; align?: "left" | "center" | "right"; w?: number }> = ({ x, y, o, children, align, w }) => (
  <Txt x={x} y={y} o={o} size={15} color={C.muted} weight={600} track="0.08em" align={align} w={w}>{children}</Txt>
);

/** Hanging emissive number tag: the focus light of the shot. o = presence, on = light (dimmed when not the topic). */
const Tag: React.FC<{ x: number; y: number; o: number; on?: number; num: string; cap: string; src?: string; w?: number; h?: number; hang?: boolean; numSize?: number }> = ({
  x, y, o, on, num, cap, src, w = 300, h = 210, hang = true, numSize,
}) => {
  if (o <= 0.001) return null;
  const lit = (on ?? 1) * o;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: Math.min(1, o * 1.4) }}>
      <Emissive x={x} y={y} w={w} h={h} on={lit} hangTo={hang ? y - h / 2 - 500 : undefined}>
        <div style={{ fontFamily: FONT.serif, fontSize: numSize ?? h * 0.44, lineHeight: 1, opacity: 0.25 + 0.75 * lit }}>{num}</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.09em", marginTop: 10, color: "#5b4a2a", textAlign: "center", padding: "0 18px", lineHeight: 1.3, opacity: 0.25 + 0.75 * lit }}>{cap}</div>
      </Emissive>
      {src && <Src x={x} y={y + h / 2 + 16} o={1} align="center" w={w + 260}>{src}</Src>}
    </div>
  );
};

/** Arrow sign on a post (Emissive board). dir 1 = points right. */
const Sign: React.FC<{ x: number; y: number; w?: number; on: number; o?: number; dir?: 1 | -1; title: string; sub?: string }> = ({ x, y, w = 400, on, o = 1, dir = 1, title, sub }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <Emissive x={x} y={y} w={w} h={74} on={on} shape="panel" bloom={0.7}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.3 + 0.7 * on }}>{dir === -1 ? "◂ " : ""}{title}{dir === 1 ? " ▸" : ""}</div>
        {sub && <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: "#5b4a2a", textTransform: "uppercase", opacity: 0.3 + 0.7 * on }}>{sub}</div>}
      </Emissive>
    </div>
  );
};

const Hero: React.FC<{ x: number; y?: number; h?: number; walk?: number; o?: number; facing?: 1 | -1 }> = ({ x, y = FLOOR, h = 150, walk = 0, o = 1, facing = 1 }) => (
  <>
    <Bloom x={x} y={y - h * 0.5} r={h * 0.75} o={0.35 * o} />
    <Layer>
      <Figure x={x} y={y} h={h} kind="hero" walk={walk} light={1} opacity={o} facing={facing} />
    </Layer>
  </>
);

const coldAt = (f: number) => Math.max(0, ...COLD.map(([a, b]) => life(f, a, b, 24, 30)));

type SP = { f: number; X: number; k: number };

// ---------- anchors ----------
const T = {
  teen: A("Ich habe schon als Teenager"),
  geliebt: A("sondern weil ich es geliebt"),
  studium: A("Nach dem Studium hatte"),
  job: A("einen Job gefunden"),
  traum: A("Softwareentwicklung mein Traumjob"),
  spass: A("Heute macht er mir"),
  wieLange: A("wie lange ich ihn noch"),
  einzige: A("Und ich bin nicht der Einzige"),
  indeed: A("Ende September hat"),
  dabei: A("Dabei ist KI eigentlich"),
  fasst: A("Sie fasst zusammen"),
  schreibt: A("sie schreibt"),
  progr: A("sie programmiert"),
  spart: A("sie spart Arbeit"),
  millionen: A("Millionenfach"),
  wennKI: A("Wenn KI so viel Arbeit"),
  beiDir: A("Bei dir"),
  beiChef: A("Bei deinem Chef"),
  niemand: A("Oder bei niemandem"),
  hausVor: A("Stell dir deine Arbeitswoche"),
  jedes: A("Jedes erleuchtete Fenster"),
  vierzig: A("hat im Schnitt 40"),
  genauer: A("Genauer 40,2"),
  keynes: A("1930 hat der Ökonom"),
  maschinen: A("Die Maschinen werden so viel"),
  fuenfzehn: A("15-Stunden-Woche reicht"),
  j2030: A("Das ist 2030"),
  vier: A("In vier Jahren"),
  beiKeynes: A("Bei Keynes brennen also"),
  seit1991: A("Seit 1991 schaffte"),
  gewachsen: A("Das Haus ist also gewachsen"),
  trotzdem: A("Und trotzdem brennen in der"),
  proKopf: A("im Durchschnitt arbeiten wir"),
  teilzeit: A("Aber das kommt fast nur"),
  wenigerGeld: A("Oft mit weniger Geld"),
  gespart: A("Die Zeit wurde gespart"),
  mitKI: A("Und mit KI passiert gerade"),
  trifft: A("Es trifft zuerst die"),
  sommer: A("Seit dem Sommer 2022"),
  heuteH: A("Heute liegen sie fast"),
  gesamt: A("Während der Arbeitsmarkt insgesamt"),
  sw: A("In der Softwareentwicklung meinem"),
  ifo: A("Das ifo-Institut sieht"),
  usa: A("Und in den USA"),
  niemandE: A("Niemand wird dafür entlassen"),
  wenigerJ: A("Es werden einfach weniger"),
  erfahrene: A("Die Erfahrenen bleiben"),
  tuer: A("Die Tür nach unten bleibt"),
  einer: A("Einer sagt offen"),
  amodei: A("Dario Amodei Chef der"),
  prognose: A("ist eine Prognose von"),
  messwert: A("Kein Messwert"),
  jungen: A("Aber die Jungen haben"),
  vierte: A("Fast jeder vierte"),
  sechste: A("Zwei Jahre vorher war"),
  wollte: A("Ich wollte Software bauen"),
  heuteS: A("Heute schreibe ich immer"),
  pruefe: A("Ich prüfe was eine"),
  schwer: A("Und es fällt mir schwer"),
  bleibt: A("Was bleibt dann von"),
  allein: A("Damit bin ich nicht allein"),
  so84: A("nutzen 84"),
  so29: A("Aber nur knapp 3"),
  so66: A("Der häufigste Frust"),
  metr: A("Erfahrene Entwickler waren"),
  hinterher: A("Und hinterher waren sie"),
  klein: A("Ein kleines Experiment"),
  gefuehl: A("Das Gefühl Zeit zu sparen"),
  cta2: A("Nicht nur bei ein paar"),
  daenemark: A("In Dänemark haben Forscher"),
  dk3: A("Im Schnitt sparten"),
  dkLohn: A("Und davon kamen nur"),
  dkFeier: A("Am Feierabend hat sich"),
  dkGefuellt: A("Die Zeit wird also gespart"),
  tickets: A("Mehr Tickets"),
  mails: A("mehr Mails"),
  meetings: A("mehr Meetings"),
  b45: A("2024 haben 45 Betriebe"),
  tag: A("Meistens einen Tag pro"),
  umsatz: A("Umsatz und Gewinn blieben"),
  weiter70: A("über 70"),
  uk: A("In Großbritannien 61"),
  fair: A("Fair ist das waren"),
  metall: A("in der Metall und Elektroindustrie"),
  acht: A("kann 8 freie Tage"),
  viertelmio: A("Beim ersten Mal haben"),
  stellVor: A("Stell dir vor die gesparte"),
  hobbys: A("für deine Hobbys"),
  gesundheit: A("für deine Gesundheit"),
  erfuellt: A("für das was dich"),
  system40: A("Unser System ist um"),
  rente: A("über deine Rente"),
  karriere: A("über deine Karriere"),
  ernst: A("ob du ernst genommen"),
  obwohl: A("Und obwohl eine Stunde"),
  loehne: A("sind die Löhne pro"),
  politisch: A("Die politische Richtung zeigt"),
  einzel: A("Und das ist keine Einzelmeinung"),
  iw: A("Das Institut der deutschen"),
  beleg: A("Und das weniger Arbeit"),
  boomer: A("Die Babyboomer gehen in"),
  ohneMehr: A("Ohne mehr Stunden oder"),
  bilder: A("Und jetzt halt die beiden"),
  oben: A("Oben fehlen uns bald"),
  unten: A("Unten an der Tür"),
  zwei: A("Das ist kein Widerspruch"),
  werBekommt: A("Wer bekommt die Zeit"),
  neueArbeit: A("Wird sie zu neuer Arbeit"),
  wenigerSt: A("Zu weniger Stellen für"),
  feierabend: A("Oder zu Feierabend für"),
  entscheidet: A("Das entscheidet keine KI"),
  h1: A("Wenn du Leute einstellst"),
  bryn: A("Der Stanford-Ökonom Eric"),
  h2: A("Verhandle Zeit nicht nur"),
  h2b: A("Das Beispiel aus der Metallindustrie"),
  h3: A("Miss deine KI-Zeit"),
  h3b: A("Damit hast du in jedem"),
  h4: A("Wenn du gerade einsteigst"),
  h4b: A("Und sie sind aktuell viel"),
  eKeynes: A("Keynes hatte 1930 gesagt"),
  frist: A("Seine Frist läuft"),
  technik: A("Die Technik dafür ist"),
  fehlt: A("Was fehlt ist die Entscheidung"),
  ichWeiss: A("Ich weiß nicht wie mein Beruf"),
  komm: A("Schreib mir in die Kommentare"),
  abo: A("Und wenn du willst dass die KI-Zukunft"),
  hoff: A("Dafür gibt es diesen Kanal"),
  nein: A("Nein Noch nicht entschieden"),
};

// ================= scenes =================
const Cold: React.FC<SP> = ({ f, X, k }) => {
  // opening: tilt down from the stars while the windows switch on row by row; push into the attic window (teenager
  // at the screen); pull back while the hero walks to the door (first job) and the door lights up.
  const lit = 40 * ramp(f, 10, 95);
  const attic = (0.35 + 0.65 * ramp(f, T.teen - 30, 30)) * (1 - 0.35 * ramp(f, T.spass, 30)) * (1 - ramp(f, T.wieLange + 20, 40));
  const type = 0.75 + 0.25 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  const walkP = ramp(f, T.studium + 10, 110);
  const heroX = lerp(720, 1040, walkP);
  const door = (0.15 + 0.75 * ramp(f, T.job, 30)) * (1 - k);
  const ay = houseTop() - 420 * 0.15;
  const tagO = fade(f, T.indeed, S.frage);
  const tagOn = 1 - 0.65 * ramp(f, T.dabei, 20);
  const tools: [string, number][] = [["Fasst zusammen", T.fasst], ["Schreibt", T.schreibt], ["Programmiert", T.progr], ["Spart Arbeit", T.spart]];
  return (
    <>
      <Backdrop id="c0" ax={X + 960} f={f} cold={k} city={0.3 + 0.4 * ramp(f, T.millionen, 40)} glowX={1300} seed={3} />
      <Layer>
        <House id="c0h" x={1180} lit={lit} cold={k} door={door} attic={attic} atticR={40} />
        {/* the teenager at the screen behind the attic window */}
        <g opacity={attic * (1 - k)}>
          <rect x={1180 - 20} y={ay - 4} width={30} height={20} fill="#fff6dc" opacity={type} />
          <circle cx={1180 + 16} cy={ay + 14} r={11} fill="#0b1430" />
          <rect x={1180 + 6} y={ay + 22} width={22} height={18} fill="#0b1430" />
        </g>
        <StreetLamp id="c0l" x={1520} on={1 - 0.8 * k} />
      </Layer>
      <Bloom x={1180} y={ay} r={150} o={0.45 * attic * (1 - k) * ramp(f, T.teen - 30, 30) * (1 - ramp(f, T.studium + 20, 40))} />
      <Hero x={heroX} h={140} walk={walkP > 0 && walkP < 1 ? f / 20 : 0} />
      <Label x={1330} y={houseTop() - 150} text="Softwareentwicklung" sub={["MEIN TRAUMJOB"]} inF={T.traum} outF={T.einzige} />
      <Tag x={520} y={430} o={tagO} on={tagOn} num="−46 %" cap="Stellen für Berufseinsteiger · vs. 2019" src="DEUTSCHLAND · INDEED HIRING LAB · 23.9.2026" />
      {tools.map(([t, a], i) => {
        const o = fade(f, a, S.frage);
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 250 + i * 190 - 80, top: 680, width: 170, opacity: o, transform: `translateY(${(1 - ramp(f, a, 12)) * 14}px)`, border: `1.5px solid ${C.tech}`, background: "rgba(10,40,90,0.55)", boxShadow: `0 0 22px rgba(127,208,255,0.35)`, padding: "10px 6px", textAlign: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 17, letterSpacing: "0.06em", color: C.tech, textTransform: "uppercase" }}>{t}</div>
        );
      })}
    </>
  );
};

const Frage: React.FC<SP> = ({ f, X }) => {
  const pOn = 1 - 0.6 * ramp(f, T.beiDir, 14);
  const s = (a: number, next: number) => (f < a ? 0.12 : f < next ? 1 : 0.4);
  return (
    <>
      <Backdrop id="c1" ax={X + 960} f={f} city={0.5} glowX={960} seed={5} />
      <Layer>
        <rect x={1296} y={420} width={10} height={FLOOR - 420} fill="#0a1534" />
        <StreetLamp id="c1l" x={520} on={0.8} />
      </Layer>
      <Emissive x={960} y={250} w={760} h={150} on={fade(f, T.wennKI) * pOn} shape="panel" hangTo={-300}>
        <div style={{ fontFamily: FONT.serif, fontSize: 64, lineHeight: 1, opacity: fade(f, T.wennKI) }}>Wo landet die gesparte Zeit?</div>
      </Emissive>
      <Sign x={1300} y={470} on={s(T.beiDir, T.beiChef)} o={fade(f, T.beiDir - 10)} title="Bei dir" />
      <Sign x={1300} y={560} on={s(T.beiChef, T.niemand)} o={fade(f, T.beiChef - 10)} dir={-1} title="Bei deinem Chef" />
      <Sign x={1300} y={650} on={s(T.niemand, 1e9)} o={fade(f, T.niemand - 10)} title="Bei niemandem" />
      <Hero x={1000} h={140} />
    </>
  );
};

const Mess: React.FC<SP> = ({ f, X }) => {
  const lit = f < T.jedes ? 0 : f < T.vierzig ? ramp(f, T.jedes, 14) : 1 + 39 * ramp(f, T.vierzig + 8, 50);
  const w0 = winPos(0, 700);
  const ghostO = fade(f, T.maschinen + 30);
  return (
    <>
      <Backdrop id="c2" ax={X + 960} f={f} city={0.25} glowX={1100} seed={7} />
      <Layer>
        <House id="c2h" x={700} lit={lit} o={ramp(f, T.hausVor - 30, 30)} door={0.4} />
        <StreetLamp id="c2l" x={1120} on={1} />
        <House id="c2k" x={1460} w={330} rows={3} lit={15 * ramp(f, T.fuenfzehn, 40)} ghost o={ghostO} />
        {fade(f, T.jedes, T.vierzig) > 0 && <line x1={w0.x + 30} y1={w0.y} x2={990} y2={w0.y} stroke={C.cream} strokeWidth={2} opacity={fade(f, T.jedes, T.vierzig)} />}
      </Layer>
      <Bloom x={w0.x} y={w0.y} r={170} o={0.7 * fade(f, T.jedes, T.vierzig + 40)} />
      <Label x={1000} y={w0.y - 16} text="1 Fenster = 1 Stunde Arbeit" inF={T.jedes} outF={T.vierzig + 30} />
      <SerifNumber x={1000} y={260} value={40} from={1} countF={50} inF={T.vierzig + 8} outF={T.genauer} size={150} />
      <Tag x={1110} y={330} o={fade(f, T.genauer, T.keynes)} num="40,2" cap="Stunden pro Woche · Vollzeit" src="MIKROZENSUS 2025 · DESTATIS" hang />
      <QuoteCard x={1460} y={60} w={600} quote="… Schichten von drei Stunden oder eine Fünfzehn-Stunden-Woche …" who="John Maynard Keynes · Ökonom" source="Economic Possibilities for our Grandchildren · 1930 · übersetzt" inF={T.keynes} outF={T.j2030 - 6} />
      <SerifNumber x={1460} y={170} align="center" value="2030" inF={T.j2030} outF={T.beiKeynes + 20} size={150} color={GOLD_HOT} />
      <Label x={1460} y={340} align="center" text="in vier Jahren" inF={T.vier} outF={T.beiKeynes + 20} />
      <Label x={1460} y={FLOOR + 30} align="center" text="Keynes 1930: 15" sub={["IN 100 JAHREN"]} inF={T.beiKeynes} />
      <Label x={700} y={FLOOR + 30} align="center" text="Heute: 40" sub={["VOLLZEIT · DESTATIS"]} inF={T.beiKeynes + 20} />
    </>
  );
};

const Problem: React.FC<SP> = ({ f, X }) => {
  const grow = 1 + 0.45 * ramp(f, T.seit1991 + 10, 70);
  const smallLit = 1 - 0.5 * ramp(f, T.wenigerGeld, 30);
  const tagA = fade(f, T.seit1991, T.proKopf);
  const tagB = fade(f, T.proKopf, S.k1);
  const tech = fade(f, T.mitKI, S.k1, 30);
  const smallO = fade(f, T.proKopf - 20);
  return (
    <>
      <Backdrop id="c3" ax={X + 960} f={f} city={0.3} glowX={800} seed={9} />
      <Bloom x={700} y={500} r={520} o={0.5 * tech} color={C.tech} />
      <Layer>
        <House id="c3h" x={700} floorH={52} grow={grow} lit={40} door={0.5} />
        {[[1300, 5], [1500, 4], [1700, 3]].map(([x, r], i) => (
          <House key={i} id={`c3s${i}`} x={x} w={150} cols={2} rows={r} floorH={52} lit={(r * 2 - 2 + (i % 2)) * smallLit} o={smallO} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Figure key={i} x={340 - i * 60} y={FLOOR + 4} h={100} kind="crowd" facing={1} opacity={fade(f, T.trifft + i * 6)} />
        ))}
      </Layer>
      <Tag x={1250} y={300} o={tagA} on={f > T.trotzdem ? 0.4 : 1} num="+41 %" cap="Leistung je Arbeitsstunde" src="1991–2019 · DESTATIS (BPB)" />
      <Label x={330} y={160} text="Vollzeit: weiter ~40 Fenster" inF={T.trotzdem} outF={T.proKopf} color={C.cream} />
      <Tag x={1500} y={230} o={tagB} on={f > T.mitKI ? 0.4 : 1} num="−14 %" cap="Stunden pro Kopf · seit 1991" src="IW · WIRTSCHAFTSDIENST 2026" h={190} />
      <Label x={1500} y={FLOOR + 30} align="center" text="Teilzeit" sub={["OFT MIT WENIGER GELD"]} inF={T.teilzeit} />
      <Label x={240} y={FLOOR + 30} align="center" text="Noch nicht drin" sub={["BERUFSEINSTEIGER"]} inF={T.trifft + 20} />
    </>
  );
};

// Indeed entry-level postings, index 2019 = 100 (F1): -46 % vs 2019, more than -2/3 from the July 2022 peak.
// Only the corner values are sourced; the path between them is simplified (said in the source line).
const ENTRY = [[2019, 100], [2020.3, 74], [2021.3, 112], [2022.55, 162], [2023.4, 122], [2024.4, 84], [2025.5, 63], [2026.55, 54]];
const TOTAL = [[2019, 100], [2020.3, 86], [2021.3, 106], [2022.55, 126], [2023.4, 118], [2024.4, 110], [2025.5, 108], [2026.55, 108]];
const Chart: React.FC<{ f: number; on: number }> = ({ f, on }) => {
  const w = 600, h = 300, x0 = 1450 - w / 2, y0 = 360 - h / 2;
  const px = (t: number) => 40 + ((t - 2019) / 7.6) * (w - 80);
  const py = (v: number) => h - 40 - (v / 180) * (h - 70);
  const d = (pts: number[][]) => pts.map(([t, v], i) => `${i ? "L" : "M"} ${px(t).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const draw = ramp(f, T.sommer, 90);
  const tot = ramp(f, T.gesamt, 30);
  return (
    <>
      <Emissive x={1450} y={360} w={w} h={h} on={on} shape="panel" bloom={0.8} />
      <svg width={w} height={h} style={{ position: "absolute", left: x0, top: y0, overflow: "visible" }}>
        <line x1={30} y1={py(100)} x2={w - 30} y2={py(100)} stroke="#6b6450" strokeWidth={1} strokeDasharray="4 5" opacity={0.7} />
        <text x={34} y={py(100) - 8} fontFamily={FONT.sans} fontWeight={700} fontSize={15} fill="#6b6450">2019 = 100</text>
        <path d={d(TOTAL)} stroke="#6b6450" strokeWidth={3} fill="none" strokeDasharray="8 6" opacity={tot} />
        <path d={d(ENTRY)} stroke={C.ink} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} strokeLinecap="round" />
        <circle cx={px(2022.55)} cy={py(162)} r={7} fill={C.heroShade} opacity={ramp(f, T.sommer + 40, 10)} />
        <circle cx={px(2026.55)} cy={py(54)} r={8} fill={C.heroShade} opacity={ramp(f, T.heuteH, 10)} />
        {[2019, 2022, 2026].map((t) => <text key={t} x={px(t)} y={h - 12} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={15} fill="#6b6450">{t}</text>)}
      </svg>
      <Txt x={x0 + px(2022.55) + 14} y={y0 + py(162) - 12} o={ramp(f, T.sommer + 40, 10) * on} size={16} color={C.ink}>Hoch · Juli 2022</Txt>
      <Txt x={x0 + px(2026.55) - 10} y={y0 + py(54) - 66} o={ramp(f, T.heuteH, 10) * on} size={28} color={C.heroShade} align="right" w={300}>−46 %</Txt>
      <Txt x={x0 + px(2026.55) - 10} y={y0 + py(54) - 34} o={ramp(f, T.heuteH, 10) * on} size={15} color={C.ink} align="right" w={300}>vs. 2019 · Juli 2026</Txt>
      <Txt x={x0 + px(2024.6)} y={y0 + py(108) - 34} o={tot * on} size={15} color="#6b6450">Gesamtmarkt +8 %</Txt>
      <Txt x={x0 + 26} y={y0 + 22} o={on} size={16} color={C.ink}>Stellenanzeigen für Berufseinsteiger</Txt>
      <Src x={1450} y={y0 + h + 14} o={1} align="center" w={900}>INDEED HIRING LAB · 23.9.2026 · ECKWERTE GEMESSEN, VERLAUF VEREINFACHT</Src>
    </>
  );
};

const K1: React.FC<SP> = ({ f, X, k }) => {
  const chartO = fade(f, S.k1 + 10, T.niemandE);
  const chartOn = f < T.sw ? 1 : 0.35;
  const door = (1 - ramp(f, T.tuer + 10, 30)) * 0.9 + 0.5 * ramp(f, T.jungen, 30);
  const queueO = 1 - 0.75 * ramp(f, T.wenigerJ, 40);
  const cardO = fade(f, T.amodei, T.jungen);
  const youth = fade(f, T.jungen);
  const tags: [number, number, string, string, string][] = [
    [T.sw, T.ifo, "−70 %", "Einstieg Softwareentwicklung · vs. 2019", "INDEED HIRING LAB · 23.9.2026"],
    [T.ifo, T.usa, "−14 %", "Junge Vollzeit · KI-nahe Berufe", "20–24 J. · IFO-KI-FRÜHINDIKATOR · 9.11.2026"],
    [T.usa, T.niemandE, "−19 %", "22–25 J. · stark KI-nahe Berufe · USA", "STANFORD DIGITAL ECONOMY LAB · 2026"],
  ];
  return (
    <>
      <Backdrop id="c4" ax={X + 960} f={f} cold={k} city={0.3} glowX={1400} seed={11} />
      <Layer>
        <House id="c4h" x={560} w={520} floorH={70} lit={40} cold={k * 0.9} door={door} />
        {Array.from({ length: 6 }, (_, i) => (
          <Figure key={i} x={720 + i * 78} y={FLOOR + 4} h={105 + (i % 2) * 8} kind="crowd" facing={-1} opacity={queueO} />
        ))}
      </Layer>
      {chartO > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: chartO }}>
          <Chart f={f} on={chartOn * chartO} />
        </div>
      )}
      {tags.map(([a, b, n, c, s], i) => <Tag key={i} x={1180} y={250} o={fade(f, a, b)} num={n} cap={c} src={s} />)}
      <Label x={860} y={houseTop(8, 70) + 40} text="Die Erfahrenen bleiben" inF={T.erfahrene} outF={T.amodei} />
      <Label x={720} y={FLOOR + 40} text="Weniger Junge eingestellt" sub={["EINSTELLUNGEN STATT ENTLASSUNGEN · STANFORD 2026"]} inF={T.wenigerJ} outF={T.amodei} />
      {cardO > 0 && (
        <div style={{ position: "absolute", left: 1060, top: 200, width: 640, opacity: cardO, transform: `translateY(${(1 - ramp(f, T.amodei, 14)) * 14}px)`, border: `1.5px solid ${C.tech}`, background: "rgba(8,26,70,0.82)", boxShadow: "0 0 40px rgba(127,208,255,0.18)", padding: "26px 32px" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 15, letterSpacing: "0.09em", color: C.muted }}>FIRMENCHEF · EIGENE PROGNOSE · MAI 2025</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 46, color: C.white, marginTop: 8 }}>Dario Amodei</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: C.cream, marginTop: 2 }}>CEO · ANTHROPIC</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, letterSpacing: "0.04em", color: C.tech, marginTop: 20, lineHeight: 1.35, textTransform: "uppercase" }}>
            Hälfte der Einstiegsjobs im Büro weg<br />Arbeitslosigkeit 10–20 %
          </div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 15, letterSpacing: "0.08em", color: C.muted, marginTop: 14 }}>IN 1–5 JAHREN · AXIOS 28.5.2025 / CNN 29.5.2025</div>
          {f > T.prognose && (
            <div style={{ marginTop: 18, display: "inline-block", border: `2px solid ${C.cream}`, padding: "6px 14px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, letterSpacing: "0.08em", color: C.cream, opacity: ramp(f, T.prognose, 10) }}>PROGNOSE ≠ MESSWERT</div>
          )}
        </div>
      )}
      {youth > 0 && (
        <>
          <Layer>
            {[0, 1, 2, 3].map((i) => <Figure key={i} x={1260 + i * 110} y={FLOOR + 4} h={i === 1 ? 118 : 112} kind={i === 1 ? "worker" : "crowd"} opacity={youth} />)}
          </Layer>
          <Bloom x={1370} y={FLOOR - 60} r={110} o={0.5 * youth} />
          <Tag x={1430} y={420} o={youth} num="24 %" cap="14–17 J.: Berufspläne durch KI in Gefahr" src="SINUS-JUGENDSTUDIE FÜR BARMER · 2025" h={200} />
          <Label x={1430} y={FLOOR + 40} align="center" text="2023: 17 % · jeder Sechste" inF={T.sechste} />
        </>
      )}
    </>
  );
};

/** The attic room: slanted roof, round window with the night city, desk, monitor (the focus light). */
const K2: React.FC<SP> = ({ f, X, k }) => {
  const screenOn = (0.25 + 0.75 * ramp(f, S.k2 + 10, 30)) * (1 - 0.85 * k);
  const handLines = Math.floor(7 * ramp(f, T.wollte, 90));
  const aiLines = Math.floor(9 * ramp(f, T.heuteS, 30));
  const checks = ramp(f, T.pruefe, 40);
  const wallO = fade(f, T.allein - 10);
  const roomPan = ramp(f, T.allein, 40);
  const bar = (a: number) => ramp(f, a, 30);
  const so: [number, string, string, number][] = [[T.so84, "84 %", "nutzen KI-Werkzeuge", T.so29], [T.so29, "29 %", "vertrauen dem Ergebnis", T.so66], [T.so66, "66 %", "Frust: „fast richtig“", T.metr]];
  return (
    <>
      <Backdrop id="c5" ax={X + 960} f={f} cold={k} city={0.4} glowX={600} seed={13} />
      {/* room interior: dark wall with slanted roof, round window onto the backdrop */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - 0.0 * roomPan }}>
        <defs>
          <mask id="c5win">
            <rect x={-300} y={-100} width={2600} height={1300} fill="#fff" />
            <circle cx={360} cy={330} r={150} fill="#000" />
          </mask>
        </defs>
        <rect x={-300} y={-100} width={2600} height={1300} fill="#0a173f" mask="url(#c5win)" />
        <path d="M -300 -100 L 900 -100 L -300 500 Z" fill="#071131" />
        <circle cx={360} cy={330} r={150} fill="none" stroke="#1a2a5c" strokeWidth={14} />
        <path d="M 210 330 H 510 M 360 180 V 480" stroke="#1a2a5c" strokeWidth={10} />
        <rect x={-300} y={FLOOR} width={2600} height={300} fill="#0d1d4c" />
        <rect x={-300} y={FLOOR} width={2600} height={3} fill={C.floorEdge} opacity={0.7} />
        {/* desk */}
        <rect x={560} y={700} width={560} height={16} fill="#1b2a5a" />
        <rect x={590} y={716} width={12} height={FLOOR - 716} fill="#13224f" />
        <rect x={1078} y={716} width={12} height={FLOOR - 716} fill="#13224f" />
        <rect x={830} y={660} width={20} height={40} fill="#13224f" />
      </svg>
      {/* monitor = focus light; cream when warm, grey-blue in the cold beat */}
      <Emissive x={840} y={540} w={400} h={250} on={screenOn} shape="panel" floorY={705} bloom={0.9}>
        <div style={{ position: "absolute", left: 22, top: 20, right: 22 }}>
          {Array.from({ length: handLines }, (_, i) => (
            <div key={i} style={{ height: 9, marginBottom: 9, width: `${40 + ((i * 37) % 50)}%`, marginLeft: (i % 3) * 22, background: C.ink, opacity: 0.55 * (1 - ramp(f, T.heuteS, 20)) }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 22, top: 20, right: 22 }}>
          {Array.from({ length: aiLines }, (_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
              <div style={{ height: 9, width: `${45 + ((i * 29) % 45)}%`, marginLeft: (i % 3) * 22, background: C.techDeep, opacity: 0.8 }} />
              <div style={{ marginLeft: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 14, color: C.heroShade, opacity: clamp01(checks * 9 - i) }}>✓</div>
            </div>
          ))}
        </div>
      </Emissive>
      {k > 0.01 && <AbsoluteFill style={{ background: "rgba(40,60,110,0.0)" }} />}
      <Hero x={1010} h={150} o={1 - 0.3 * k} facing={-1} />
      <Label x={560} y={760} text="Ich prüfe, was die Maschine schreibt" inF={T.pruefe} outF={T.schwer} color={C.cream} />
      {/* right wall: the numbers (Stack Overflow, METR) */}
      {wallO > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: wallO }}>
          {so.map(([a, n, c, b], i) => <Tag key={i} x={1340 + i * 250} y={300} w={220} h={170} o={fade(f, a)} on={f >= a && f < b ? 1 : 0.35} num={n} cap={c} hang />)}
          <Src x={1590} y={410} o={fade(f, T.so84)} align="center" w={800}>STACK OVERFLOW DEVELOPER SURVEY 2025 · WELTWEIT ~49.000</Src>
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <g opacity={fade(f, T.metr)}>
              <line x1={1350} y1={640} x2={1840} y2={640} stroke={C.cream} strokeWidth={2} />
              <rect x={1440} y={640 - 110 * bar(T.hinterher)} width={110} height={110 * bar(T.hinterher)} fill="none" stroke={C.cream} strokeWidth={2.5} strokeDasharray="7 6" />
              <rect x={1640} y={640} width={110} height={104 * bar(T.metr)} fill={GOLD_HOT} />
            </g>
          </svg>
          <Bloom x={1695} y={700} r={150} o={0.5 * fade(f, T.metr)} />
          <Txt x={1495} y={490} o={fade(f, T.hinterher)} size={28} align="center" w={420} color={C.cream}>gefühlt +20 %</Txt>
          <Txt x={1695} y={756} o={fade(f, T.metr)} size={28} align="center" w={420} color={GOLD_HOT}>gemessen −19 %</Txt>
          <Src x={1595} y={804} o={fade(f, T.metr)} align="center" w={760}>METR · 16 ERFAHRENE ENTWICKLER · 246 AUFGABEN · ANFANG 2025</Src>
          <Label x={1595} y={460} align="center" text="Kleine Studie · Werkzeuge seitdem besser" inF={T.klein} color={C.muted} size={18} />
        </div>
      )}
    </>
  );
};

const Cta: React.FC<SP> = ({ f, X }) => {
  const p = ramp(f, S.cta, 160);
  return (
    <>
      <Backdrop id="c6" ax={X + 960} f={f} city={0.2 + 0.6 * p} glowX={960} seed={15} />
      <Layer>
        {[[300, 260, 4], [620, 300, 6], [1300, 300, 6], [1620, 260, 4]].map(([x, w, r], i) => (
          <House key={i} id={`c6h${i}`} x={x} w={w} cols={4} rows={r} floorH={56} lit={r * 4 * clamp01(p * 1.6 - i * 0.15)} door={p} />
        ))}
      </Layer>
      <Emissive x={960} y={360} w={460} h={190} on={fade(f, S.cta + 10)} hangTo={-200} floorY={FLOOR}>
        <div style={{ fontFamily: FONT.serif, fontSize: 76, lineHeight: 1 }}>Für alle.</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.09em", color: "#5b4a2a", marginTop: 10 }}>NICHT NUR FÜR EIN PAAR KONZERNE</div>
      </Emissive>
      <Hero x={960} h={140} />
    </>
  );
};

const K3: React.FC<SP> = ({ f, X }) => {
  const freed = 22;
  const offW = f >= T.dkGefuellt + 20 && f < T.tickets ? new Set([freed]) : undefined;
  const wp = winPos(freed, 700);
  const cards: [string, number][] = [["Tickets", T.tickets], ["Mails", T.mails], ["Meetings", T.meetings]];
  return (
    <>
      <Backdrop id="c7" ax={X + 960} f={f} city={0.35} glowX={1300} seed={17} />
      <Layer>
        <House id="c7h" x={700} lit={40} off={offW} door={0.5} />
        <circle cx={wp.x} cy={wp.y} r={38} fill="none" stroke={C.cream} strokeWidth={2.5} opacity={fade(f, T.dkGefuellt, S.turn)} />
      </Layer>
      <Tag x={1300} y={300} o={fade(f, T.dk3, T.dkGefuellt)} on={f < T.dkLohn ? 1 : 0.35} num="3 %" cap="Arbeitszeit gespart durch Chatbots (Ø)" src="DÄNEMARK · REGISTERDATEN · HUMLUM & VESTERGAARD 2025" />
      <Tag x={1620} y={420} o={fade(f, T.dkLohn, T.dkGefuellt)} num="3–7 %" cap="davon als Lohn bei den Leuten" w={260} h={180} hang />
      <Label x={1300} y={FLOOR + 30} text="Feierabend: unverändert" inF={T.dkFeier} outF={T.dkGefuellt} color={C.cream} />
      {cards.map(([t, a], i) => {
        const p = ramp(f, a, 20);
        const o = fade(f, a, S.turn);
        if (o <= 0) return null;
        const x = lerp(1500, wp.x + 40 + i * 6, p), y = lerp(260 + i * 90, wp.y - 30 + i * 22, p);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: o, border: `1.5px solid ${C.tech}`, background: "rgba(10,40,90,0.85)", boxShadow: "0 0 18px rgba(127,208,255,0.35)", padding: "6px 14px", fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, letterSpacing: "0.06em", color: C.tech, textTransform: "uppercase" }}>{t}</div>
        );
      })}
      <Label x={wp.x + 60} y={wp.y + 70} text="Gesparte Stunde · sofort neu gefüllt" inF={T.tickets} outF={S.turn} />
    </>
  );
};

const Turn: React.FC<SP> = ({ f, X }) => {
  const friday = ramp(f, T.tag, 60); // top floor of houses 1 and 3 goes out warm
  const lamps = ramp(f, T.tag + 20, 40);
  const park = ramp(f, T.stellVor, 40);
  const houses: [number, boolean][] = [[220, false], [470, true], [720, false], [970, true], [1220, false]];
  const tags: [number, number, string, string, string][] = [
    [T.b45, T.weiter70, "45", "Betriebe · 6 Monate · meist 1 Tag/Woche weniger", "PILOTPROJEKT DEUTSCHLAND · UNI MÜNSTER 2024"],
    [T.weiter70, T.uk, "> 70 %", "der Betriebe machen weiter", "UNI MÜNSTER / INTRAPRENÖR · 2024"],
    [T.uk, T.metall, "56 / 61", "Firmen blieben dabei · UK 2022", "AUTONOMY U. A. · 2023"],
    [T.metall, T.stellVor, "8 Tage", "frei statt Zusatzgeld · Tarif Metall & Elektro", "IG METALL · T-ZUG SEIT 2018"],
  ];
  const lanterns: [string, number][] = [["Hobbys", T.hobbys], ["Gesundheit", T.gesundheit], ["Was dich erfüllt", T.erfuellt]];
  return (
    <>
      <Backdrop id="c8" ax={X + 960} f={f} city={0.45} glowX={1500} seed={19} />
      <Layer>
        {houses.map(([x, fr], i) => {
          const off = new Set<number>();
          if (fr) for (let k = 15; k < 15 + Math.round(3 * friday); k++) off.add(k);
          return <House key={i} id={`c8h${i}`} x={x} w={210} cols={3} rows={6} floorH={58} lit={18} off={off} door={0.4 + 0.5 * (fr ? friday : 0)} />;
        })}
        <StreetLamp id="c8l1" x={600} on={lamps} />
        <StreetLamp id="c8l2" x={1100} on={lamps} />
        <StreetLamp id="c8l3" x={1560} on={Math.max(lamps, park)} />
        {/* park: trees + bench */}
        {[1450, 1760, 1900].map((x, i) => (
          <g key={i} opacity={0.95}>
            <rect x={x - 5} y={FLOOR - 120} width={10} height={120} fill="#071131" />
            <circle cx={x} cy={FLOOR - 160} r={70 - i * 8} fill="#0a1a48" />
          </g>
        ))}
        <rect x={1610} y={FLOOR - 40} width={110} height={8} fill="#13224f" />
        <path d={`M 1380 ${FLOOR - 250} Q 1590 ${FLOOR - 200} 1840 ${FLOOR - 260}`} stroke={C.bgLift} strokeWidth={2} fill="none" opacity={park} />
        {[[1600, 1], [1660, 0], [1820, 1]].map(([x, w], i) => <Figure key={i} x={x} y={FLOOR + 4} h={108} kind="crowd" walk={w ? f / 22 + i : 0} opacity={0.9 * friday} />)}
      </Layer>
      {tags.map(([a, b, n, c, s], i) => <Tag key={i} x={1420} y={300} o={fade(f, a, b)} num={n} cap={c} src={s} w={330} h={200} />)}
      <Label x={1260} y={520} text="Umsatz und Gewinn: stabil" inF={T.umsatz} outF={T.weiter70} color={C.cream} />
      <Label x={1260} y={520} text="Freiwillige · keine Kontrollgruppe" sub={["EXPERIMENT, NICHT REPRÄSENTATIV"]} inF={T.fair} outF={T.metall} color={C.muted} />
      <Label x={1260} y={520} text="2019: 242.000 Anträge" sub={["IG METALL"]} inF={T.viertelmio} outF={T.stellVor} color={C.cream} />
      {lanterns.map(([t, a], i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: 0, opacity: fade(f, a - 6) }}><Emissive x={1460 + i * 175} y={FLOOR - 236 + (i === 1 ? 14 : 0)} w={150} h={62} shape="panel" on={fade(f, a) * (0.6 + 0.4 * (f < (lanterns[i + 1]?.[1] ?? S.system) ? 1 : 0))} hangTo={FLOOR - 270} bloom={0.6}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.07em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.15, opacity: fade(f, a) }}>{t}</div>
        </Emissive></div>
      ))}
      <Hero x={lerp(1250, 1560, park)} h={140} walk={f > T.stellVor && f < T.stellVor + 90 ? f / 20 : 0} />
    </>
  );
};

const System: React.FC<SP> = ({ f, X }) => {
  const beam = fade(f, T.system40 - 6);
  const crane = fade(f, T.politisch - 20, T.einzel + 30);
  const hook = lerp(80, 300, ramp(f, T.politisch, 300));
  const bars = fade(f, T.obwohl, T.politisch);
  const plac: [string, number][] = [["Rente", T.rente], ["Karriere", T.karriere], ["Ansehen", T.ernst]];
  return (
    <>
      <Backdrop id="c9" ax={X + 960} f={f} city={0.3} glowX={700} seed={21} />
      <Layer>
        <House id="c9h" x={640} floorH={56} lit={40} y={FLOOR - 50} door={0.4} />
        <g opacity={crane}>
          <Crane x={1060} hook={hook} />
          <rect x={1340} y={FLOOR - 640 + hook} width={260} height={56} fill="#13265a" stroke={C.tech} strokeWidth={1.5} />
        </g>
        <g opacity={bars}>
          <line x1={1280} y1={720} x2={1720} y2={720} stroke={C.cream} strokeWidth={2} />
          <rect x={1340} y={720 - 280 * ramp(f, T.obwohl, 30)} width={120} height={280 * ramp(f, T.obwohl, 30)} fill={GOLD_HOT} />
          <rect x={1540} y={720 - 250 * ramp(f, T.loehne, 30)} width={120} height={250 * ramp(f, T.loehne, 30)} fill="none" stroke={C.cream} strokeWidth={2.5} strokeDasharray="7 6" />
        </g>
      </Layer>
      <Emissive x={640} y={FLOOR - 22} w={560} h={56} shape="panel" on={beam * (f < T.obwohl ? 1 : 0.4)} bloom={0.8}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 24, letterSpacing: "0.1em", opacity: beam }}>FUNDAMENT: 40-STUNDEN-WOCHE</div>
      </Emissive>
      {plac.map(([t, a], i) => <Placard key={i} x={420 + i * 220} y={FLOOR + 76} w={180} text={t} inF={a} outF={S.gegen} serif />)}
      <Bloom x={1400} y={560} r={200} o={0.45 * bars} />
      <Txt x={1400} y={736} o={bars} size={18} align="center" w={200} color={GOLD_HOT}>Leistung je Stunde<br />+41 %</Txt>
      <Txt x={1600} y={736} o={fade(f, T.loehne, T.politisch)} size={18} align="center" w={200} color={C.cream}>Löhne je Stunde<br />etwas langsamer</Txt>
      <Src x={1500} y={814} o={bars} align="center" w={800}>1991–2019 · DESTATIS (BPB) · LÖHNE: VGR-AUSWERTUNG</Src>
      <Label x={1470} y={FLOOR - 700 + hook} align="center" text="Mehr Stunden" inF={T.politisch} outF={T.einzel + 30} color={C.tech} />
      <QuoteCard x={1400} y={160} w={660} quote="Eigentlich müssten wir uns überlegen, wie wir es schaffen, den Einzelnen dazu zu bewegen, mehr zu arbeiten." who="Holger Schäfer · Institut der deutschen Wirtschaft" source="MDR-Interview · 8.6.2026" inF={T.iw} outF={T.beleg} />
      <QuoteCard x={1400} y={160} w={660} quote="Wer weniger arbeitet, ist produktiver – dafür haben wir keinen Beleg." who="Holger Schäfer · Institut der deutschen Wirtschaft" source="MDR-Interview · 8.6.2026 · gekürzt" inF={T.beleg} outF={S.gegen} />
    </>
  );
};

const Gegen: React.FC<SP> = ({ f, X }) => {
  const leave = ramp(f, T.boomer, 160);
  const off = new Set<number>();
  for (let k = 30; k < 30 + Math.round(8 * leave); k++) off.add(k);
  const pan = ramp(f, T.werBekommt, 40);
  const s = (a: number, next: number) => (f < a ? 0.12 : f < next ? 1 : 0.45);
  return (
    <>
      <Backdrop id="c10" ax={X + 960} f={f} city={0.3} glowX={1500} seed={23} />
      <Layer>
        <House id="c10h" x={620} lit={40} off={off} door={0.9 * (1 - ramp(f, T.unten, 20))} />
        {[0, 1, 2].map((i) => <Figure key={i} x={lerp(860, 1180, clamp01(leave * 1.3 - i * 0.15))} y={FLOOR + 4} h={118} kind="elder" walk={leave > 0 && leave < 1 ? f / 22 + i : 0} opacity={fade(f, T.boomer + i * 10)} />)}
        {[0, 1].map((i) => <Figure key={i} x={460 - i * 70} y={FLOOR + 4} h={104} kind="crowd" opacity={fade(f, T.boomer + 40)} />)}
        <rect x={1546} y={360} width={10} height={FLOOR - 360} fill="#0a1534" opacity={pan} />
      </Layer>
      <Label x={940} y={houseTop() + 30} text="Babyboomer gehen in Rente" sub={["WENIGER JUNGE RÜCKEN NACH · IW 2026"]} inF={T.boomer} outF={T.bilder} />
      <Label x={940} y={houseTop() + 30} text="Oben: bald zu wenig Leute" inF={T.oben} outF={T.werBekommt} color={f > T.zwei ? GOLD_HOT : C.white} />
      <Label x={250} y={FLOOR + 36} text="Unten: Tür zu für Junge" inF={T.unten} outF={T.werBekommt} color={f > T.zwei ? GOLD_HOT : C.white} />
      <Label x={940} y={520} text="Zwei Probleme gleichzeitig" inF={T.zwei} outF={T.werBekommt} size={30} color={C.cream} />
      <Sign x={1550} y={420} w={480} on={s(T.neueArbeit, T.wenigerSt)} o={fade(f, T.neueArbeit - 6)} title="Neue Arbeit" sub="für die, die drin sind" />
      <Sign x={1550} y={520} w={480} on={s(T.wenigerSt, T.feierabend)} o={fade(f, T.wenigerSt - 6)} dir={-1} title="Weniger Stellen" sub="für die, die rein wollen" />
      <Sign x={1550} y={620} w={480} on={f < T.feierabend ? 0.12 : 1} o={fade(f, T.feierabend - 6)} title="Feierabend" sub="für alle" />
      <Hero x={lerp(980, 1420, ramp(f, T.entscheidet, 60))} h={140} walk={f > T.entscheidet && f < T.entscheidet + 60 ? f / 20 : 0} />
    </>
  );
};

const Hebel: React.FC<SP> = ({ f, X }) => {
  const at = [T.h1, T.h2, T.h3, T.h4];
  const titles = ["Junge trotzdem einstellen", "Zeit verhandeln, nicht nur Geld", "KI-Zeit messen statt fühlen", "Ausbildung mitdenken"];
  const subs: [string, number][][] = [
    [],
    [["VORBILD: T-ZUG METALL & ELEKTRO", T.h2b]],
    [["EINE WOCHE AUFSCHREIBEN", T.h3 + 40], ["METR: GEFÜHLT +20 %, GEMESSEN −19 %", T.h3b]],
    [["+50 % STELLEN VS. 2019 · INDEED", A("Dort gibt es heute")], ["STARK KI-BETROFFEN: 15 % (EINSTIEG 42 %)", T.h4b]],
  ];
  return (
    <>
      <Backdrop id="c11" ax={X + 960} f={f} city={0.3} glowX={960} seed={25} />
      <Layer>
        <rect x={110} y={300} width={1700} height={FLOOR - 300} fill="#0a1740" />
        <rect x={110} y={300} width={1700} height={3} fill={C.floorEdge} opacity={0.6} />
      </Layer>
      {at.map((a, i) => {
        const cur = f >= a && (i === 3 || f < at[i + 1]);
        const on = f < a ? 0 : cur ? 1 : 0.45;
        const x = 330 + i * 420;
        return (
          <React.Fragment key={i}>
            <Emissive x={x} y={540} w={360} h={250} on={on} shape="card" floorY={FLOOR} bloom={cur ? 1 : 0.5}>
              <div style={{ fontFamily: FONT.serif, fontSize: 96, lineHeight: 1, opacity: 0.2 + 0.8 * on }}>{i + 1}</div>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center", padding: "6px 22px 0", lineHeight: 1.2, opacity: 0.2 + 0.8 * on }}>{titles[i]}</div>
            </Emissive>
            {subs[i].map(([t, s], j) => <Src key={j} x={x} y={690 + j * 24} o={fade(f, s)} align="center" w={400}>{t}</Src>)}
          </React.Fragment>
        );
      })}
      <QuoteCard x={760} y={50} w={720} quote="Wer keine Junioren einstellt, wird auch keine Senioren bekommen." who="Erik Brynjolfsson · Stanford" source="Big Think · 2025 · übersetzt" inF={T.bryn} outF={T.h2} />
      <Hero x={960} h={120} />
    </>
  );
};

const End: React.FC<SP> = ({ f, X }) => {
  const outP = ramp(f, T.fehlt, 120);
  const off = new Set<number>();
  for (let k = 39; k > 39 - Math.round(8 * outP); k--) off.add(k);
  const walk = ramp(f, T.ichWeiss, 150);
  const ghost = fade(f, T.eKeynes, T.komm);
  return (
    <>
      <Backdrop id="c12" ax={X + 960} f={f} city={0.4 + 0.3 * outP} glowX={1300} seed={27} glow={0.8 + 0.2 * outP} />
      <Layer>
        <House id="c12h" x={640} lit={40} off={off} door={0.5 + 0.5 * outP} />
        <House id="c12k" x={1380} w={330} rows={3} lit={15} ghost o={ghost} />
        <StreetLamp id="c12l1" x={1000} on={0.3 + 0.7 * outP} />
        <StreetLamp id="c12l2" x={1700} on={0.3 + 0.7 * outP} />
      </Layer>
      <Label x={1380} y={FLOOR + 30} align="center" text="Keynes: 15" inF={T.eKeynes} outF={T.komm} />
      <SerifNumber x={1380} y={250} align="center" value="2030" inF={T.frist} outF={T.fehlt + 40} size={140} color={GOLD_HOT} />
      <Label x={640} y={FLOOR + 30} align="center" text="Wem gehört die gesparte Zeit?" inF={T.fehlt} outF={T.komm} color={C.cream} />
      <div style={{ position: "absolute", left: 0, top: 0, opacity: fade(f, T.komm - 8, T.hoff) }}><Emissive x={1380} y={380} w={620} h={230} on={fade(f, T.komm, T.hoff)} hangTo={-200} floorY={FLOOR}>
        <div style={{ fontFamily: FONT.serif, fontSize: 52, lineHeight: 1.08, textAlign: "center", opacity: fade(f, T.komm, T.hoff) }}>Ein Tag pro Woche geschenkt –<br />was machst du damit?</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.09em", color: "#5b4a2a", marginTop: 14, opacity: fade(f, T.komm, T.hoff) }}>SCHREIB ES IN DIE KOMMENTARE</div>
      </Emissive></div>
      <Bloom x={1380} y={330} r={520} ry={220} o={0.35 * fade(f, T.hoff + 20)} />
      <Txt x={1380} y={250} o={fade(f, T.hoff + 20)} serif size={110} align="center" w={1000} color={C.cream}>Hoffnungslos?</Txt>
      <Txt x={1380} y={390} o={fade(f, T.nein)} serif size={64} align="center" w={1000} color={GOLD_HOT}>Nein. Noch nicht entschieden.</Txt>
      <Hero x={lerp(640, 1060, walk)} h={140} walk={walk > 0 && walk < 1 ? f / 20 : 0} />
    </>
  );
};

const SCENES: Record<SceneId, React.FC<SP>> = { cold: Cold, frage: Frage, mess: Mess, problem: Problem, k1: K1, k2: K2, cta: Cta, k3: K3, turn: Turn, system: System, gegen: Gegen, hebel: Hebel, end: End };

// ---------- camera ----------
type Move = { at: number; x: number; y: number; zoom: number; d?: number };
const LOCAL_MOVES: Partial<Record<SceneId, Move[]>> = {
  cold: [
    { at: 4, x: 1180, y: 470, zoom: 1.2, d: 75 },
    { at: T.teen - 12, x: 1180, y: houseTop() - 63, zoom: 2.1, d: 70 },
    { at: T.studium - 6, x: 1060, y: 560, zoom: 1.2, d: 70 },
    { at: T.spass, x: 1180, y: 380, zoom: 1.35, d: 60 },
    { at: T.einzige, x: 900, y: 520, zoom: 1.0, d: 50 },
    { at: T.dabei, x: 860, y: 540, zoom: 1.0, d: 40 },
  ],
  frage: [{ at: T.beiDir - 20, x: 1150, y: 520, zoom: 1.08, d: 40 }],
  mess: [
    { at: T.hausVor, x: 820, y: 520, zoom: 1.05, d: 45 },
    { at: T.keynes, x: 1300, y: 500, zoom: 1.05, d: 50 },
    { at: T.beiKeynes, x: 1060, y: 540, zoom: 0.95, d: 45 },
  ],
  problem: [
    { at: T.seit1991, x: 960, y: 500, zoom: 0.95, d: 45 },
    { at: T.trifft, x: 520, y: 660, zoom: 1.3, d: 50 },
  ],
  k1: [
    { at: T.sommer - 20, x: 1300, y: 450, zoom: 1.15, d: 40 },
    { at: T.sw, x: 1000, y: 520, zoom: 1.0, d: 40 },
    { at: T.niemandE, x: 760, y: 560, zoom: 1.08, d: 45 },
    { at: T.tuer, x: 620, y: 660, zoom: 1.3, d: 50 },
    { at: T.amodei, x: 1060, y: 520, zoom: 1.0, d: 45 },
    { at: T.jungen, x: 1200, y: 560, zoom: 1.05, d: 45 },
  ],
  k2: [
    { at: S.k2 + 30, x: 860, y: 560, zoom: 1.15, d: 50 },
    { at: T.schwer, x: 860, y: 580, zoom: 1.3, d: 60 },
    { at: T.allein, x: 1290, y: 520, zoom: 1.0, d: 45 },
  ],
  k3: [
    { at: T.dk3 - 10, x: 1100, y: 520, zoom: 1.0, d: 40 },
    { at: T.dkGefuellt, x: 860, y: 480, zoom: 1.25, d: 45 },
  ],
  turn: [
    { at: T.uk, x: 1000, y: 520, zoom: 1.02, d: 40 },
    { at: T.stellVor, x: 1440, y: 600, zoom: 1.2, d: 50 },
  ],
  system: [
    { at: T.obwohl, x: 1150, y: 520, zoom: 1.0, d: 40 },
    { at: T.iw, x: 1180, y: 500, zoom: 1.0, d: 40 },
  ],
  gegen: [
    { at: T.bilder, x: 760, y: 520, zoom: 1.05, d: 45 },
    { at: T.werBekommt, x: 1350, y: 520, zoom: 1.08, d: 45 },
  ],
  hebel: [
    { at: T.h1 - 6, x: 560, y: 480, zoom: 1.12, d: 40 },
    { at: T.h2 - 6, x: 960, y: 520, zoom: 1.1, d: 40 },
    { at: T.h3 - 6, x: 1200, y: 520, zoom: 1.12, d: 40 },
    { at: T.h4 - 6, x: 1390, y: 520, zoom: 1.12, d: 40 },
    { at: T.h4b + 30, x: 960, y: 540, zoom: 1.0, d: 45 },
  ],
  end: [
    { at: T.eKeynes, x: 1000, y: 520, zoom: 0.98, d: 45 },
    { at: T.komm, x: 1200, y: 520, zoom: 1.02, d: 45 },
    { at: T.hoff, x: 1250, y: 480, zoom: 1.05, d: 60 },
  ],
};

const CAM_KEYS: CamKey[] = (() => {
  const moves: Move[] = [];
  ORDER.forEach((id) => {
    const X = SCENE_X(id);
    const start = id === "cold" ? { at: 0, x: 1180, y: -260, zoom: 1.2, d: 1 } : { at: S[id] - 12, x: 960, y: 540, zoom: 1.0, d: 42 };
    moves.push({ ...start, x: X + start.x });
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
export const L02_CHAPTERS: { text: string; at: number }[] = [
  { text: "Wie misst man das?", at: S.mess },
  { text: "Warum findet keiner mehr den ersten Job?", at: S.k1 },
  { text: "Warum macht die Arbeit keinen Spaß mehr?", at: S.k2 },
  { text: "Wo landet die gesparte Zeit?", at: S.k3 },
  { text: "Müssen wir nicht eher mehr arbeiten?", at: S.system },
  { text: "Was heißt das für dich?", at: S.hebel },
];

export const L02: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, CAM_KEYS, 0);
  // NO breathing in holds (user, L02 chunk check): with the pixel-snapped camera a slow sine drift becomes visible 1-px
  // jumps of the whole frame. Holds are truly still; life comes from moves, windows, stars, figures.
  const camC = cam;
  const k = coldAt(f);
  const world = (
    <>
      {ORDER.map((id) => {
        const a = S[id] - 120, b = sceneEnd(id) + 90;
        if (f < a || f > b) return null;
        const Sc = SCENES[id];
        return (
          // clipped to its own 2600-px slot: the far parallax layers of a neighbour set must not slide over this one
          <div key={id} style={{ position: "absolute", left: SCENE_X(id) - 340, top: -700, width: 2600, height: 2600, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 340, top: 700, width: 1920, height: 1080 }}>
              <Sc f={f} X={SCENE_X(id)} k={k} />
            </div>
          </div>
        );
      })}
    </>
  );
  const overlay = (
    <>
      {L02_CHAPTERS.map((c, i) => <ChapterTag key={i} text={c.text} inF={c.at + 20} outF={(L02_CHAPTERS[i + 1]?.at ?? S.end) - 5} />)}
      {CLIPS.map((c) => <FootageQuote key={c.id} clip={c} />)}
      <Captions words={WORDS} y={962} />
      <AbsoluteFill style={{ background: "#000", opacity: ramp(f, L02_FRAMES - 40, 38), pointerEvents: "none" }} />
    </>
  );
  return <Stage cam={camC} world={world} overlay={overlay} />;
};
