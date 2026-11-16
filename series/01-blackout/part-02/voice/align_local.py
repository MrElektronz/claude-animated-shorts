"""Local word timings for a take made in the ElevenLabs web app (no API permission needed).

Usage (inside part-NN/voice/):  python align_local.py <take.mp3> [take] [model=small]
Runs faster-whisper with word timestamps, then maps the recognised words onto the words of script_tts.txt
(so words.json keeps OUR spelling; Whisper's spelling of numbers and names is ignored). Words Whisper missed get
times interpolated from their neighbours and are listed at the end: check those by ear.
"""
import difflib
import json
import re
import sys
from pathlib import Path

from faster_whisper import WhisperModel

HERE = Path.cwd()


def norm(w: str) -> str:
    return re.sub(r"[^\wäöüß]", "", w.lower())


def main(audio: str, take: str = "1", model: str = "small") -> None:
    script = (HERE / "script_tts.txt").read_text(encoding="utf-8").split()
    m = WhisperModel(model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(audio, language="de", word_timestamps=True)
    rec = [w for s in segs for w in s.words]
    a, b = [norm(w) for w in script], [norm(w.word) for w in rec]
    times: list[tuple[float, float] | None] = [None] * len(script)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            w = rec[blk.b + k]
            times[blk.a + k] = (w.start, w.end)
    missing = [i for i, t in enumerate(times) if t is None]
    for i in missing:  # interpolate between the nearest known neighbours
        lo = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
        hi_j = next((j for j in range(i + 1, len(times)) if times[j]), None)
        hi = times[hi_j][0] if hi_j is not None else lo + 0.4
        gap = [j for j in range(i, hi_j if hi_j is not None else len(times)) if times[j] is None]
        step = (hi - lo) / (len(gap) + 0) if gap else 0.3
        for n, j in enumerate(gap):
            times[j] = (lo + n * step, lo + (n + 1) * step)
    words = [{"word": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(script, times)]
    (HERE / f"words_{take}.json").write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"words_{take}.json: {len(words)} words, ends at {words[-1]['end']:.2f} s, "
          f"{len(missing)} interpolated: {[script[i] for i in missing][:20]}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(*sys.argv[1:4])
