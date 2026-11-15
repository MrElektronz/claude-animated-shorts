"""Step 1 for a HUMAN recording (no TTS): Whisper word times for one long audio file.

Usage: python asr_recording.py <recording.wav> <heard.json>

Writes [{"word", "start", "end"}] exactly as heard. Step 2 (align_recording.py) lays these times onto the script
words, so caption spelling comes from the script.
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
import torchaudio.functional as AF
from transformers import pipeline

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
x, sr = sf.read(src, dtype="float32")
if x.ndim > 1:
    x = x.mean(axis=1)
x16 = AF.resample(torch.from_numpy(x), sr, 16000).numpy()
asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo", torch_dtype=torch.float16,
               device="cuda:0", chunk_length_s=30, stride_length_s=5)
r = asr({"raw": x16, "sampling_rate": 16000}, return_timestamps="word",
        generate_kwargs={"language": "german", "task": "transcribe"})
out, last = [], 0.0
for c in r["chunks"]:
    t = c["text"].strip()
    if not t:
        continue
    a, b = c["timestamp"]
    a = last if a is None else a
    b = a + 0.25 if b is None else b
    out.append({"word": t, "start": round(float(a), 3), "end": round(float(b), 3)})
    last = b
dst.write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding="utf-8")
print(f"{len(out)} words, last at {last:.1f}s of {len(x) / sr:.1f}s -> {dst}")
