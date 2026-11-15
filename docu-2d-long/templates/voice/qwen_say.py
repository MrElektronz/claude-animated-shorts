"""Local voice-over with Qwen3-TTS (voice clone of the channel voice). No cloud, no API key.

Usage (TTS venv, see docu-2d-long/references/VOICE_LOCAL.md):
  python qwen_say.py <profile_dir> <out_root> <kapitel_01.txt> [<kapitel_02.txt> ...] [--seed 7] [--only k01:3,k02:0]

profile_dir (e.g. B:/Projects/Youtube/tts/voices/kanal_dynamisch2):
  ref.wav  - 10-20 s of the channel voice, calm but lively explainer tone
  ref.txt  - exact transcript of ref.wav
For every chapter file <name>.txt it writes <out_root>/<name>/:
  c_000.wav ...   one raw file per chunk as generated (24 kHz)
  take.wav        chunks joined seamlessly, 48 kHz mono 16-bit
  take.json       chunk list: text (markup), spoken, start/end in take.wav, words/s
The model is loaded once for all chapters. Existing chunk files are reused; re-make a bad one with
--only <name>:<i> and another --seed. take.wav is always rebuilt from the chunk files.

Seam handling (measured on the first tests: digital-silence gaps, a clipped tail, ±24 % tempo, ±1.5 dB):
  - chunks = whole paragraphs up to MAX_CHARS, so seams fall where a pause belongs anyway
  - soft trim: keep 40 ms before the first and 180 ms after the last loud frame, 15/60 ms fades
  - pauses are filled with room tone at the voice's own noise floor, never digital silence
  - every chunk is levelled to the take's median speech loudness
  - tempo is pulled toward the take's median words/s (pitch-preserving, at most ±10 %)
"""
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ttstext import chunks, paragraphs, spoken  # noqa: E402

SR = 48000
MAX_CHARS = 700
PAUSE_SENT = 0.30      # between chunks inside one paragraph (only when a paragraph is longer than MAX_CHARS)
PAUSE_PARA = 0.70      # between paragraphs
LEAD, TAIL = 0.6, 1.0
LOUD_DB = -40.0        # frame counts as speech above this
TEMPO_MAX = 0.10       # max tempo correction
TEMPO_TOL = 0.05       # leave chunks within ±5 % of the median alone
TAIL_DB = -45.0        # a raw chunk whose last 50 ms is louder than this was cut off -> regenerate


def frames_db(x, sr, ms=10):
    f = max(1, sr * ms // 1000)
    n = len(x) // f
    return 20 * np.log10(np.sqrt(np.mean(x[: n * f].reshape(n, f) ** 2, axis=1) + 1e-12)), f


def soft_trim(x, sr):
    r, f = frames_db(x, sr)
    loud = np.where(r > LOUD_DB)[0]
    if not len(loud):
        return x
    a = max(0, loud[0] * f - int(0.04 * sr))
    b = min(len(x), (loud[-1] + 1) * f + int(0.18 * sr))
    y = x[a:b].copy()
    fi, fo = int(0.015 * sr), int(0.06 * sr)
    y[:fi] *= np.linspace(0, 1, fi)
    y[-fo:] *= np.linspace(1, 0, fo) ** 2
    return y


def speech_db(x, sr):
    r, _ = frames_db(x, sr)
    s = r[r > LOUD_DB]
    return float(np.mean(s)) if len(s) else -30.0


def noise_floor_db(x, sr):
    r, _ = frames_db(x, sr, 20)
    return float(np.percentile(r, 5))


def room_tone(n, level_db, rng):
    # pink-ish noise at the voice's own floor, so pauses sound like the same room
    w = rng.standard_normal(n + 64).astype(np.float32)
    b = np.convolve(w, np.ones(8) / 8, mode="same")[:n]
    b /= np.sqrt(np.mean(b ** 2)) + 1e-9
    return b * (10 ** (level_db / 20))


def resample(x, sr, to):
    if sr == to:
        return x.astype(np.float32)
    import torch
    import torchaudio.functional as AF
    return AF.resample(torch.from_numpy(x.astype(np.float32)), sr, to).numpy()


def atempo(x, sr, factor, tmp: Path):
    """Pitch-preserving tempo change via ffmpeg (factor > 1 = faster)."""
    src, dst = tmp / "_t_in.wav", tmp / "_t_out.wav"
    sf.write(src, x, sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", f"atempo={factor:.4f}", str(dst)], check=True)
    y, _ = sf.read(dst, dtype="float32")
    src.unlink(missing_ok=True)
    dst.unlink(missing_ok=True)
    return y


def plan_for(path: Path):
    paras = paragraphs(path.read_text(encoding="utf-8"))
    return [(pi, c) for pi, p in enumerate(paras) for c in chunks(p, MAX_CHARS)]


def build_take(out: Path, plan, seed):
    rng = np.random.default_rng(seed)
    raw = []
    for i in range(len(plan)):
        x, sr = sf.read(out / f"c_{i:03d}.wav", dtype="float32")
        raw.append(soft_trim(resample(x, sr, SR), SR))
    words = [len(spoken(c).split()) for _, c in plan]
    rates = np.array([w / (len(x) / SR) for w, x in zip(words, raw)])
    med_rate = float(np.median(rates))
    fixed = []
    for x, rate in zip(raw, rates):
        k = med_rate / rate  # >1 -> speed up
        if abs(k - 1) > TEMPO_TOL:
            k = float(np.clip(k, 1 - TEMPO_MAX, 1 + TEMPO_MAX))
            x = atempo(x, SR, k, out)
        fixed.append(x)
    target = float(np.median([speech_db(x, SR) for x in fixed]))
    fixed = [x * 10 ** ((target - speech_db(x, SR)) / 20) for x in fixed]
    floor = float(np.median([noise_floor_db(x, SR) for x in fixed])) - 2.0

    xf = int(0.02 * SR)  # 20 ms crossfade at every join (room tone <-> speech)
    y = room_tone(int(LEAD * SR), floor, rng)
    meta = []

    def join(y, p):
        n = min(xf, len(y), len(p))
        r = np.linspace(0, 1, n, dtype=np.float32)
        start = len(y) - n  # where p begins in the result
        return np.concatenate([y[:-n], y[-n:] * (1 - r) + p[:n] * r, p[n:]]), start

    for i, ((pi, c), x) in enumerate(zip(plan, fixed)):
        y, s = join(y, x + room_tone(len(x), floor, rng) * 0.7)
        meta.append({"i": i, "para": pi, "text": c, "spoken": spoken(c), "start": round(s / SR, 3),
                     "end": round((s + len(x)) / SR, 3), "rate_raw": round(float(rates[i]), 2),
                     "rate": round(words[i] / (len(x) / SR), 2)})
        gap = TAIL if i + 1 == len(plan) else (PAUSE_PARA if plan[i + 1][0] != pi else PAUSE_SENT)
        y, _ = join(y, room_tone(int(gap * SR), floor, rng))
    peak = float(np.max(np.abs(y))) or 1.0
    y = y * min(1.0, 0.89 / peak)
    sf.write(out / "take.wav", y, SR, subtype="PCM_16")
    (out / "take.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  take.wav {len(y) / SR:.1f}s, {len(plan)} chunks, tempo {med_rate:.2f} w/s, raw rates {np.round(rates, 2).tolist()}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("profile")
    ap.add_argument("out_root")
    ap.add_argument("texts", nargs="+")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--only", default="", help="name:i[,name:i] chunks to re-generate")
    ap.add_argument("--model", default="1.7B", choices=["1.7B", "0.6B"])
    a = ap.parse_args()

    prof, root = Path(a.profile), Path(a.out_root)
    only = {}
    for tok in filter(None, a.only.split(",")):
        name, i = tok.split(":")
        only.setdefault(name, set()).add(int(i))
    jobs = []
    for tp in map(Path, a.texts):
        out = root / tp.stem
        out.mkdir(parents=True, exist_ok=True)
        plan = plan_for(tp)
        todo = [i for i in range(len(plan)) if (i in only.get(tp.stem, set())) or (not only and not (out / f"c_{i:03d}.wav").exists())]
        jobs.append((tp, out, plan, todo))

    if any(todo for *_, todo in jobs):
        import torch
        from qwen_tts import Qwen3TTSModel

        t0 = time.time()
        model = Qwen3TTSModel.from_pretrained(f"Qwen/Qwen3-TTS-12Hz-{a.model}-Base", device_map="cuda:0",
                                              dtype=torch.bfloat16, attn_implementation="sdpa")
        prompt = model.create_voice_clone_prompt(ref_audio=str(prof / "ref.wav"),
                                                 ref_text=(prof / "ref.txt").read_text(encoding="utf-8").strip())
        print(f"model + voice loaded in {time.time() - t0:.0f}s")
        for tp, out, plan, todo in jobs:
            for i in todo:
                t1 = time.time()
                text = spoken(plan[i][1])
                # Qwen3-TTS often cuts the last phoneme of a chunk (measured: last 50 ms at -23 dB on questions).
                # A trailing " …" lets the voice decay naturally; a tail still louder than TAIL_DB is re-rolled.
                tts_text = text if text.endswith("…") else text + " …"
                for attempt in range(3):
                    torch.manual_seed(a.seed + i + 1000 * attempt)
                    wavs, sr = model.generate_voice_clone(text=[tts_text], language=["German"],
                                                          voice_clone_prompt=prompt, max_new_tokens=4096)
                    w = np.asarray(wavs[0], dtype=np.float32)
                    tail = 20 * np.log10(np.sqrt(np.mean(w[-sr // 20:] ** 2)) + 1e-9)
                    if tail < TAIL_DB:
                        break
                    print(f"  c_{i:03d} tail {tail:.0f} dB -> retry")
                sf.write(out / f"c_{i:03d}.wav", w, sr)
                print(f"{tp.stem} c_{i:03d} {len(w) / sr:5.1f}s audio in {time.time() - t1:5.1f}s  {text[:60]}")
    for tp, out, plan, _ in jobs:
        print(tp.stem)
        build_take(out, plan, a.seed)


if __name__ == "__main__":
    main()
