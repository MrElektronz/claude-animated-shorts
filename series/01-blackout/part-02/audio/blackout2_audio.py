"""Soundtrack for "Blackout - Teil 2: Kein Wasser": synthesized tension score + SFX under the voice, mastered to
-14 LUFS integrated / -1 dBTP.

Run:  python blackout2_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Every time is a WORD of ../voice/words.json (at("wasserhahn") = its onset, the same anchors as story.ts), so after a
new take: python ../voice/sync_words.py, then this script, then re-render.
"""
import json
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "templates", "audio"))
from dsp import (SR, ns, rng, lp, hp, bp, st, pan, place, dbg, fades, make_ir, convolve_st, integrated, true_peak,  # noqa: E402
                 read_wav, write_wav, momentary, short_term, lra, colored, smooth_noise)
import sfx_gen as G  # noqa: E402
import instruments as I  # noqa: E402

FPS = 30
TARGET = -14.0
CEIL = -1.0
WJ = json.load(open(os.path.join(HERE, "..", "voice", "words.json"), encoding="utf-8"))
WS = [round(x["start"] * FPS) / FPS for x in WJ]
WE = [round(x["end"] * FPS) / FPS for x in WJ]
WORDS = [re.sub(r"[^a-zäöüß0-9]", "", x["word"].lower()) for x in WJ]


def at(word, n=0):
    k = -1
    for _ in range(n + 1):
        k = WORDS.index(word, k + 1)
    return WS[k]


F = 1 / FPS
BLACK = WE[-1] + 3 * F             # story.ts BLACK
TOTAL_F = round(BLACK * FPS) + 33  # story.ts TOTAL
DUR = TOTAL_F / FPS
N = ns(DUR)
RECAP_END = at("zweiundzwanzig") - 4 * F
KNOCKS = [at("klopft"), at("klopft") + 9 * F, at("einmal", 1) - 6 * F, at("einmal", 1) + 3 * F]
PEEP = at("durch") + 18 * F


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(52)

    def put(x, t, gain=1.0, p=0.0):
        place(s, pan(x, p) if np.ndim(x) == 1 else x, t, gain)

    def noise(dur, lo, hi, slope=0.3):
        return bp(colored(ns(dur), r, slope), lo, hi)

    # room tone everywhere inside (very low), wind outside from the window shots on
    put(st(fades(lp(colored(N, r, 1.5), 300) * 0.04, 0.5, 0.5)), 0.0, 1.0)
    w0 = at("seit")
    put(fades(G.breeze(RECAP_END - w0 + 0.5, r, 0.7, 0.15, 700), 0.3, 0.4), w0 - 0.1, 0.35)
    # --- the tap: running, sputtering, air ---
    t0, t1, t2 = RECAP_END, at("hustet") - 4 * F, at("luft") - 6 * F
    n = ns(t2 - t0)
    run_ = noise(t2 - t0, 700, 6000, 0.6) * 0.22
    tn = np.arange(n) / SR + t0
    gate = np.where(tn < t1, 1.0, (np.sin(2 * np.pi * 7 * tn) > 0.2 - (tn - t1) / (t2 - t1)).astype(float) * np.interp(tn, [t1, t2], [0.9, 0.3]))
    put(fades(run_ * lp(gate, 40), 0.2, 0.05), t0, 0.9, 0.2)
    for k in range(4):
        put(noise(0.12, 200, 1200, 1.0) * np.exp(-np.arange(ns(0.12)) / ns(0.03)), t1 + 0.25 * k + r.uniform(0, 0.08), 0.6, 0.2)
    put(fades(noise(1.2, 1500, 7000, 0.0) * np.linspace(0.12, 0, ns(1.2)), 0.02, 0.2), t2, 0.6, 0.2)
    # drips into the near-empty tub
    for k in range(3):
        d = np.sin(2 * np.pi * np.geomspace(1800, 900, ns(0.08)) * np.arange(ns(0.08)) / SR) * np.exp(-np.arange(ns(0.08)) / ns(0.02))
        put(d * 0.3, at("boden") + 0.6 * k, 0.5, -0.2)
    # pots and the can set down
    put(G.clink(r, 1500, 0.2, 0.7), at("zwei", 1) - 0.05, 0.6, 0.3)
    put(G.clink(r, 1300, 0.2, 0.7), at("zwei", 1) + 0.35, 0.5, 0.3)
    put(G.push_thump(r), at("eine") - 0.03, 0.4, 0.3)
    # --- the last flush: click, rush, gurgle; then nothing refills ---
    tf = at("drückst")
    put(G.clink(r, 2000, 0.05, 0.6), tf + 0.1, 0.6, 0.3)
    n = ns(2.4)
    rush = noise(2.4, 300, 4000, 0.8) * np.interp(np.arange(n), [0, ns(0.15), ns(1.2), n - 1], [0, 1, 0.6, 0]) * 0.35
    put(rush, tf + 0.15, 0.9, 0.3)
    for k in range(6):
        g = np.sin(2 * np.pi * r.uniform(150, 300) * np.arange(ns(0.1)) / SR) * np.exp(-np.arange(ns(0.1)) / ns(0.03))
        put(g * 0.25, tf + 1.3 + 0.18 * k, 0.5, 0.3)
    put(noise(0.6, 1500, 5000, 0.0) * np.linspace(0.1, 0, ns(0.6)), at("danach") + 0.2, 0.4, 0.3)
    # the phone switched off
    put(G.clink(r, 3200, 0.03, 0.8), at("aus", 1) - 0.05, 0.4)
    # --- outside: wind, distant sirens, murmur at the station, the pushed car, glass ---
    wa, wb = at("gehst") - 0.2, at("wird") + 0.5
    put(fades(G.breeze(wb - wa, r, 0.9, 0.2, 800), 0.6, 1.0), wa, 0.45)

    def siren(t, dur, f0, p, g):
        n2 = ns(dur)
        tn2 = np.arange(n2) / SR
        f = f0 * (1 + 0.28 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * tn2)))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        put(lp(y, 1800) * np.sin(np.linspace(0, np.pi, n2)) ** 2 * 0.1, t, g, p)

    siren(at("seit") - 0.3, 7.0, 640, -0.5, 0.35)
    siren(at("unten") + 1.0, 9.0, 600, 0.6, 0.3)
    put(fades(G.babble(at("auf") - at("unten"), r, 160, 1.0) if hasattr(G, "babble") else np.zeros(1), 0.5, 0.8), at("unten"), 0.12, -0.2)
    n = ns(at("irgendwo") - at("mann") + 0.4)
    roll = lp(colored(n, r, 1.6), 180) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.3 * np.arange(n) / SR)) * 0.25
    put(fades(roll, 0.3, 0.3), at("mann"), 0.8, 0.1)
    for k in range(2):
        put(G.oof(r, "oof") if hasattr(G, "oof") else np.zeros(1), at("mann") + 0.4 + 1.1 * k, 0.25, 0.1)
    tg = at("klirrt") - 0.04
    crash = noise(0.5, 2000, 10000, 0.0) * np.exp(-np.arange(ns(0.5)) / ns(0.08)) * 0.6
    put(crash, tg, 0.7, -0.5)
    for k in range(10):
        put(G.clink(r, r.uniform(2500, 6000), 0.15, 1.0), tg + 0.05 + r.uniform(0, 0.6), 0.35, -0.5 + r.uniform(-0.2, 0.2))
    # cold: the house creaks
    put(G.creak(0.8, r, 60, 40, scale=0.5), at("kalt") - 0.1, 0.35, 0.4)
    # --- the sofa: rustle, a battery clock ticking, slow breath ---
    put(noise(0.7, 800, 5000, 0.5) * np.sin(np.linspace(0, np.pi, ns(0.7))) * 0.15, at("legst") + 0.2, 0.6, -0.3)
    t = at("legst")
    while t < at("drei") + 0.9:
        put(G.clink(r, 3800, 0.015, 0.4), t, 0.25, 0.5)
        t += 1.0
    # --- three knocks, the peephole silence, the lock and the door ---
    for k in KNOCKS:
        put(G.push_thump(r), k - 0.02, 1.1, -0.35)
        put(G.hammer_hit(r, 0.2), k - 0.02, 0.1, -0.35)
    t = PEEP - 0.6
    for inhale, dur, g in ((True, 0.6, 0.35), (False, 0.8, 0.3), (True, 0.6, 0.3)):
        nb = ns(dur)
        e = np.sin(np.linspace(0, np.pi, nb)) ** 1.5
        put(bp(colored(nb, r, 0.5), 500 if inhale else 350, 2400) * e * 0.3, t, g)
        t += dur + 0.1
    to = at("öffnest")
    put(G.clink(r, 1700, 0.08, 0.7), to - 0.2, 0.6, -0.3)
    put(G.clink(r, 1100, 0.12, 0.7), to - 0.05, 0.5, -0.3)
    put(G.creak(0.7, r, 90, 140, scale=0.6), to + 0.1, 0.45, -0.3)
    # --- the cut to black ---
    put(I.timpani(I.m2f(26), 0.9, r, 2.0), BLACK - 0.02, 0.9)
    return s


# ================================================================ music
def music_track():
    m = np.zeros((2, N))
    r = rng(19)
    D = 38

    def padp(notes, t0, t1, vel, att=1.5, rel=1.5, warm=700.0):
        if t1 - t0 < 0.5:
            return
        place(m, I.pad([I.m2f(n_) for n_ in notes], t1 - t0, vel, r, att, rel, warm), t0, 1.0)

    # hook + recap: the bleak chord from part 1 (series motif); the bathroom: drone
    padp([D, D + 7, D + 10, D + 15, D + 19], 0.0, RECAP_END + 0.5, 0.26, 0.8, 1.2, 900)
    padp([D, D + 7, D + 12], RECAP_END, at("gehst"), 0.24, 1.5, 1.2, 500)
    # remembering Frau Brandt: a warmer chord, music box notes
    padp([D + 10, D + 14, D + 17], at("frau") - 0.2, at("gewartet") - 0.1, 0.18, 0.6, 0.8, 1100)
    for k, n_ in enumerate((74, 77, 81, 79, 77)):
        place(m, pan(I.glock(I.m2f(n_), 0.25, r, 1.4), 0.2), at("frau") + 0.6 * k, 0.25)
    # counting the water: a slow heartbeat from "Zwei Töpfe" to the window
    t = at("zwei", 1)
    while t < at("gehst"):
        for dt, g in ((0, 0.5), (0.22, 0.3)):
            place(m, pan(I.timpani(I.m2f(D - 12), 0.5, r, 0.6), 0.0), t + dt, g)
        t += 60 / 64
    # the street: pizzicato motion over a wide chord
    padp([D + 3, D + 10, D + 15], at("gehst") - 0.2, at("wird"), 0.22, 1.2, 1.2, 700)
    t, k, pat = at("unten"), 0, [D + 24, D + 27, D + 31, D + 27]
    while t < at("irgendwo"):
        place(m, pan(I.pluck(I.m2f(pat[k % 4]), 0.4, r, 0.5), 0.2 * (-1) ** k), t, 0.3)
        t += 0.3; k += 1
    # cold night on the sofa: low drone, sparse high notes; drops out before the knock
    padp([D - 12, D, D + 7], at("wird"), at("drei") + 0.4, 0.22, 2.5, 0.6, 400)
    for k, n_ in enumerate((86, 84, 81)):
        place(m, pan(I.glock(I.m2f(n_), 0.15, r, 2.0), -0.3 + 0.3 * k), at("zählst") + 1.2 * k, 0.2)
    # knock -> door: rising cluster and noise riser into the cut
    padp([D + 13, D + 14, D + 20], at("durch"), BLACK, 0.2, 3.0, 0.05, 1200)
    n = ns(BLACK - at("öffnest"))
    place(m, st(bp(colored(n, r, 0.4), 300, 4000) * np.linspace(0, 1, n) ** 2.5 * 0.2), at("öffnest"), 0.9)
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


def main():
    v, sr = read_wav(os.path.join(HERE, "..", "voice", "voice.wav"))
    assert sr == SR, sr
    v = v.mean(0) if v.ndim > 1 else v
    vv = np.zeros(N)
    vv[: min(N, len(v))] = v[:N]
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
        f.write("# Blackout Teil 2 - soundtrack\n\nAll music and SFX synthesized (blackout2_audio.py); voice gain only.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: the bleak series chord under hook + recap; drone in the bathroom; warm chord + glock for the"
                " remembered Frau Brandt; a slow timpani heartbeat while counting the water; pizzicato over the street; low"
                " drone with sparse glock on the sofa; rising cluster + noise riser from the peephole into the cut, timpani hit.\n"
                "SFX: room tone, wind, the tap running / sputtering / air, drips, pots + can, the last flush (click, rush,"
                " gurgle, no refill), phone off, distant sirens, murmur at the station, the pushed car rolling + grunts, glass"
                " breaking, house creak, rustle, a battery clock ticking, four knocks, breathing at the peephole, lock + door.\n")


if __name__ == "__main__":
    main()
