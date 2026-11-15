import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, T } from "./theme";
import { reveal, life, ramp, Word } from "./anim";

type Pos = { x: number; y: number; align?: "left" | "right" | "center" };
const anchor = (align: Pos["align"]) => (align === "right" ? "translateX(-100%)" : align === "center" ? "translateX(-50%)" : "");

/**
 * Data label (world space): CAPS headline + optional sub-lines with " · " separators.
 * The reference puts a source on EVERY number: sub = "GEMESSEN · OEPPEN & VAUPEL 2002".
 */
export const Label: React.FC<Pos & { text: string; sub?: string[]; inF: number; outF?: number; color?: string; size?: number }> = ({
  x, y, align = "left", text, sub = [], inF, outF, color = C.white, size = T.label.size,
}) => {
  const f = useCurrentFrame();
  const r = reveal(f, inF, outF);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: anchor(align), textAlign: align, opacity: r.opacity }}>
      <div style={{ transform: r.transform }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: size, letterSpacing: T.label.tracking, color, textTransform: "uppercase", lineHeight: 1.12, whiteSpace: "pre" }}>
          {text}
        </div>
        {sub.map((s, i) => (
          <div key={i} style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: T.subLabel.size, letterSpacing: T.subLabel.tracking, color: i === 0 ? C.gold : C.muted, textTransform: "uppercase", marginTop: i === 0 ? 6 : 2, whiteSpace: "pre" }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Big serif number / year / title (Instrument Serif), optionally counting up from `from`. */
export const SerifNumber: React.FC<Pos & { value: number | string; inF: number; outF?: number; size?: number; color?: string; from?: number; countF?: number; format?: (n: number) => string; italic?: boolean }> = ({
  x, y, align = "left", value, inF, outF, size = T.number.size, color = C.cream, from, countF = 24, format = (n) => Math.round(n).toLocaleString("de-DE"), italic,
}) => {
  const f = useCurrentFrame();
  const r = reveal(f, inF, outF);
  const shown = typeof value === "number" && from !== undefined ? format(from + (value - from) * ramp(f, inF, countF)) : typeof value === "number" ? format(value) : value;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: anchor(align), opacity: r.opacity }}>
      <div style={{ transform: r.transform, fontFamily: FONT.serif, fontStyle: italic ? "italic" : "normal", fontSize: size, color, lineHeight: 1, whiteSpace: "pre", textShadow: "0 0 30px rgba(236,224,183,0.25)" }}>{shown}</div>
    </div>
  );
};

/** Cream placard (years, names, "DU") standing on the floor. */
export const Placard: React.FC<{ x: number; y: number; text: string; inF?: number; outF?: number; w?: number; serif?: boolean; dim?: number }> = ({ x, y, text, inF = -99, outF, w = 120, serif = true, dim = 1 }) => {
  const f = useCurrentFrame();
  const o = life(f, inF, outF);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 62, width: w, height: 62, opacity: o, filter: `brightness(${dim})` }}>
      <div style={{ width: "100%", height: "100%", background: `linear-gradient(180deg, ${C.paper}, ${C.gold})`, clipPath: "polygon(6% 0, 94% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif ? FONT.serif : FONT.sans, fontWeight: serif ? 400 : 800, letterSpacing: serif ? 0 : "0.08em", fontSize: serif ? 44 : 24, color: C.ink }}>
        {text}
      </div>
    </div>
  );
};

/** Chapter question, screen-fixed top-left in a thin frame (stays for the whole chapter). Feeds YouTube chapters too. */
export const ChapterTag: React.FC<{ text: string; inF: number; outF?: number }> = ({ text, inF, outF }) => {
  const f = useCurrentFrame();
  const o = life(f, inF, outF, 12, 12);
  return (
    <div style={{ position: "absolute", left: 40, top: 40, opacity: o, border: `1.5px solid ${C.line}`, padding: "7px 12px", fontFamily: FONT.sans, fontWeight: T.chapter.weight, fontSize: T.chapter.size, letterSpacing: T.chapter.tracking, color: C.white, textTransform: "uppercase", background: "rgba(5,14,44,0.35)" }}>
      {text}
    </div>
  );
};

/** Quote on cream paper (instead of interview clips). Serif quote, caps attribution + source/date. */
export const QuoteCard: React.FC<{ x: number; y: number; w?: number; quote: string; who: string; source: string; inF: number; outF?: number }> = ({ x, y, w = 760, quote, who, source, inF, outF }) => {
  const f = useCurrentFrame();
  const o = life(f, inF, outF, 12, 10);
  const pop = 0.96 + 0.04 * ramp(f, inF, 14);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, opacity: o, transform: `scale(${pop}) translateY(${(1 - ramp(f, inF, 14)) * 18}px)`, transformOrigin: "50% 0" }}>
      <div style={{ background: `linear-gradient(170deg, #f8f0d2, ${C.paper} 60%, #e6d6a6)`, padding: "34px 44px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 60px rgba(236,224,183,0.18)", borderRadius: 3 }}>
        <div style={{ fontFamily: FONT.serif, fontSize: 40, lineHeight: 1.22, color: C.ink }}>„{quote}“</div>
        <div style={{ marginTop: 22, fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", color: C.ink, textTransform: "uppercase" }}>{who}</div>
        <div style={{ marginTop: 3, fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", color: "#6b6450", textTransform: "uppercase" }}>{source}</div>
      </div>
    </div>
  );
};

/**
 * Burned-in captions from words.json. Chunks of ≤ maxWords / ≤ maxChars, broken after punctuation.
 * Inter 500, white, soft dark shadow, lower centre, 4 f fade (measured).
 */
export function chunkWords(words: Word[], maxWords = 7, maxChars = 44) {
  const out: { text: string; a: number; b: number }[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ text: cur.map((w) => w.show ?? w.word).filter((t) => t !== "").join(" "), a: cur[0].start, b: cur[cur.length - 1].end });
    cur = [];
  };
  for (const w of words) {
    const len = cur.map((x) => x.show ?? x.word).join(" ").length + (w.show ?? w.word).length + 1;
    if (cur.length >= maxWords || len > maxChars) flush();
    cur.push(w);
    const t = w.show ?? w.word;
    if (/[.!?:;]$/.test(t) || (/,$/.test(t) && cur.length >= 3)) flush();
  }
  flush();
  return out;
}

export const Captions: React.FC<{ words: Word[]; fps?: number; y?: number }> = ({ words, fps = 30, y = 880 }) => {
  const f = useCurrentFrame();
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const t = f / fps;
  const i = chunks.findIndex((c, k) => t >= c.a - 0.05 && t < (chunks[k + 1]?.a ?? c.b + 0.6) - 0.05);
  if (i < 0) return null;
  const c = chunks[i];
  const nextA = chunks[i + 1]?.a ?? c.b + 0.6;
  const inF = Math.round((c.a - 0.05) * fps);
  const outF = Math.round(Math.min(c.b + 0.5, nextA - 0.05) * fps) - 4;
  const o = life(f, inF, outF, 4, 4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: o }}>
      <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 42, color: "#fff", letterSpacing: "0.01em", textShadow: "0 2px 3px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)" }}>{c.text}</span>
    </div>
  );
};

/** Line that draws itself on (charts, connections). `glow` for the cyan "tech" line. */
export const DrawPath: React.FC<{ d: string; inF: number; dur?: number; color?: string; width?: number; glow?: boolean; dash?: string; outF?: number }> = ({
  d, inF, dur = 40, color = C.cream, width = 3, glow, dash, outF,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, inF, dur);
  const o = life(f, inF, outF, 1, 10);
  return (
    <g opacity={o}>
      {glow && <path d={d} pathLength={1} stroke={color} strokeWidth={width * 5} fill="none" strokeDasharray={`${p} 1`} opacity={0.25} style={{ filter: "blur(6px)" }} strokeLinecap="round" />}
      <path d={d} pathLength={dash ? undefined : 1} stroke={color} strokeWidth={width} fill="none" strokeDasharray={dash ?? `${p} 1`} strokeLinecap="round" opacity={dash ? p : 1} />
    </g>
  );
};
