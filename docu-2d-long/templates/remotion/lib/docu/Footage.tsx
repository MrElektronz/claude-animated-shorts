// Original footage quote: a real clip (video + its own audio) instead of a written quote card.
// Screen-space overlay (not in the camera world: video stays sharp, text does not shimmer). The world behind dims.
// Layout: clip framed on the right 2/3, lower-third on the left with a gold bar:
//   HONESTY LABEL (e.g. FIRMENANGABE · EIGENE ZAHL)
//   ORIGINALAUFNAHME
//   Name (serif)
//   ROLLE · ORGANISATION
//   ANLASS · DATUM
// The clip's audio is NOT played here (muted): it is placed into the mix by insert_clips.py / make_audio.py.
// Source URL + timestamp go into the video description (Zitatrecht: Quelle nennen).
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";
import { ramp } from "./anim";
import { GOLD_HOT } from "./Scenery";

export type ClipInfo = {
  id: string;
  file: string; // path under public/, e.g. "clips/l02/altman.mp4"
  startF: number; // timeline frame where the clip starts (from voice/timeline/clips.json)
  durF: number;
  // the file (cut by insert_clips.py) starts CLIP_PAD_F frames before the quote and ends CLIP_PAD_F after it
  who: string;
  role: string; // "CEO · OPENAI"
  event: string; // "SENATSANHÖRUNG · 16.5.2023"
  label?: string; // honesty label, e.g. "FIRMENANGABE · EIGENE ZAHL"
  translated?: boolean; // captions are a German translation
};

export const CLIP_PAD_F = 15; // = insert_clips.py PAD_S * 30

export const FootageQuote: React.FC<{ clip: ClipInfo }> = ({ clip }) => {
  const pad = CLIP_PAD_F;
  const f = useCurrentFrame();
  const a = clip.startF - pad, b = clip.startF + clip.durF + pad;
  if (f < a - 2 || f > b + 2) return null;
  const o = ramp(f, a, 12) * (1 - ramp(f, b - 10, 10));
  const pop = 0.965 + 0.035 * ramp(f, a, 16);
  const vw = 1210, vh = 680, vx = 530, vy = 100;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,8,30,0.9) 0%, rgba(3,8,30,0.8) 28%, rgba(3,8,30,0.6) 45%, rgba(3,8,30,0.6) 100%)", opacity: o }} />
      <div style={{ position: "absolute", left: vx, top: vy, width: vw, height: vh, opacity: o, transform: `scale(${pop})`, transformOrigin: "50% 50%", boxShadow: "0 30px 90px rgba(0,0,0,0.6), 0 0 80px rgba(255,170,60,0.12)", border: `1.5px solid ${C.line}`, background: "#000", overflow: "hidden" }}>
        <Sequence from={a} durationInFrames={b - a} layout="none">
          <OffthreadVideo src={staticFile(clip.file)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Sequence>
      </div>
      <div style={{ position: "absolute", left: 110, top: 540, width: 400, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
        {clip.label && <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", color: C.muted, marginBottom: 22, textTransform: "uppercase" }}>{clip.label}</div>}
        <div style={{ borderLeft: `4px solid ${GOLD_HOT}`, paddingLeft: 22, boxShadow: `-6px 0 18px -10px ${GOLD_HOT}` }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 17, letterSpacing: "0.08em", color: GOLD_HOT }}>ORIGINALAUFNAHME{clip.translated ? " · ÜBERSETZT" : ""}</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 46, color: C.white, lineHeight: 1.1, marginTop: 6 }}>{clip.who}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 17, letterSpacing: "0.08em", color: C.cream, marginTop: 8, textTransform: "uppercase" }}>{clip.role}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 17, letterSpacing: "0.08em", color: C.cream, marginTop: 4, textTransform: "uppercase" }}>{clip.event}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
