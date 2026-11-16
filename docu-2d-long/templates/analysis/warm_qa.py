"""Contrast QA: how much warm light (gold/orange/cream, lit) is in the picture? Flags "too blue" stretches.

usage: python -I warm_qa.py <video.mp4 | folder with .png/.jpg> [every_s=2]
Measured 2026-11-16 (1 frame / 6 s): reference videos warm median 2.4-8.9 %, 43-72 % of frames >= 3 % warm,
bright (luma > 0.5) median 4.4-6.8 %.  L01 had warm 0.2 %, 13 %, bright 1.5 % -> "zu blau" (user feedback).
Targets: warm median >= 4 %, >= 60 % of samples >= 3 % warm, bright median >= 3 %, no stretch > 10 s under 1 % warm.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

FF = "ffmpeg"
W, H = 320, 180


def frames_video(p, every):
    raw = subprocess.run([FF, "-v", "error", "-i", str(p), "-vf", f"fps=1/{every},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    return [(i * every, f) for i, f in enumerate(a)]


def frames_dir(d):
    from PIL import Image
    fs = sorted([p for p in Path(d).iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg")])
    return [(p.name, np.asarray(Image.open(p).convert("RGB").resize((W, H)))) for p in fs]


def stats(img):
    a = img.astype(float) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    warm = ((r > b + 0.08) & (L > 0.35)).mean()
    bright = (L > 0.5).mean()
    return warm, bright


def main():
    src = Path(sys.argv[1])
    every = float(sys.argv[2]) if len(sys.argv) > 2 else 2
    fr = frames_dir(src) if src.is_dir() else frames_video(src, every)
    rows = [(k, *stats(im)) for k, im in fr]
    w = np.array([r[1] for r in rows])
    b = np.array([r[2] for r in rows])
    ok = [np.median(w) >= 0.04, (w >= 0.03).mean() >= 0.6, np.median(b) >= 0.03]
    print(f"samples {len(rows)}  warm median {np.median(w)*100:.1f} % (>=4)  frames>=3% warm {100*(w>=0.03).mean():.0f} % (>=60)  "
          f"bright median {np.median(b)*100:.1f} % (>=3)  -> {'PASS' if all(ok) else 'TOO BLUE'}")
    if src.is_dir():
        for k, wv, bv in rows:
            print(f"  {k:30s} warm {wv*100:5.1f} %  bright {bv*100:5.1f} %{'   <- too blue' if wv < 0.03 else ''}")
        return
    # stretches under 1 % warm longer than 10 s
    run = None
    for k, wv, _ in rows + [(rows[-1][0] + every, 1.0, 0)]:
        if wv < 0.01 and run is None:
            run = k
        elif wv >= 0.01 and run is not None:
            if k - run > 10:
                print(f"  too blue {int(run//60)}:{run%60:04.1f} - {int(k//60)}:{k%60:04.1f} ({k-run:.0f} s)")
            run = None


if __name__ == "__main__":
    main()
