"""Soundtrack for "Erfurt 1184": original synthesized music + SFX, ducked under the voice, mastered to -15 LUFS / -1.2 dBTP.

Run:  python erfurt_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Times are seconds on the voice timeline (frame / 30), locked to story.ts in the studio.
Uses the bridge short's synth kit from templates/audio (dsp, sfx_gen, instruments).
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "templates", "audio"))
from dsp import (SR, ns, tt, rng, lp, hp, bp, st, pan, place, dbg, fades, make_ir, convolve_st, integrated, true_peak,  # noqa: E402
                 read_wav, write_wav, momentary, short_term, lra, modal, phase)
import sfx_gen as G  # noqa: E402
import instruments as I  # noqa: E402

FPS = 30
TOTAL = 2226
DUR = TOTAL / FPS
N = ns(DUR)
fr = lambda f: f / FPS
TARGET = -15.0
CEIL = -1.2

# ---------------------------------------------------------------- story times (frames from story.ts)
FLASH = fr(157)
HOOK_CUT, HOOK_BREAK = fr(121), fr(136)
CRACK, DROP0, DROP1, BREAK2, LAND2 = fr(976), fr(1008), fr(1022), fr(1105), fr(1129)
LADDER = fr(1422)
STUB_FALL = fr(1572)
SIT_AT = [fr(f) for f in (1612, 1638, 1663, 1684, 1733)]
BENCH_BREAK = fr(1738)
REPLAY_CUT, REPLAY_LAND = fr(1790), fr(1843)
RUN0, RUN1 = fr(1904), fr(1963)
SCRIPT0, TOTEN = fr(1963), fr(2016)
TODAY0 = fr(2042)


def words():
    w = json.load(open(os.path.join(HERE, "..", "voice", "words.json"), encoding="utf-8"))
    return [(x["start"], x["end"]) for x in w]


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(11)

    def put(x, t, gain=1.0, p=0.0):
        place(s, pan(x, p) if np.ndim(x) == 1 else x, t, gain)

    def amb(t0, t1, birds=0.4, breeze=0.5, babble=0.0, gain=1.0):
        d = t1 - t0
        n = ns(d)
        x = np.zeros((2, n))
        fit = lambda y: st(y)[:, :n] if st(y).shape[1] >= n else np.pad(st(y), ((0, 0), (0, n - st(y).shape[1])))
        x += fit(G.breeze(d, r, breeze)) * 0.5
        if birds:
            x += fit(G.bird_chirps(d, r, birds)) * 0.35
        if babble:
            x += fit(lp(G.babble(d, r, 130, 1.0, active=0.6), 2500)) * babble
        x = np.stack([fades(c, 0.3, 0.3) for c in x])
        put(x, t0, gain)

    def steps(t0, t1, rate, gain=0.5, scuff=0.5, p=0.0):
        t = t0
        while t < t1:
            put(G.stroll_step(r, scuff), t, gain * r.uniform(0.75, 1.0), p + r.uniform(-0.2, 0.2))
            t += 1.0 / rate * r.uniform(0.93, 1.07)

    def whoosh(t, dur=0.5, gain=0.5, peak=0.3):
        put(G.whoosh(dur, r, peak), t - dur * peak, gain)

    def oofs(t, n, gain=0.35, spread=0.25, kind="oof"):
        for k in range(n):
            v = G.oof(r, kind) if kind == "oof" else G.whoa(r)
            put(v, t + r.uniform(0, spread), gain * r.uniform(0.6, 1.0), r.uniform(-0.7, 0.7))

    def muck_splash(t, gain=1.0):
        x = G.splash_big(r)
        x = lp(x, 1700) * 1.3
        put(x, t, gain)

    def creaks(t0, t1, every=0.45, gain=0.5, low=False):
        t = t0
        while t < t1:
            d = r.uniform(0.25, 0.6)
            put(G.creak(d, r, *((40, 90) if low else (90, 170)), scale=0.7 if low else 1.0), t, gain * r.uniform(0.6, 1.0), r.uniform(-0.5, 0.5))
            t += every * r.uniform(0.6, 1.3)

    def scratch(t0, t1, gain=0.25):
        t = t0
        while t < t1:
            d = r.uniform(0.08, 0.22)
            x = bp(r.standard_normal(ns(d)), 2500, 7000, 2) * np.hanning(ns(d))
            put(x, t, gain * r.uniform(0.5, 1.0), 0.15)
            t += d + r.uniform(0.03, 0.12)

    # 1 hook: Domberg ambience, cut into the falling hall, the floor gives way on "gefallen"
    amb(0, HOOK_CUT + 0.1, birds=0.6, babble=0.25)
    whoosh(HOOK_CUT, 0.45, 0.6)
    put(G.wood_crack(r), HOOK_BREAK, 0.9)
    oofs(HOOK_BREAK + 0.05, 6, 0.4, 0.3, "whoa")
    whoosh(FLASH, 0.5, 0.45, 0.6)
    # 2 gate: the king's party walks in, faster from "schnell"
    amb(FLASH, fr(285), birds=0.5, breeze=0.6)
    steps(FLASH + 0.1, fr(236), 3.0, 0.35, 0.6)
    steps(fr(236), fr(285), 5.0, 0.4, 0.8)
    # 3 square: the two turn their backs on "nicht"
    amb(fr(285), fr(426), birds=0.4, babble=0.15)
    put(G.whoosh(0.3, r, 0.3), fr(396) - 0.1, 0.5)
    # 4 Domberg + Propstei
    amb(fr(426), fr(547), birds=0.5, babble=0.2)
    whoosh(fr(521), 0.5, 0.35)
    # 5-8 hall: room tone, babble growing with the crowd, footsteps of each group, floor creaks
    for a, b, lev in ((fr(547), fr(644), 0.25), (fr(644), fr(738), 0.45), (fr(738), fr(966), 0.6)):
        d = b - a
        put(fades(lp(G.babble(d, r, 125, 1.0, rate=4.6, active=0.8), 3000), 0.2, 0.15) * lev, a, 0.8)
        put(fades(lp(G.babble(d, r, 165, 1.05, rate=4.0, active=0.7), 3000), 0.2, 0.15) * lev * 0.7, a + 0.05, 0.8, -0.4)
    for g in (552, 644, 661, 686, 716):
        steps(fr(g), fr(g) + 1.0, 7.0, 0.28, 0.7, -0.4)
    creaks(fr(839), CRACK - 0.1, 0.4, 0.35)
    put(G.creak(0.8, r, 60, 140), fr(869), 0.8)
    # 9-11 collapse
    put(G.wood_crack(r), CRACK, 1.0)
    put(G.timber_tear(r, 0.9), CRACK + 0.05, 0.6)
    oofs(CRACK + 0.1, 8, 0.35, 0.3, "whoa")
    whoosh(DROP1, 0.45, 0.5)
    put(G.wood_crack(r), DROP1, 1.0)
    put(lp(G.push_thump(r), 300) * 3, DROP1, 0.9)
    oofs(DROP1 + 0.04, 9, 0.4, 0.25)
    creaks(DROP1 + 0.6, BREAK2 - 0.1, 0.35, 0.45, low=True)
    put(G.wood_crack(r), BREAK2, 0.9)
    oofs(BREAK2 + 0.05, 8, 0.38, 0.3, "whoa")
    whoosh(LAND2, 0.6, 0.45)
    muck_splash(LAND2, 1.1)
    muck_splash(LAND2 + 0.12, 0.7)
    put(lp(G.bubbles(fr(1374) - LAND2 - 0.5, r, 25, 120, 900), 1500) * 0.6, LAND2 + 0.5, 0.7)
    oofs(LAND2 + 0.9, 5, 0.25, 1.5)
    # 14 ladders, the empty pit
    put(G.hammer_hit(r, 0.5), LADDER, 0.45, -0.3)
    put(G.hammer_hit(r, 0.4), LADDER + 0.18, 0.4, 0.3)
    put(lp(G.bubbles(1.4, r, 3, 120, 700), 1200) * 0.5, fr(1454), 0.5)
    # 15 the last board sways, creaks, falls on "Sehr lange."
    creaks(fr(1498), STUB_FALL - 0.1, 0.55, 0.45, low=True)
    put(G.creak(0.4, r, 120, 40), STUB_FALL - 0.25, 0.7)
    whoosh(STUB_FALL + 0.35, 0.5, 0.4)
    put(lp(G.splash_big(r), 1500) * 0.6, STUB_FALL + 0.6, 0.5)
    # 16-17 Schützenfest: crowd, birds, mug clinks, uncles sitting down, the bench breaks
    amb(fr(1588), REPLAY_CUT, birds=0.5, breeze=0.4, babble=0.55, gain=0.9)
    for k in range(6):
        put(G.clink(r), fr(1595) + k * 0.9 + r.uniform(0, 0.4), 0.25, r.uniform(-0.6, 0.6))
    for i, ts in enumerate(SIT_AT):
        steps(ts - 1.1, ts - 0.1, 3.5, 0.25, 0.6, 0.5 if i % 2 else -0.5)
        put(lp(G.push_thump(r), 600) * 1.5, ts, 0.55)
        put(G.creak(0.35 + 0.1 * i, r, 70 + 10 * i, 120), ts + 0.05, 0.25 + 0.1 * i)
    put(G.creak(0.7, r, 40, 90, scale=0.8), SIT_AT[4] + 0.1, 0.7)
    put(G.wood_crack(r), BENCH_BREAK, 1.0)
    oofs(BENCH_BREAK + 0.05, 5, 0.45, 0.2)
    for k, tt_ in enumerate((0, 0.12, 0.24, 0.36)):
        put(I.glock(I.m2f(84 + 3 * k), 0.4, r, 0.8), BENCH_BREAK + 0.5 + tt_, 0.25)
    whoosh(REPLAY_CUT, 0.4, 0.45)
    creaks(REPLAY_CUT + 0.2, REPLAY_LAND - 0.6, 0.4, 0.3)
    put(G.wood_crack(r), REPLAY_LAND, 0.95)
    put(lp(G.push_thump(r), 300) * 3, REPLAY_LAND, 0.8)
    oofs(REPLAY_LAND + 0.05, 7, 0.35, 0.25)
    creaks(REPLAY_LAND + 0.5, fr(1904) - 0.1, 0.4, 0.4, low=True)
    # 18 the king runs out of town
    amb(RUN0, RUN1, birds=0.3, breeze=0.7)
    t = RUN0
    while t < RUN1:
        put(G.boot(r, 0.7), t, 0.35)
        t += 0.19
    whoosh(RUN1 - 0.2, 0.5, 0.55)
    # 19 scriptorium: quill scratching, the scroll unrolling
    scratch(SCRIPT0 + 0.2, TODAY0 - 0.2, 0.18)
    whoosh(fr(1993), 0.6, 0.18)
    whoosh(TOTEN, 0.8, 0.25)
    # 20 today: square ambience, a bell at the end
    amb(TODAY0, DUR, birds=0.6, breeze=0.5, babble=0.3)
    bell = modal(4.0, [(392, 1.0, 1.8), (392 * 2.0, 0.5, 1.2), (392 * 2.4, 0.35, 0.9), (392 * 3.0, 0.25, 0.6), (392 * 4.2, 0.15, 0.4)], r)
    put(bell, fr(2181), 0.25)
    return s


# ================================================================ music
BPM = 104
BEAT = 60 / BPM
D4 = 62


def note_seq(seq, t0, fn, beat=BEAT, vel=0.6, transpose=0):
    """seq of (beat, dur_beats, midi or None)"""
    out = []
    for b_, d, m in seq:
        if m is None:
            continue
        out.append((t0 + b_ * beat, fn(I.m2f(m + transpose), d * beat, vel)))
    return out


THEME = [  # D dorian jig-ish tune, 2 bars of 4/4 per line
    (0, .5, 74), (.5, .5, 72), (1, .5, 69), (1.5, .5, 67), (2, 1, 69), (3, .5, 65), (3.5, .5, 67),
    (4, .5, 69), (4.5, .5, 72), (5, .5, 74), (5.5, .5, 76), (6, 1.5, 74), (7.5, .5, None),
    (8, .5, 74), (8.5, .5, 72), (9, .5, 69), (9.5, .5, 67), (10, 1, 65), (11, .5, 64), (11.5, .5, 65),
    (12, .5, 67), (12.5, .5, 69), (13, .5, 65), (13.5, .5, 64), (14, 1.5, 62), (15.5, .5, None),
]
CHORDS = [(0, [50, 57, 62]), (2, [48, 55, 60]), (4, [50, 57, 62]), (6, [45, 52, 57]),
          (8, [50, 57, 62]), (10, [46, 53, 58]), (12, [48, 55, 60]), (14, [50, 57, 62])]


def music_track():
    m = np.zeros((2, N))
    r = rng(5)
    fife = lambda f, d, v: I.fife(f, d * 0.92, v, r)
    def lute(f, d, v): return I.pluck(f, v, r, min(1.2, d + 0.6), 0.45)

    def theme(t0, t1, vel=0.55, lute_vel=0.4, drum=True, fife_on=True, tr=0):
        loop = 16 * BEAT
        t = t0
        while t < t1 - 0.5:
            if fife_on:
                for tn, x in note_seq(THEME, t, fife, vel=vel, transpose=tr):
                    if tn < t1 - 0.15:
                        place(m, pan(fades(x[: ns(max(0.05, t1 - tn))], 0, 0.04), 0.15), tn, 0.8)
            for cb, ch in CHORDS:
                for k in range(4):           # lute strums on every half beat of the 2-beat chord: bass, chord, chord, chord
                    tn = t + (cb + k * 0.5) * BEAT
                    if tn >= t1 - 0.1:
                        continue
                    notes = [ch[0] - 12 + tr] if k == 0 else [n_ + tr for n_ in ch]
                    for j, n_ in enumerate(notes):
                        place(m, pan(lute(I.m2f(n_), 0.5 * BEAT, lute_vel * (1.0 if k == 0 else 0.55)), -0.3 + 0.2 * j), tn + 0.008 * j, 0.9)
            if drum:
                for k in range(16):
                    tn = t + k * BEAT
                    if tn < t1 - 0.1:
                        place(m, pan(I.snare(0.25 if k % 2 else 0.35, r, 0.2, 1.3, 0.4), 0.3), tn, 0.5)
            t += loop

    def oompah(t0, t1, vel=0.6, bpm=132):
        beat = 60 / bpm
        prog = [([43, 55, 59, 62], 4), ([38, 54, 57, 60], 4), ([43, 55, 59, 62], 4), ([38, 54, 57, 60], 2), ([43, 55, 59, 62], 2)]
        t = t0
        while t < t1 - 0.2:
            for ch, beats in prog:
                for k in range(beats):
                    tn = t + k * beat
                    if tn >= t1 - 0.1:
                        break
                    if k % 2 == 0:
                        place(m, pan(I.brass(I.m2f(ch[0] if k % 4 == 0 else ch[0] + 7), beat * 0.6, vel, r, "tuba"), -0.2), tn, 1.0)
                    else:
                        for j, n_ in enumerate(ch[1:]):
                            place(m, pan(I.brass(I.m2f(n_), beat * 0.35, vel * 0.5, r, "stab"), 0.3 - 0.2 * j), tn, 0.6)
                        place(m, pan(I.snare(0.3, r, 0.18), 0.2), tn, 0.4)
                t += beats * beat
                if t >= t1 - 0.2:
                    break

    def tuba_wah(t, notes, d=0.32, vel=0.7):
        for k, n_ in enumerate(notes):
            place(m, pan(I.brass(I.m2f(n_), d * (1.6 if k == len(notes) - 1 else 0.9), vel, r, "tuba", fall=(-200 if k == len(notes) - 1 else 0)), 0), t + k * d, 1.0)

    # hook: tune from the top, a tuba "bwomp" on "Klo", stop at the flash
    theme(0.0, HOOK_CUT, 0.5, 0.35)
    place(m, pan(I.timpani(I.m2f(38), 0.9, r), 0), HOOK_BREAK, 0.9)
    tuba_wah(HOOK_BREAK + 0.02, [41, 38], 0.28, 0.8)
    # main tune from the gate to the creaking floor
    theme(FLASH + 0.05, fr(839), 0.55, 0.42)
    # tension: low pad + timpani roll swelling into the crack, dead stop
    d = CRACK - fr(839)
    place(m, st(fades(I.pad([I.m2f(38), I.m2f(45), I.m2f(50)], d, 0.5, r, 1.2, 0.05) .mean(0), 0.5, 0.02)), fr(839), 0.8)
    t = fr(839) + 1.0
    while t < CRACK - 0.05:
        u = (t - fr(839)) / d
        place(m, pan(I.timpani(I.m2f(38), 0.15 + 0.6 * u, r, 0.4), 0), t, 0.6)
        t += 0.12 - 0.06 * u
    # after the splash: a sad little tuba fall, then the carefree king tune (lute + glock)
    tuba_wah(LAND2 + 0.35, [43, 42, 41, 38], 0.3, 0.6)
    theme(fr(1202), fr(1450), 0.0, 0.38, drum=False, fife_on=False)
    for tn, x in note_seq(THEME[:13], fr(1202), lambda f, d_, v: I.glock(f * 2, v, r, 1.2), vel=0.32):
        if tn < fr(1450):
            place(m, pan(x, 0.25), tn, 0.6)
    # "Rund sechzig andere nicht": silence. Then the old board: slow lute
    theme(fr(1498), fr(1588) - 0.1, 0.0, 0.3, drum=False, fife_on=False, tr=-12)
    # Schützenfest: oompah, crash on the bench break
    oompah(fr(1588), BENCH_BREAK, 0.6)
    place(m, st(I.cymbal(0.8, r)), BENCH_BREAK, 0.8)
    place(m, pan(I.timpani(I.m2f(36), 1.0, r), 0), BENCH_BREAK, 0.9)
    # replay: timpani roll into the landing, a tuba "bwomp" on "Onkel"
    t = REPLAY_CUT + 0.3
    while t < REPLAY_LAND - 0.05:
        u = (t - REPLAY_CUT) / (REPLAY_LAND - REPLAY_CUT)
        place(m, pan(I.timpani(I.m2f(41), 0.2 + 0.6 * u, r, 0.4), 0), t, 0.55)
        t += 0.11
    place(m, st(I.cymbal(0.7, r)), REPLAY_LAND, 0.7)
    tuba_wah(fr(1886), [38, 33], 0.3, 0.75)
    # the king runs: a fast fife run over a snare
    run_notes = [62, 64, 65, 67, 69, 71, 72, 74, 76, 74, 72, 74, 76, 77, 79, 81]
    for k, n_ in enumerate(run_notes):
        tn = RUN0 + 0.05 + k * 0.115
        if tn < RUN1 - 0.1:
            place(m, pan(I.fife(I.m2f(n_), 0.1, 0.55, r), 0.1), tn, 0.8)
            place(m, pan(I.snare(0.25, r, 0.12), 0.3), tn, 0.35)
    # scriptorium + today: the tune again, gentle, ending on a held chord + glock button
    theme(SCRIPT0 + 0.1, DUR - 1.4, 0.42, 0.35, drum=False)
    place(m, st(fades(I.pad([I.m2f(50), I.m2f(57), I.m2f(62), I.m2f(66)], 1.2, 0.5, r, 0.05, 0.6).mean(0), 0.02, 0.4)), DUR - 1.4, 0.7)
    place(m, pan(I.glock(I.m2f(86), 0.5, r, 1.6), 0.2), DUR - 1.4, 0.5)
    ir = make_ir(1.1, 3, hf=0.6)
    return convolve_st(m, ir) * 0.25 + m


# ================================================================ mix
def duck_curve(spans, depth=-4.0, pre=0.08, post=0.15, att=0.07, rel=0.45):
    ctrl = 1000
    nc = int(DUR * ctrl) + 2
    va = np.zeros(nc)
    for s, e in spans:
        va[max(0, int((s - pre) * ctrl)): int((e + post) * ctrl)] = 1.0
    ka, kr = 1 - np.exp(-1 / (att * ctrl)), 1 - np.exp(-1 / (rel * ctrl))
    env = np.zeros(nc)
    e = 0.0
    for i in range(nc):
        e += (va[i] - e) * (ka if va[i] > e else kr)
        env[i] = e
    return np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, depth * env)


def limiter(x, ceil_db=CEIL, look=0.003, rel=0.08):
    from scipy import signal, ndimage
    c = dbg(ceil_db)
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    pk = up.reshape(-1, 4).max(1)[: x.shape[1]]
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    L = ns(look)
    g = ndimage.minimum_filter1d(need, 2 * L + 1)
    k = 1 - np.exp(-1 / (rel * SR))
    out = np.empty_like(g)
    e = 1.0
    for i in range(len(g)):
        e = g[i] if g[i] < e else e + (g[i] - e) * k
        out[i] = e
    out = ndimage.uniform_filter1d(out, L)
    out = np.minimum(out, need)
    return x * out[None, :], out


def main():
    v, sr = read_wav(os.path.join(HERE, "..", "voice", "voice.wav"))
    assert sr == SR, sr
    v = v.mean(0) if v.ndim > 1 else v
    vv = np.zeros(N)
    vv[: min(N, len(v))] = v[:N]
    V = st(vv)
    v_ref = integrated(V)
    print(f"voice {v_ref:.2f} LUFS")
    M = music_track()
    S = sfx_track()
    spans = words()
    dk = duck_curve(spans)
    M = M * dbg(dk)[None, :]
    # music bed ~12.5 LU under the voice ("+3 dB music" standard), SFX ~6 dB under the music bed
    Lm, Ls = integrated(M), integrated(S)
    gm = (v_ref - 12.5) - Lm  # 2.5 dB under the first mix (user: music a touch quieter)
    gs = (v_ref - 13.0) - Ls
    M *= dbg(gm)
    S *= dbg(gs)
    print(f"music gain {gm:+.1f} dB, sfx gain {gs:+.1f} dB")
    mix0 = V + M + S
    g = TARGET - integrated(mix0)
    for _ in range(5):
        y, gr = limiter(mix0 * dbg(g))
        L = integrated(y)
        if abs(L - TARGET) < 0.02:
            break
        g += TARGET - L
    y = fades(y, 0.0, 0.05)
    write_wav(os.path.join(HERE, "mix.wav"), y)
    for name, x in (("voice", V), ("music", M), ("sfx", S)):
        write_wav(os.path.join(HERE, f"stem_{name}.wav"), x * dbg(g))
    stats = dict(I=integrated(y), TP=true_peak(y), LRA=lra(y), Mmax=float(np.max(momentary(y))), Smax=float(np.max(short_term(y))),
                 master_gain=g, max_gr_db=float(-20 * np.log10(gr.min())), voice=integrated(V * dbg(g)), music=integrated(M * dbg(g)), sfx=integrated(S * dbg(g)))
    print(json.dumps({k: round(float(x), 2) for k, x in stats.items()}))
    with open(os.path.join(HERE, "cues.md"), "w", encoding="utf-8") as f:
        f.write("# Erfurt 1184 - soundtrack\n\nAll music and SFX synthesized (erfurt_audio.py); voice = ElevenLabs \"Daniel\", gain only.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: D-dorian fife + lute tune (hook, gate to hall, scriptorium, today), tension pad + timpani roll into the crack,"
                " tuba falls after the splash and on \"Onkel\", lute + glock for the king in the niche, silence on \"Rund sechzig andere nicht\","
                " oompah brass at the Schützenfest with a cymbal on the bench break, fife run for the king leaving, held chord + glock button.\n")


if __name__ == "__main__":
    main()
