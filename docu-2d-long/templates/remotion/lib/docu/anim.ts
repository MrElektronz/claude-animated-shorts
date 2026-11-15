// Timing helpers. Everything in frames at 30 fps; story beats are derived from words.json via `at()`.
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smoother = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 -> 1 between frame a and a+dur (smootherstep). */
export const ramp = (f: number, a: number, dur = 12) => smoother((f - a) / dur);

/** Element visibility: fades in at `inF`, out at `outF` (if given). Returns 0..1. */
export const life = (f: number, inF: number, outF = Infinity, fadeIn = 10, fadeOut = 8) =>
  Math.min(ramp(f, inF, fadeIn), 1 - ramp(f, outF, fadeOut));

/** Standard reveal used by every label/card: fade + 14 px rise (measured: 8-12 f). */
export const reveal = (f: number, inF: number, outF = Infinity, rise = 14) => {
  const v = life(f, inF, outF);
  return { opacity: v, transform: `translateY(${(1 - ramp(f, inF, 12)) * rise}px)` };
};

/** Piecewise keyframes: [{f, v}] -> value at frame, smootherstep between neighbours. */
export function keys(f: number, ks: { f: number; v: number }[]): number {
  if (f <= ks[0].f) return ks[0].v;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (f <= b.f) return lerp(a.v, b.v, smoother((f - a.f) / Math.max(1, b.f - a.f)));
  }
  return ks[ks.length - 1].v;
}

/** `word` = what the voice says (TTS spelling), `show` = optional caption spelling ("1184" for "elfhundertvierundachtzig"). */
export type Word = { word: string; start: number; end: number; show?: string };

/** Frame at which the n-th occurrence of `w` (case/punctuation-insensitive) starts, minus `lead` frames. */
export function at(words: Word[], w: string, n = 1, lead = 2, fps = 30): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const target = norm(w);
  let k = 0;
  for (const x of words) {
    if (norm(x.word) === target && ++k === n) return Math.round(x.start * fps) - lead;
  }
  throw new Error(`word "${w}" #${n} not in words.json`);
}
