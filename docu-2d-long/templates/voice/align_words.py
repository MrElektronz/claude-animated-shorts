"""Word timings for a local take: words.json for captions, .srt and every animation cue.

Usage: python align_words.py <take_dir> [<take_dir2> ...] --out voice/words.json [--gap 0.9]

For each chunk in take.json, Whisper (large-v3-turbo, GPU) listens to exactly that slice of take.wav and returns
word times. Those times are laid onto the KNOWN script words (difflib alignment), so spelling always comes from the
script, never from the recogniser. Unmatched words are interpolated between their matched neighbours.
Several take dirs (one per chapter) are joined in order with `--gap` seconds of silence -> voice.wav next to --out.

Quality report: every chunk gets a match score (share of script words Whisper heard). Score < 0.85 usually means
the TTS slipped (skipped, repeated or invented words): re-generate that chunk with qwen_say.py --only <i> --seed <n>.
"""
import argparse
import difflib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ttstext import norm, tokens  # noqa: E402

ASR_MODEL = "openai/whisper-large-v3-turbo"


def load_asr():
    import torch
    from transformers import pipeline

    return pipeline("automatic-speech-recognition", model=ASR_MODEL, torch_dtype=torch.float16, device="cuda:0")


def to16k(x, sr):
    import torch
    import torchaudio.functional as AF

    return AF.resample(torch.from_numpy(x.astype(np.float32)), sr, 16000).numpy()


def align_chunk(asr, audio16, script_tokens):
    r = asr({"raw": audio16, "sampling_rate": 16000}, return_timestamps="word",
            generate_kwargs={"language": "german", "task": "transcribe"})
    heard = [(c["text"].strip(), c["timestamp"][0], c["timestamp"][1]) for c in r.get("chunks", []) if c["text"].strip()]
    a = [norm(t["word"]) for t in script_tokens]
    b = [norm(h[0]) for h in heard]
    times = [None] * len(a)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            h = heard[blk.b + k]
            times[blk.a + k] = (h[1], h[2] if h[2] is not None else h[1] + 0.2)
    matched = sum(t is not None for t in times)
    dur = len(audio16) / 16000
    # interpolate gaps by character length between matched neighbours
    i = 0
    while i < len(times):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(times) and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < len(times) else dur
        lens = [max(1, len(a[k])) for k in range(i, j)]
        tot, acc = sum(lens), t0
        for k, L in zip(range(i, j), lens):
            d = (t1 - t0) * L / tot
            times[k] = (acc, acc + d * 0.9)
            acc += d
        i = j
    score = matched / max(1, len(a))
    return times, score, " ".join(h[0] for h in heard)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("takes", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--gap", type=float, default=0.9)
    a = ap.parse_args()

    asr = load_asr()
    words, report, voice, offset = [], [], [], 0.0
    for ti, td in enumerate(map(Path, a.takes)):
        x, sr = sf.read(td / "take.wav", dtype="float32")
        meta = json.loads((td / "take.json").read_text(encoding="utf-8"))
        for c in meta:
            seg = x[int(c["start"] * sr): int(c["end"] * sr)]
            toks = tokens(c["text"])
            times, score, heard = align_chunk(asr, to16k(seg, sr), toks)
            for t, (s, e) in zip(toks, times):
                w = {"word": t["word"], "start": round(offset + c["start"] + s, 3), "end": round(offset + c["start"] + e, 3)}
                if t["show"] is not None:
                    w["show"] = t["show"]
                words.append(w)
            flag = "  <-- CHECK" if score < 0.85 else ""
            report.append(f"{td.name} c_{c['i']:03d} score {score:.2f}{flag}\n  script: {c['spoken']}\n  heard:  {heard}")
            print(report[-1].splitlines()[0])
        voice.append(x if sr == 48000 else to16k(x, sr))
        offset += len(x) / sr
        if ti + 1 < len(a.takes):
            voice.append(np.zeros(int(a.gap * 48000), np.float32))
            offset += a.gap
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    sf.write(out.parent / "voice.wav", np.concatenate(voice), 48000, subtype="PCM_16")
    (out.parent / "align_report.txt").write_text("\n".join(report), encoding="utf-8")
    print(f"{len(words)} words, {offset:.1f}s -> {out}, voice.wav, align_report.txt")


if __name__ == "__main__":
    main()
