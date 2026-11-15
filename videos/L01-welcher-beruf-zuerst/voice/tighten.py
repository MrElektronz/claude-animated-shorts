"""Shorten pauses in a voice take and shift the word timings to match.

Usage: python tighten.py take_<x>.mp3 words_<x>.json [out_prefix]
Writes <out_prefix>.wav (48 kHz mono 16-bit) and <out_prefix>_words.json (default prefix: voice).

Silence is found in the audio itself (RMS in 10 ms frames below THRESH_DB). Every silent run longer than
its cap is cut down to the cap, keeping equal parts of its start and end, with 8 ms fades at the joint.
Cap: KEEP_SENTENCE after . ! ? : (sentence ends), KEEP_WORD otherwise (commas, breaths).
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
FRAME = SR // 100          # 10 ms
THRESH_DB = -42.0
KEEP_WORD = 0.12
KEEP_SENTENCE = 0.28
LEAD_IN = 0.15             # silence kept before the first word
TAIL = 0.40                # silence kept after the last word
FADE = int(0.008 * SR)


def load(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def silent_runs(x: np.ndarray, min_len: float) -> list[tuple[int, int]]:
    n = len(x) // FRAME
    rms = np.sqrt(np.mean(x[: n * FRAME].reshape(n, FRAME) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < THRESH_DB
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * FRAME >= min_len * SR:
                runs.append((i * FRAME, min(j * FRAME, len(x))))
            i = j
        else:
            i += 1
    return runs


def main() -> None:
    mp3, wjson = sys.argv[1], sys.argv[2]
    prefix = sys.argv[3] if len(sys.argv) > 3 else "voice"
    x = load(mp3)
    words = json.loads(Path(wjson).read_text(encoding="utf-8"))
    first, last = words[0]["start"] * SR, words[-1]["end"] * SR

    cuts = []  # (start_sample, end_sample) to remove
    for a, b in silent_runs(x, KEEP_WORD):
        mid_t = (a + b) / 2 / SR
        if b <= first + FRAME:        # leading silence
            keep = LEAD_IN
        elif a >= last - FRAME:       # trailing silence
            keep = TAIL
        else:
            before = [w for w in words if w["end"] <= mid_t + 0.05]
            ends_sentence = bool(before) and before[-1]["word"][-1] in ".!?:"
            keep = KEEP_SENTENCE if ends_sentence else KEEP_WORD
        k = int(keep * SR)
        if b - a > k:
            cuts.append((a + k // 2, b - (k - k // 2)))

    pieces, pos = [], 0
    for a, b in cuts:
        seg = x[pos:a].copy()
        if len(seg) > 2 * FADE:
            seg[-FADE:] *= np.linspace(1, 0, FADE)
            if pos:
                seg[:FADE] *= np.linspace(0, 1, FADE)
        pieces.append(seg)
        pos = b
    tail = x[pos:].copy()
    if pos and len(tail) > FADE:
        tail[:FADE] *= np.linspace(0, 1, FADE)
    pieces.append(tail)
    y = np.concatenate(pieces)

    def remap(t: float) -> float:
        s = t * SR
        removed = sum(min(b, s) - a for a, b in cuts if s > a)
        return round((s - removed) / SR, 3)

    out_words = [{"word": w["word"], "start": remap(w["start"]), "end": remap(w["end"])} for w in words]
    with wave.open(f"{prefix}.wav", "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    Path(f"{prefix}_words.json").write_text(json.dumps(out_words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(x)/SR:.2f} s -> {len(y)/SR:.2f} s ({len(cuts)} pauses cut), last word ends {out_words[-1]['end']:.2f} s")


if __name__ == "__main__":
    main()
