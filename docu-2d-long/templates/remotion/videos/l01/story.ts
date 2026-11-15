// Timing for L01 "Wie schnell KI unsere Jobs einholt". Every cue is anchored to a spoken PHRASE in words.json
// (the user's own recording, Whisper word times). A(phrase, after) throws at import if a phrase is missing.
import raw from "./words.json";
import { Word } from "../../lib/docu/anim";

export const WORDS = raw as Word[];
export const FPS = 30;
export const VOICE_LEN = 638.11; // seconds, wie_schnell_ki_unsere_jobs_einholt.wav
export const L01_FRAMES = Math.ceil((VOICE_LEN + 3) * FPS);

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const N = WORDS.map((w) => norm(w.word));

/** Start frame (minus `lead`) of the first occurrence of `phrase` that starts at or after frame `after`. */
export function A(phrase: string, after = 0, lead = 2): number {
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i + p.length <= N.length; i++) {
    if (WORDS[i].start * FPS < after) continue;
    let ok = true;
    for (let k = 0; k < p.length; k++) if (N[i + k] !== p[k]) { ok = false; break; }
    if (ok) return Math.round(WORDS[i].start * FPS) - lead;
  }
  throw new Error(`phrase "${phrase}" after frame ${after} not in words.json`);
}
/** End frame of a phrase. */
export function E(phrase: string, after = 0): number {
  const a = A(phrase, after, 0);
  const i = WORDS.findIndex((w) => Math.round(w.start * FPS) === a);
  const n = phrase.split(/\s+/).filter((s) => norm(s)).length;
  return Math.round(WORDS[i + n - 1].end * FPS);
}

// Scene starts (the camera glides there, ~40 f, starting 10 f before the anchor)
export const S = {
  cold: 0,
  frage: A("Rund 13 Millionen"),
  mess: A("Dafür brauchen wir zuerst"),
  problem: A("Schon zwischen 2019"),
  rankA: A("Platz 10 Komponistinnen"),
  cta: A("Kurz zwischendurch"),
  rankB: A("Platz 6"),
  p2: A("Platz 2 der Beruf"),
  p1: A("Vor wenigen Tagen"),
  gegen: A("Und es gibt die andere Seite"),
  hebel: A("Was nimmst du also mit"),
  end: A("Denk noch einmal"),
};
export const ORDER = ["cold", "frage", "mess", "problem", "rankA", "cta", "rankB", "p2", "p1", "gegen", "hebel", "end"] as const;
export type SceneId = (typeof ORDER)[number];
export const SCENE_X = (id: SceneId) => ORDER.indexOf(id) * 2600;
export const sceneEnd = (id: SceneId) => {
  const i = ORDER.indexOf(id);
  return i + 1 < ORDER.length ? S[ORDER[i + 1]] : L01_FRAMES;
};
