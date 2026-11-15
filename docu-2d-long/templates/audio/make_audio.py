"""L01 sound: own ambient music bed + quiet SFX under the user's recorded voice -> mix.wav (-14 LUFS, TP <= -1.5).

Usage (any Python with numpy/scipy/soundfile, ffmpeg on PATH):
  python make_audio.py            -> audio/mix.wav, audio/stems/{voice,music,sfx}.wav
Music: composed here (D minor ambient: detuned-saw pads, soft bell arpeggios, a low pulse in tense parts), sections follow
the picture (scene starts are found by the same spoken phrases as story.ts). Ducked ~10 dB under the voice while speaking.
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import lfilter, oaconvolve

HERE = Path(__file__).resolve().parent
VID = HERE.parent
SR = 48000
FPS = 30
VOICE_SRC = VID / "voice" / "wie_schnell_ki_unsere_jobs_einholt.wav"
WORDS = json.loads((VID / "voice" / "words.json").read_text(encoding="utf-8"))
DUR = int(np.ceil((638.11 + 3) * FPS)) / FPS  # = L01_FRAMES / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(7)


def norm(s):
    return re.sub(r"[^\w]", "", s.lower())


NW = [norm(w["word"]) for w in WORDS]


def A(phrase, after=0.0):
    p = [norm(t) for t in phrase.split() if norm(t)]
    for i in range(len(NW) - len(p) + 1):
        if WORDS[i]["start"] >= after and NW[i:i + len(p)] == p:
            return WORDS[i]["start"]
    raise SystemExit(f"phrase not found: {phrase}")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


def m2f(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- sections ----------
S = {
    "cold": 0.0, "frage": A("Rund 13 Millionen"), "mess": A("Dafür brauchen wir zuerst"), "problem": A("Schon zwischen 2019"),
    "rankA": A("Platz 10 Komponistinnen"), "cta": A("Kurz zwischendurch"), "rankB": A("Platz 6"), "p2": A("Platz 2 der Beruf"),
    "p1": A("Vor wenigen Tagen"), "gegen": A("Und es gibt die andere Seite"), "hebel": A("Was nimmst du also mit"), "end": A("Denk noch einmal"),
}
CH = {
    "Dm": ([50, 53, 57, 62], 38), "Bb": ([50, 53, 58, 62], 34), "F": ([48, 53, 57, 60], 41), "C": ([48, 52, 55, 60], 36),
    "Gm": ([50, 55, 58, 62], 43), "A": ([49, 52, 57, 61], 45), "Am": ([48, 52, 57, 60], 45),
}
# progression, pad gain, arp gain, pulse gain
SEC = {
    "cold": (["Dm", "Dm", "Bb", "A"], 0.9, 0.0, 0.7),
    "frage": (["Dm", "Bb", "F", "C"], 0.8, 0.5, 0.4),
    "mess": (["Dm", "Bb", "Gm", "A"], 0.7, 0.6, 0.0),
    "problem": (["Dm", "Bb", "Gm", "A"], 0.85, 0.5, 0.8),
    "rankA": (["Dm", "Bb", "F", "C"], 0.75, 0.7, 0.5),
    "cta": (["F", "C", "Dm", "Bb"], 0.7, 0.4, 0.0),
    "rankB": (["Dm", "Bb", "F", "C"], 0.75, 0.7, 0.6),
    "p2": (["Bb", "F", "C", "Dm"], 0.75, 0.5, 0.3),
    "p1": (["Dm", "Gm", "Dm", "A"], 0.9, 0.3, 0.9),
    "gegen": (["F", "C", "Bb", "F"], 0.75, 0.5, 0.0),
    "hebel": (["Bb", "F", "C", "Dm"], 0.75, 0.7, 0.3),
    "end": (["Dm", "Bb", "F", "C"], 0.85, 0.6, 0.2),
}
ORDER = list(S)
BAR = 4.0  # 60 bpm, 4 beats


def section_at(t):
    cur = ORDER[0]
    for k in ORDER:
        if S[k] <= t + 0.5:
            cur = k
    return cur


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)


def pad_note(f, dur, gain):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for d in (-0.07, 0.0, 0.06):  # detuned saws (semitone fraction)
        ph = (f * 2 ** (d / 12) * t + rng.random()) % 1.0
        y += 2 * ph - 1
    y = onepole_lp(onepole_lp(y, 700), 1100)
    env = np.minimum(1, t / 1.6) * np.minimum(1, (dur - t) / 1.8).clip(0)
    return y * env * gain / 3


def bell(f, dur=2.4, gain=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 5)
    return y * np.exp(-t * 1.6) * np.minimum(1, t / 0.006) * gain


def pulse(gain):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 52 * np.exp(-t * 4) + 38
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * gain


def add(buf, x, t0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x


def music():
    L = np.zeros(N)
    R = np.zeros(N)
    nb = int(np.ceil(DUR / BAR))
    bar_in_sec = {}
    for b in range(nb):
        t0 = b * BAR
        sec = section_at(t0)
        k = bar_in_sec[sec] = bar_in_sec.get(sec, -1) + 1
        prog, pg, ag, pu = SEC[sec]
        if t0 > DUR - 6:  # final: hold F
            prog, ag, pu = ["F"], 0.0, 0.0
        notes, bass = CH[prog[k % len(prog)]]
        # pads overlap the next bar by 1.6 s for smooth changes
        for j, m in enumerate(notes):
            x = pad_note(m2f(m), BAR + 1.6, 0.11 * pg)
            pn = (j / (len(notes) - 1) - 0.5) * 0.6
            add(L, x * (1 - pn), t0)
            add(R, x * (1 + pn), t0)
        xb = pad_note(m2f(bass), BAR + 1.6, 0.16 * pg)
        add(L, xb, t0)
        add(R, xb, t0)
        if ag > 0:
            pat = [0, 2, 1, 3, 2, 1, None, 3] if b % 2 == 0 else [0, 3, 2, None, 1, 2, 3, None]
            for s, idx in enumerate(pat):
                if idx is None:
                    continue
                m = notes[idx] + 24 if idx < 2 else notes[idx] + 12
                x = bell(m2f(m), gain=0.05 * ag * (0.75 + 0.25 * rng.random()))
                pn = rng.uniform(-0.5, 0.5)
                add(L, x * (1 - pn), t0 + s * 0.5)
                add(R, x * (1 + pn), t0 + s * 0.5)
        if pu > 0:
            for beat in (0, 2) if pu < 0.6 else (0, 1, 2, 3):
                x = pulse(0.22 * pu * (1.0 if beat == 0 else 0.6))
                add(L, x, t0 + beat)
                add(R, x, t0 + beat)
    # reverb: exponentially decaying stereo noise IR (2.8 s)
    n = int(2.8 * SR)
    t = np.arange(n) / SR
    for ch in (L, R):
        ir = rng.standard_normal(n) * np.exp(-t * 2.4)
        ir = onepole_lp(ir, 4000)
        ir /= np.sqrt(np.sum(ir ** 2))
        ch[:] = 0.65 * ch + 0.5 * oaconvolve(ch, ir)[:N]
    out = np.stack([L, R], 1)
    fade = np.minimum(1, np.arange(N) / (1.5 * SR))[:, None] * np.minimum(1, (N - np.arange(N)) / (4 * SR))[:, None]
    return out * fade


def sfx():
    L = np.zeros(N)

    def whoosh(t0, dur=0.9, g=0.08):
        n = int(dur * SR)
        tt = np.arange(n) / SR
        x = rng.standard_normal(n)
        fc = 300 + 2600 * np.sin(np.pi * tt / dur) ** 2
        y = np.zeros(n)
        st = 0.0
        for i in range(0, n, 256):  # time-varying one-pole lowpass
            a = np.exp(-2 * np.pi * fc[i] / SR)
            seg, st = _lp_seg(x[i:i + 256], a, st)
            y[i:i + 256] = seg
        add(L, y * np.sin(np.pi * tt / dur) ** 2 * g, t0)

    def boom(t0, g=0.35):
        n = int(2.0 * SR)
        tt = np.arange(n) / SR
        f = 70 * np.exp(-tt * 2.5) + 32
        add(L, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2) * g, t0)

    def paper(t0, g=0.05):
        n = int(0.35 * SR)
        tt = np.arange(n) / SR
        x = rng.standard_normal(n) * (0.5 + 0.5 * (rng.random(n) > 0.92))
        x = x - onepole_lp(x, 1500)
        add(L, x * np.exp(-tt * 9) * g, t0)

    for k in ORDER[1:]:
        whoosh(S[k] - 0.45)
    for ph in ["Platz 1 ist kein Beruf", "Platz 1 ist der erste Job", "Zuerst fällt die erste Stufe", "Und es gibt die andere Seite"]:
        boom(A(ph) - 0.05)
    for ph in ["Der Berufseinstieg ist", "KI-nahe Beschäftigte weisen", "Eine Entwarnung", "Und das IAB schreibt selbst"]:
        paper(A(ph) - 0.1)
    return np.stack([L, L], 1)


def _lp_seg(x, a, st):
    y, zf = lfilter([1 - a], [1, -a], x, zi=[st * a])
    return y, y[-1] if len(y) else st


def main():
    (HERE / "stems").mkdir(exist_ok=True)
    # voice: high-pass, gentle compression, 48 kHz, levelled to -16 LUFS
    vtmp = HERE / "stems" / "_voice_c.wav"
    ffmpeg("-i", str(VOICE_SRC), "-af", "highpass=f=70,acompressor=threshold=-30dB:ratio=2.5:attack=15:release=200:makeup=4,aresample=48000", "-ac", "1", str(vtmp))
    v, _ = sf.read(vtmp)
    v = v * 10 ** ((-16 - lufs(vtmp)) / 20)
    vv = np.zeros(N)
    vv[: min(N, len(v))] = v[:N]
    sf.write(HERE / "stems" / "voice.wav", vv, SR, subtype="PCM_24")
    vtmp.unlink()

    # ducking envelope from the voice (speech -> music down)
    f = SR // 100
    nfr = N // f
    r = 20 * np.log10(np.sqrt((vv[: nfr * f].reshape(nfr, f) ** 2).mean(1)) + 1e-9)
    speech = (r > -45).astype(float)
    # hold 0.5 s so short gaps between words stay ducked
    k = 50
    speech = np.convolve(speech, np.ones(k), "same") > 0
    target = np.where(speech, -10.0, -4.0)  # dB under the bed's base level
    g = np.zeros(nfr)
    cur = -4.0
    for i, tv in enumerate(target):
        cur += (tv - cur) * (0.25 if tv < cur else 0.03)  # fast duck, slow release
        g[i] = cur
    gain = np.repeat(10 ** (g / 20), f)
    gain = np.concatenate([gain, np.full(N - len(gain), gain[-1])])

    m = music()
    sf.write(HERE / "stems" / "_m.wav", m, SR, subtype="FLOAT")
    m = m * 10 ** ((-16 - lufs(HERE / "stems" / "_m.wav")) / 20)  # base = voice level, then ducked by -10/-4 dB
    (HERE / "stems" / "_m.wav").unlink()
    m = m * gain[:, None]
    s = sfx()
    sf.write(HERE / "stems" / "music.wav", m, SR, subtype="PCM_24")
    sf.write(HERE / "stems" / "sfx.wav", s, SR, subtype="PCM_24")

    mix = vv[:, None] * np.array([[1.0, 1.0]]) + m + s
    pre = HERE / "stems" / "_mix.wav"
    sf.write(pre, mix, SR, subtype="FLOAT")
    # two-pass loudnorm to -14 LUFS / -1.5 dBTP, then exact length
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(pre), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    js = json.loads(re.findall(r"{[^{}]*}", r.stderr)[-1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
          f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
    ffmpeg("-i", str(pre), "-af", af, "-ar", "48000", "-t", f"{DUR:.4f}", "-c:a", "pcm_s24le", str(HERE / "mix.wav"))
    pre.unlink()
    print("mix.wav", DUR, "s, LUFS", lufs(HERE / "mix.wav"))


if __name__ == "__main__":
    main()
