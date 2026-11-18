"""Soundtrack for "Blackout - Teil 3: Nur Bargeld": synthesized tension score + SFX under the voice, mastered to
-14 LUFS integrated / -1 dBTP.

Run:  python blackout3_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Every time is a WORD of ../voice/words.json (at("kanister") = its onset, the same anchors as story.ts), so after a
new take: python ../voice/sync_words.py, then this script, then re-render.
Retention build in sound: the hook hits hard (tug, grunts, a kick), a tape-rewind into "Eine Stunde vorher", a ticking
clock under the count at the door, the crowd turns from murmur to shouting, the tug returns with the same sounds,
and a riser from the smoke into the cut on "Haus".
"""
import json
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "..", "templates", "audio"))
from dsp import (SR, ns, rng, lp, hp, bp, st, pan, place, dbg, fades, make_ir, convolve_st, integrated, true_peak,  # noqa: E402
                 read_wav, write_wav, momentary, short_term, lra, colored)
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
TOTAL_F = round(BLACK * FPS) + 30  # story.ts TOTAL
DUR = TOTAL_F / FPS
N = ns(DUR)
HOOK_CUT = at("eine", 1) - 4 * F
RECAP_END = at("im") - 4 * F
# places in time
T_STAIR, T_STREET, T_SHOPIN, T_HOME, T_RUN = at("also") - 3 * F, at("vor") - 4 * F, at("drinnen") - 4 * F, at("auf") - 4 * F, at("ihr") - 3 * F
T_TILL = at("zwei", 3) - 3 * F
TUG = [(0.0, HOOK_CUT), (at("hand", 1) - 2 * F, at("los", 2) + 2 * F)]


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(53)

    def put(x, t, gain=1.0, p=0.0):
        place(s, pan(x, p) if np.ndim(x) == 1 else x, t, gain)

    def noise(dur, lo, hi, slope=0.3):
        return bp(colored(ns(dur), r, slope), lo, hi)

    def tone(t0, t1, cut, g, p=0.0):  # a room / street bed between t0 and t1
        if t1 > t0:
            put(fades(lp(colored(ns(t1 - t0), r, 1.5), cut) * 0.05, 0.25, 0.25), t0, g, p)

    # --- the tug (hook and its payoff): plastic creaks, grunts, the canister sloshing ---
    for a, b in TUG:
        put(fades(G.creak(b - a, r, 70, 120, scale=0.7), 0.05, 0.1), a, 0.4, 0.1)
        put(fades(G.water_bed(b - a, r, close=0.6, slosh_rate=1.6), 0.1, 0.2), a, 0.35, 0.0)
        t = a + 0.3
        while t < b - 0.3:
            put(G.oof(r, "oof"), t, 0.35, 0.3 if int(t * 7) % 2 else -0.3)
            t += r.uniform(0.6, 1.0)
    # --- tape rewind into "Eine Stunde vorher": a falling whoosh + reversed noise swell ---
    n = ns(0.55)
    rew = noise(0.55, 400, 6000, 0.2) * np.linspace(0.05, 1, n) ** 2
    put(rew * 0.5, HOOK_CUT - 0.5, 0.8)
    put(G.whoosh(0.6, r, 0.35, 2400, 300), HOOK_CUT - 0.05, 0.7)
    # --- grey morning: wind and a far siren; the flat's room tone; Malik's breathing ---
    put(fades(G.breeze(RECAP_END - HOOK_CUT + 0.4, r, 0.7, 0.2, 700), 0.3, 0.4), HOOK_CUT, 0.4)
    tone(at("malik") - 4 * F, T_STAIR, 300, 0.9)
    put(G.clink(r, 900, 0.25, 0.6), at("dose") - 0.05, 0.4, 0.3)  # the can set on the counter
    # --- the stairwell: echoing steps down, a door far below; the padlock ---
    ir_st = make_ir(1.8, 7, hf=0.45)
    stair = np.zeros((2, ns(at("unten") - T_STAIR + 1.0)))
    t = 0.2
    while t < at("unten") - T_STAIR - 0.2:
        place(stair, pan(G.stroll_step(r, 0.6), -0.2), t, 0.5)
        place(stair, pan(G.stroll_step(r, 0.4), 0.2), t + 0.27, 0.35)
        t += 0.52
    put(convolve_st(stair, ir_st) * 0.5 + stair, T_STAIR, 0.8)
    tone(T_STAIR, T_STREET, 200, 0.6)
    put(G.clink(r, 2600, 0.12, 0.9), at("da") + 0.1, 0.55, -0.2)        # the lock
    put(G.clink(r, 3400, 0.08, 1.0), at("schlüssel") - 0.02, 0.35, 0.2)  # the key on its cord
    # --- the street: wind, the crowd murmur that grows; later the shouting ---
    put(fades(G.breeze(T_SHOPIN - T_STREET, r, 0.8, 0.2, 800), 0.4, 0.5), T_STREET, 0.35)
    mur = np.zeros((2, ns(T_SHOPIN - T_STREET)))
    for k in range(6):
        b = G.babble(T_SHOPIN - T_STREET, r, r.uniform(100, 220), r.uniform(0.9, 1.15), rate=3.5, active=0.5)
        place(mur, pan(b, r.uniform(-0.8, 0.8)), 0.0, 1.0)
    mur *= np.interp(np.arange(mur.shape[1]) / SR + T_STREET, [T_STREET, at("hinter") - 0.2, at("hinter"), T_SHOPIN], [0.6, 1.0, 2.2, 1.4])[None, :]
    put(fades(lp(mur, 2500), 0.6, 0.6), T_STREET, 0.16)
    put(G.clink(r, 1800, 0.06, 0.5), at("an", 2) + 0.4, 0.25, 0.3)  # tape on glass
    for k, word, n_ in ((0, "siebzehn", 0), (1, "achtzehn", 0), (2, "neunzehn", 0), (3, "zwanzig", 2)):
        put(G.boot(r, 0.5), at(word, n_) - 0.08, 0.5, 0.25)  # someone steps in on each count
    for k in range(5):
        put(G.whoa(r), at("hinter") + 0.15 + 0.3 * k + r.uniform(0, 0.15), 0.3, r.uniform(-0.7, 0.2))
    t = at("drängelt") - 0.6
    while t < T_SHOPIN - 0.2:
        put(G.stroll_step(r, 0.9), t, 0.45, 0.4)
        t += 0.36
    # --- inside: dead quiet, our steps, a fridge that does not hum; the till, coins ---
    tone(T_SHOPIN, T_HOME, 250, 0.7)
    t = T_SHOPIN + 0.4
    while t < at("kein", 1):
        put(G.stroll_step(r, 0.3), t, 0.35, -0.2)
        t += 0.55
    put(G.clink(r, 700, 0.3, 0.5), at("greifst") + 0.2, 0.5)  # the canister lifted
    put(G.clink(r, 600, 0.4, 0.4), at("los", 2) + 0.05, 0.45)
    t = at("los", 2) + 0.4
    for k in range(5):  # the man walks off
        put(G.stroll_step(r, 0.6), t + 0.5 * k, 0.4 * (1 - k / 6), 0.5)
    put(G.rattle(0.4, r, 40), T_TILL + 0.3, 0.3, 0.3)          # cans on the counter
    put(G.clink(r, 2400, 0.1, 0.8), at("neunzehn", 1) + 0.6, 0.4, 0.3)
    for k in range(3):
        put(G.clink(r, r.uniform(3000, 4200), 0.06, 1.0), at("achtzig") + 0.2 + 0.09 * k, 0.35, 0.3)  # coins back
    # --- home: wind, steps; the smoke: a far crackle and a smoke alarm beeping somewhere ---
    put(fades(G.breeze(DUR - T_HOME, r, 1.0, 0.25, 900), 0.3, 0.2), T_HOME, 0.45)
    t = T_HOME + 0.2
    while t < at("stehen", 1) - 0.1:
        put(G.stroll_step(r, 0.5), t, 0.35, -0.1)
        put(G.stroll_step(r, 0.5), t + 0.21, 0.25, 0.1)
        t += 0.62
    crack = noise(BLACK - at("über"), 1500, 7000, 0.0)
    crack *= (r.random(len(crack)) > 0.9985).astype(float) * 6 + 0.02
    put(fades(crack * np.linspace(0.3, 1.0, len(crack)), 0.5, 0.02), at("über"), 0.2, 0.3)
    t = at("schwarz")
    while t < BLACK - 0.2:  # a smoke alarm far off: three beeps, pause
        for k in range(3):
            put(np.sin(2 * np.pi * 3150 * np.arange(ns(0.12)) / SR) * 0.12 * np.hanning(ns(0.12)), t + 0.28 * k, 0.5, 0.4)
        t += 1.6
    t = T_RUN
    while t < at("der", 4) - 0.1:  # running
        put(G.boot(r, 0.8), t, 0.5, -0.15)
        put(G.boot(r, 0.7), t + 0.17, 0.4, 0.15)
        t += 0.34
    for k in range(4):  # breath while running
        nb = ns(0.25)
        put(bp(colored(nb, r, 0.5), 500, 2600) * np.sin(np.linspace(0, np.pi, nb)) * 0.3, T_RUN + 0.1 + 0.4 * k, 0.4)
    # --- the cut to black ---
    put(I.timpani(I.m2f(26), 0.95, r, 2.0), BLACK - 0.02, 1.0)
    put(I.cymbal(0.6, r, 1.6, 0.6)[::-1][: ns(0.8)], BLACK - 0.8, 0.25)
    s[:, ns(BLACK) + ns(0.05):] *= np.linspace(1, 0.4, s.shape[1] - ns(BLACK) - ns(0.05))[None, :]
    return s


# ================================================================ music
def music_track():
    m = np.zeros((2, N))
    r = rng(23)
    D = 38

    def padp(notes, t0, t1, vel, att=1.5, rel=1.5, warm=700.0):
        if t1 - t0 < 0.5:
            return
        place(m, I.pad([I.m2f(n_) for n_ in notes], t1 - t0, vel, r, att, rel, warm), t0, 1.0)

    def pulse(t0, t1, bpm, g=0.45, note=D - 12):
        t = t0
        while t < t1:
            for dt, gg in ((0, g), (0.2, g * 0.6)):
                place(m, pan(I.timpani(I.m2f(note), 0.5, r, 0.6), 0.0), t + dt, gg)
            t += 60 / bpm

    # hook: a hard cluster + fast pulse under the tug
    padp([D + 1, D + 7, D + 13], 0.0, HOOK_CUT + 0.2, 0.3, 0.1, 0.3, 1400)
    pulse(0.0, HOOK_CUT - 0.1, 112, 0.5)
    # recap + flat: the series chord, quiet
    padp([D, D + 7, D + 10, D + 15, D + 19], HOOK_CUT + 0.1, T_STAIR, 0.22, 0.6, 1.0, 900)
    # stairs: low drone + a slow pluck ostinato (the open loop: the key)
    padp([D - 12, D, D + 6], T_STAIR, T_STREET + 0.3, 0.22, 1.0, 0.8, 450)
    for k, n_ in enumerate((74, 73, 74, 70)):
        place(m, pan(I.glock(I.m2f(n_), 0.22, r, 1.6), -0.2 + 0.15 * k), at("hals") + 0.35 * k, 0.28)
    # street: pizzicato motion, chord
    padp([D + 3, D + 10, D + 15], T_STREET - 0.2, at("siebzehn") - 0.1, 0.2, 1.2, 0.6, 700)
    t, k, pat = T_STREET, 0, [D + 24, D + 27, D + 31, D + 27]
    while t < at("nach", 1):
        place(m, pan(I.pluck(I.m2f(pat[k % 4]), 0.35, r, 0.5), 0.2 * (-1) ** k), t, 0.28)
        t += 0.32
        k += 1
    # the count: a ticking clock + a rising pulse from "Nach einer Stunde" to "Der Letzte"
    t = at("nach", 1)
    while t < at("hinter") - 0.05:
        place(m, pan(I.glock(I.m2f(96), 0.12, r, 0.08), 0.3), t, 0.35)
        t += 0.5
    pulse(at("noch", 1), at("hinter"), 96, 0.45)
    padp([D + 1, D + 8, D + 13, D + 14], at("siebzehn") - 0.1, at("hinter") + 0.3, 0.24, 1.6, 0.2, 1100)
    # shouting -> inside: a hit, then near silence (a breath of air)
    place(m, pan(I.timpani(I.m2f(D - 10), 0.8, r, 1.6), 0.0), at("hinter") - 0.02, 0.6)
    padp([D - 12, D - 5], T_SHOPIN, at("ganz"), 0.18, 1.2, 0.8, 380)
    # the last canister: a held high note (focus), then the tug: pulse back, cluster
    padp([D + 31, D + 38], at("ganz") - 0.1, at("greifst"), 0.16, 0.8, 0.4, 2400)
    padp([D + 1, D + 7, D + 13], at("greifst"), at("dann", 1), 0.28, 0.3, 0.6, 1400)
    pulse(at("hand", 1), at("dann", 1), 112, 0.5)
    # Malik's whisper: everything drops to one low note; letting go: the series chord resolves (sad)
    padp([D - 12], at("dann", 1) - 0.05, at("du", 5), 0.2, 0.2, 0.4, 300)
    padp([D, D + 7, D + 10, D + 15], at("du", 5), T_HOME, 0.2, 0.6, 1.0, 800)
    for k, n_ in enumerate((74, 73, 70)):  # the open loop motif again on "Woher weiß er das?"
        place(m, pan(I.glock(I.m2f(n_), 0.22, r, 1.6), 0.1), at("woher") + 0.3 * k, 0.28)
    # home: pluck motion, then smoke: drone + riser into the cut, pulse doubles when they run
    t, k = T_HOME, 0
    while t < at("über"):
        place(m, pan(I.pluck(I.m2f([D + 22, D + 25, D + 29][k % 3]), 0.3, r, 0.5), 0.2), t, 0.24)
        t += 0.4
        k += 1
    padp([D + 1, D + 13, D + 14, D + 20], at("über") - 0.1, BLACK, 0.24, 1.0, 0.05, 1300)
    pulse(T_RUN, BLACK - 0.2, 140, 0.55)
    n = ns(BLACK - at("über"))
    place(m, st(bp(colored(n, r, 0.4), 300, 5000) * np.linspace(0, 1, n) ** 2.5 * 0.22), at("über"), 0.9)
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
    gm, gs = (v_ref - 11.0) - Lm, (v_ref - 11.0) - Ls
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
        f.write("# Blackout Teil 3 - soundtrack\n\nAll music and SFX synthesized (blackout3_audio.py); voice gain only.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: hard cluster + fast timpani pulse under the flash-forward tug; tape rewind; the series chord under the"
                " recap; drone + glock 'key' motif on the stairs; pizzicato on the street; a ticking clock and rising pulse"
                " under the count; a hit on the shouting; near silence inside; a held high note on the last canister; the"
                " tug cluster + pulse again; one low note under Malik's whisper; the chord resolves on letting go, the key"
                " motif on 'Woher'; pluck on the way home; drone + riser + double-time pulse from the smoke into the cut.\n"
                "SFX: plastic creak, sloshing water and grunts in the tug; wind, siren-free grey morning; echoing steps"
                " down the stairwell; padlock + key clinks; crowd murmur rising to shouting; a step on every count;"
                " pushing steps; inside quiet steps; canister lifted / dropped; the man walks off; cans, coins at the"
                " till; steps home; far crackle and a smoke alarm; running feet and breath; timpani + reversed cymbal"
                " into the black.\n")


if __name__ == "__main__":
    main()
