// Timing for L02 "Hoffnungslos?". Every cue is anchored to a spoken PHRASE in words.json (= voice/timeline/words.json:
// the user's recording with the two original-footage clips inserted by insert_clips.py). A() throws if a phrase is missing.
import raw from "./words.json";
import clipsRaw from "./clips.json";
import { Word } from "../../lib/docu/anim";
import { ClipInfo } from "../../lib/docu/Footage";

export const WORDS = raw as (Word & { clip?: string })[];
export const CLIPS = clipsRaw as ClipInfo[];
export const FPS = 30;
export const TIMELINE_LEN = 513.78; // seconds, voice/timeline/voice.wav
export const L02_FRAMES = Math.ceil((TIMELINE_LEN + 3) * FPS);

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const N = WORDS.map((w) => (w.clip ? "\u0000" : norm(w.word))); // clip subtitles never match narration phrases

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

export const S = {
  cold: 0,
  frage: A("Heute gehen wir einer"),
  mess: A("Um das zu messen"),
  problem: A("Aber hat Keynes sich"),
  k1: A("Fangen wir unten an"),
  k2: A("Und die, die drin sind"),
  cta: A("Kurz zwischendurch"),
  k3: A("Denn jetzt kommt die gute"),
  turn: A("Aber es geht auch anders"),
  system: A("Nur es liegt nicht daran"),
  gegen: A("Das Argument ist ernst"),
  hebel: A("Was kannst du also tun"),
  end: A("Denk noch einmal an das"),
};
export const ORDER = ["cold", "frage", "mess", "problem", "k1", "k2", "cta", "k3", "turn", "system", "gegen", "hebel", "end"] as const;
export type SceneId = (typeof ORDER)[number];
export const SCENE_X = (id: SceneId) => ORDER.indexOf(id) * 2600;
export const sceneEnd = (id: SceneId) => {
  const i = ORDER.indexOf(id);
  return i + 1 < ORDER.length ? S[ORDER[i + 1]] : L02_FRAMES;
};

/** Deliberately cold scenes (KALT in the script): the warm light goes out. Also passed to warm_qa.py --cold. */
export const COLD: [number, number][] = [
  [A("Und ich weiß ehrlich gesagt"), A("Und ich bin nicht der Einzige")],
  [A("Die Tür nach unten bleibt"), A("Aber die Jungen haben")],
  [A("Und es fällt mir schwer"), A("Damit bin ich nicht allein")],
];

export const CLIP = (id: string) => {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) throw new Error(`clip ${id} missing`);
  return c;
};
