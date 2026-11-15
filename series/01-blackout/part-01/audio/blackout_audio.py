"""Soundtrack for "Blackout - Teil 1: Der Aufzug": synthesized tension score + SFX under the voice, mastered to
-14 LUFS integrated / -1 dBTP. The radio announcement at the end (word 178 on) gets a radio filter on the voice.

Run:  python blackout_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Every time is a WORD INDEX of ../voice/words.json (the same anchors as story.ts in the studio), so after a new take:
python ../voice/sync_words.py, then this script, then re-render.
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "templates", "audio"))
from dsp import (SR, ns, rng, lp, hp, bp, st, pan, place, dbg, fades, make_ir, convolve_st, integrated, true_peak,  # noqa: E402
                 read_wav, write_wav, momentary, short_term, lra, colored, smooth_noise, tt)
import sfx_gen as G  # noqa: E402
import instruments as I  # noqa: E402

FPS = 30
TARGET = -14.0
CEIL = -1.0
WJ = json.load(open(os.path.join(HERE, "..", "voice", "words.json"), encoding="utf-8"))
WS = [round(x["start"] * FPS) / FPS for x in WJ]
WE = [round(x["end"] * FPS) / FPS for x in WJ]
w = lambda i: WS[i]
BLACK = WE[189] + 3 / FPS          # story.ts BLACK
TOTAL_F = round(BLACK * FPS) + 33  # story.ts TOTAL
DUR = TOTAL_F / FPS
N = ns(DUR)
HOOK_CUT = w(15) - 4 / FPS
RADIO0 = w(178) - 0.05             # the announcement starts: voice through the radio


def seg(t0, t1):
    return ns(max(0.0, t1 - t0))


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(41)

    def put(x, t, gain=1.0, p=0.0):
        place(s, pan(x, p) if np.ndim(x) == 1 else x, t, gain)

    def env(n, a=0.02, d=0.05):
        e = np.ones(n)
        na, nd = min(n, ns(a)), min(n, ns(d))
        e[:na] = np.linspace(0, 1, na); e[n - nd:] = np.linspace(1, 0, nd)
        return e

    # --- 1: the lit cabin: motor hum + cable whir while moving, fluorescent buzz; the jolt on "stehen" ---
    n = seg(0, w(9))
    tn = np.arange(n) / SR
    motor = (0.5 * np.sin(2 * np.pi * 98 * tn) + 0.25 * np.sin(2 * np.pi * 196 * tn)) * (0.7 + 0.3 * smooth_noise(n, r, 0.5))
    whir = bp(colored(n, r, 1.0), 300, 1400) * 0.5
    put(fades(motor * 0.25 + whir * 0.35, 0.3, 0.02), 0.0, 0.5)
    n = seg(0, w(14))
    buzz = np.sign(np.sin(2 * np.pi * 100 * np.arange(n) / SR)) * 0.05 + bp(colored(n, r), 2000, 6000) * 0.04
    put(fades(lp(buzz, 5000), 0.2, 0.004), 0.0, 0.35)
    jolt = w(9) - 0.05
    put(G.push_thump(r), jolt, 1.6)
    put(G.wood_crack(r), jolt, 0.35)
    for k in range(4):
        put(G.clink(r, 900 + 300 * k, 0.25, 0.6), jolt + 0.02 + 0.05 * k, 0.5, 0.3 - 0.2 * k)
    put(G.creak(0.9, r, 70, 40, scale=0.7), jolt + 0.1, 0.5, -0.2)
    # light out on "aus": relay click + the buzz drops out; the phone torch click at HOOK_CUT
    put(G.clink(r, 2600, 0.05, 1.2), w(14) - 0.02, 0.6)
    put(lp(r.standard_normal(ns(0.04)), 3000) * np.exp(-np.arange(ns(0.04)) / ns(0.008)), w(14) - 0.02, 0.5)
    put(G.clink(r, 3400, 0.03, 0.8), HOOK_CUT + 0.15, 0.35, 0.2)
    # dark room tone from "aus" to the doors: very low air
    n = seg(w(14), w(59))
    put(st(fades(lp(colored(n, r, 1.5), 400) * 0.05, 0.5, 0.5)), w(14), 1.0)
    # --- 2: the call button: two presses, dead clicks ---
    for dt in (0.05, 0.45, 0.75):
        put(G.clink(r, 1800, 0.04, 0.5), w(25) + dt, 0.6, 0.35)
    # breathing, close and fast: "nur dein eigener Atem"
    t = w(43)
    while t < w(48) + 0.6:
        for inhale, dur, g in ((True, 0.55, 0.5), (False, 0.7, 0.42)):
            nb = ns(dur)
            e = np.sin(np.linspace(0, np.pi, nb)) ** (1.5 if inhale else 1.0)
            put(bp(colored(nb, r, 0.5), 600 if inhale else 400, 2600 if inhale else 1800) * e * 0.35, t, g)
            t += dur + 0.06
    # --- 3: forcing the doors: metal grind and stick-slip from "drückst du" to "Spalt" ---
    t0, t1 = w(51), w(61)
    put(G.creak(t1 - t0, r, 30, 55, scale=1.2), t0, 0.55, 0.1)
    put(G.stick_slip(t1 - t0, 9.0, r), t0, 0.35, -0.1)
    put(G.clink(r, 1300, 0.2, 0.8), t1 - 0.1, 0.6)
    # --- 4/5: the corridor: emergency light hum; climbing scuffs; the jacket tears; you hit the floor ---
    n = seg(w(59), w(88) + 0.3)
    hum = (np.sin(2 * np.pi * 120 * np.arange(n) / SR) * 0.03 + bp(colored(n, r), 3000, 7000) * 0.015)
    put(fades(hum, 0.3, 0.3), w(59), 0.6, 0.15)
    for k in range(5):
        put(G.stroll_step(r, 1.0), w(71) + 0.35 * k, 0.45, 0.1 * (k % 2))
    rip = bp(colored(ns(0.42), r, 0.2), 1500, 7000) * np.exp(-np.arange(ns(0.42)) / ns(0.12))
    rip *= 0.6 + 0.4 * (r.random(ns(0.42)) > 0.7)
    put(rip, w(77) - 0.03, 0.9, 0.2)
    put(G.push_thump(r), w(81) - 0.05, 1.3, -0.1)
    put(G.push_thump(r), w(81) + 0.12, 0.6, -0.15)
    nb = ns(1.1)
    put(bp(colored(nb, r, 0.5), 300, 1400) * np.sin(np.linspace(0, np.pi, nb)) * 0.35, w(82), 0.5)
    # --- 6: up the stairs (echoey steps) ---
    ir_st = make_ir(1.4, 5, hf=0.5)
    steps = np.zeros((2, ns(4.5)))
    for k in range(9):
        place(steps, pan(G.stroll_step(r, 0.3), 0.15 * (-1) ** k), 0.45 * k, 0.5)
    put(convolve_st(steps, ir_st) * 0.4 + steps, w(88) - 0.1, 1.0)
    # --- 7/8: the flat: steps on parquet, the silent fridge (door suction, no hum), to the window ---
    for k in range(6):
        put(G.stroll_step(r, 0.2), w(92) + 0.2 + 0.5 * k, 0.35, -0.3 + 0.1 * k)
    put(G.creak(0.35, r, 140, 90, scale=0.4), w(97) + 0.05, 0.4, 0.3)
    put(lp(r.standard_normal(ns(0.08)), 900) * np.exp(-np.arange(ns(0.08)) / ns(0.02)), w(97) + 0.02, 0.7, 0.3)
    for k in range(4):
        put(G.stroll_step(r, 0.2), w(99) + 0.15 + 0.55 * k, 0.3)
    # --- outside, from the window on: wind, distant sirens, a dog; the horn that doesn't stop ---
    t0, t1 = w(99), w(178) + 1.0
    put(fades(G.breeze(t1 - t0, r, 0.8, 0.15, 700), 1.5, 2.0), t0, 0.35)

    def siren(t, dur, f0, p, g):
        n2 = ns(dur)
        tn2 = np.arange(n2) / SR
        f = f0 * (1 + 0.28 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * tn2)))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        y = lp(y, 1800) * np.sin(np.linspace(0, np.pi, n2)) ** 2
        put(y * 0.12, t, g, p)

    siren(w(103), 9.0, 620, -0.6, 0.5)
    siren(w(113), 11.0, 700, 0.5, 0.35)
    siren(w(124), 8.0, 560, -0.2, 0.3)
    for k in range(3):
        bark = bp(colored(ns(0.18), r), 500, 1500) * np.exp(-np.arange(ns(0.18)) / ns(0.05))
        put(bark, w(119) + 0.4 * k, 0.15, 0.7)
    # the horn: two detuned squares from "hupt", on and on (under the door scenes, further away)
    hon = w(137) - 0.05
    n = seg(hon, BLACK)
    tn = np.arange(n) / SR
    horn = np.sign(np.sin(2 * np.pi * 415 * tn)) + 0.8 * np.sign(np.sin(2 * np.pi * 523 * tn))
    horn = bp(horn, 300, 2500) * 0.08
    dist = np.interp(tn + hon, [hon, w(144), w(144) + 1.0, BLACK], [1.0, 1.0, 0.35, 0.3])
    put(fades(horn * dist, 0.01, 0.3), hon, 0.7, 0.4)
    # --- 11: the knocks; the door opens ---
    for k in range(3):
        put(G.push_thump(r), w(145) + k * 9 / FPS - 0.02, 1.1, -0.35)
        put(G.hammer_hit(r, 0.2), w(145) + k * 9 / FPS - 0.02, 0.12, -0.35)
    put(G.clink(r, 1500, 0.08, 0.6), w(147) - 10 / FPS, 0.5, -0.3)
    put(G.creak(0.6, r, 90, 140, scale=0.6), w(147) - 8 / FPS, 0.45, -0.3)
    # --- 13: the crank: ratchet ticks; "knackt"; then the hiss under the announcement ---
    tc = w(168) + 6 / FPS
    while tc < w(172):
        put(G.clink(r, 2200 + r.uniform(-200, 200), 0.03, 0.5), tc, 0.35, -0.1)
        tc += 16 / FPS / 6
    crack = r.standard_normal(ns(0.08)) * np.exp(-np.arange(ns(0.08)) / ns(0.01))
    put(hp(crack, 800), w(173) - 0.02, 0.9)
    n = seg(w(174) - 0.05, DUR - 0.05)
    hiss = bp(colored(n, r, 0.3), 800, 6000) * 0.12 * (0.85 + 0.15 * smooth_noise(n, r, 3.0))
    tn = np.arange(n) / SR + w(174)
    hiss *= np.interp(tn, [w(174), w(174) + 0.15, w(178) - 0.1, w(178) + 0.3, BLACK, DUR - 0.4], [0, 1.0, 1.0, 0.45, 0.45, 0.0])
    put(hiss, w(174) - 0.05, 0.8)
    # --- the cut to black: a low hit, the hiss runs on and dies ---
    put(I.timpani(I.m2f(26), 0.9, r, 2.0), BLACK - 0.02, 0.9)
    return s


# ================================================================ music
def music_track():
    m = np.zeros((2, N))
    r = rng(9)
    D = 38  # D2

    def padp(notes, t0, t1, vel, att=1.5, rel=1.5, warm=700.0):
        if t1 - t0 < 0.5:
            return
        x = I.pad([I.m2f(n_) for n_ in notes], t1 - t0, vel, r, att, rel, warm)
        place(m, x, t0, 1.0)

    # 1: elevator muzak (vibes, major sevenths, cheerful) - dies with a power-down glide on the jolt
    beat = 0.5
    chords = [(65, 69, 72, 76), (62, 65, 69, 72), (60, 64, 67, 71), (62, 65, 69, 72)]
    t, k = 0.0, 0
    while t < w(9) - 0.2:
        for j, n_ in enumerate(chords[(k // 4) % 4]):
            place(m, pan(I.vibes(I.m2f(n_), 0.32, r, 1.4), -0.3 + 0.2 * j), t + 0.02 * j, 0.32)
        t += beat * 2; k += 1
    cut = ns(w(9))
    m[:, cut:cut + ns(0.25)] *= np.linspace(1, 0, ns(0.25))[None, :]
    m[:, cut + ns(0.25):] = 0
    n = ns(0.6)
    f = np.geomspace(380, 35, n)
    place(m, pan(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0.5, 0, n), 0.0), w(9) - 0.02, 0.4)
    # 2-3: the dark: a low D drone, a heartbeat from the call button on, faster when the doors give
    padp([D, D + 7, D + 12], w(14) + 0.1, w(59), 0.28, 2.0, 1.0, 500)
    t = w(25)
    while t < w(99):
        bpm = 66 if t < w(48) else 84 if t < w(71) else 96
        for dt, g in ((0, 0.55), (0.22, 0.32)):
            place(m, pan(I.timpani(I.m2f(D - 12), 0.55, r, 0.6), 0.0), t + dt, g)
        t += 60 / bpm
    # riser into the gap
    n = ns(w(59) - w(51))
    rise = bp(colored(n, r, 0.5), 400, 3000) * np.linspace(0, 1, n) ** 2 * 0.15
    place(m, st(rise), w(51), 0.8)
    # 4-6: green corridor: pad up a third, pizzicato pulse on the stairs
    padp([D + 3, D + 10, D + 15], w(59), w(92), 0.24, 1.0, 1.2, 600)
    t = w(86)
    pat = [D + 24, D + 27, D + 31, D + 27]
    k = 0
    while t < w(99):
        place(m, pan(I.pluck(I.m2f(pat[k % 4]), 0.45, r, 0.5), 0.2 * (-1) ** k), t, 0.35)
        t += 0.25; k += 1
    # 7-10: the dark flat and the city: a wide bleak chord, a low hit on "Alles schwarz"
    padp([D, D + 7, D + 10, D + 15, D + 19], w(92) - 0.2, w(144), 0.26, 2.5, 1.0, 900)
    place(m, pan(I.timpani(I.m2f(D - 12), 0.8, r, 2.4), 0.0), w(124) - 0.03, 0.7)
    place(m, pan(I.cymbal(0.25, r, 2.5, 0.5), 0.2), w(124) - 0.03, 0.25)
    # 11-12: the knock: music gone (only the horn outside); 13-14: a rising cluster under the crank and the radio
    padp([D + 13, D + 14, D + 20], w(168), BLACK, 0.2, 3.0, 0.05, 1200)
    n = ns(BLACK - w(178))
    rise = bp(colored(n, r, 0.4), 300, 4000) * np.linspace(0, 1, n) ** 2.5 * 0.2
    place(m, st(rise), w(178), 0.9)
    m[:, ns(BLACK):] = 0
    ir = make_ir(1.6, 3, hf=0.5)
    return convolve_st(m, ir) * 0.25 + m


# ================================================================ mix
def duck_curve(spans, depth=-4.0, pre=0.08, post=0.15, att=0.07, rel=0.45):
    ctrl = 1000
    nc = int(DUR * ctrl) + 2
    va = np.zeros(nc)
    for a, b in spans:
        va[max(0, int((a - pre) * ctrl)): int((b + post) * ctrl)] = 1.0
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


def radio(v):
    """the announcement through a small speaker: band-limited, a little grit"""
    a = ns(RADIO0)
    y = v.copy()
    seg_ = y[a:]
    seg_ = bp(seg_, 380, 3200, 4)
    seg_ = np.tanh(seg_ * 3.0) / 3.0 * 1.6
    xf = min(ns(0.04), len(seg_))
    y[a:a + xf] = y[a:a + xf] * np.linspace(1, 0, xf) + seg_[:xf] * np.linspace(0, 1, xf)
    y[a + xf:] = seg_[xf:]
    return y


def main():
    v, sr = read_wav(os.path.join(HERE, "..", "voice", "voice.wav"))
    assert sr == SR, sr
    v = v.mean(0) if v.ndim > 1 else v
    vv = np.zeros(N)
    vv[: min(N, len(v))] = v[:N]
    vv = radio(vv)
    V = st(vv)
    v_ref = integrated(V)
    print(f"voice {v_ref:.2f} LUFS, {DUR:.2f} s, {TOTAL_F} frames")
    M = music_track()
    S = sfx_track()
    M = M * dbg(duck_curve(list(zip(WS, WE))))[None, :]
    Lm, Ls = integrated(M), integrated(S)
    gm, gs = (v_ref - 11.0) - Lm, (v_ref - 12.0) - Ls
    M *= dbg(gm)
    S *= dbg(gs)
    print(f"music gain {gm:+.1f} dB, sfx gain {gs:+.1f} dB")
    mix0 = V + M + S
    g = TARGET - integrated(mix0)
    for _ in range(6):
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
        f.write("# Blackout Teil 1 - soundtrack\n\nAll music and SFX synthesized (blackout_audio.py); voice gain only, radio filter from word 178.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: elevator muzak (vibes) cut by a power-down on the jolt; D-minor drone + timpani heartbeat in the dark"
                " (66 -> 84 -> 96 bpm); riser into the gap; green corridor pad; pizzicato on the stairs; bleak wide chord over the"
                " city with a low hit on 'Alles schwarz'; silence at the knock; rising cluster + noise riser under the crank and the"
                " announcement; timpani hit on the cut to black.\nSFX: motor/whir/buzz, jolt (thump, clinks, creak), relay click,"
                " dead button, breathing, door grind, corridor hum, scuffs, jacket rip, body thud, stairwell steps, parquet steps,"
                " fridge suction (no hum), wind, distant sirens, dog, the endless horn, knocks, door, crank ratchet, crack, radio hiss.\n")


if __name__ == "__main__":
    main()
