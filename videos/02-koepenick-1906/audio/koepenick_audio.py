"""Soundtrack for "Der Hauptmann von Köpenick": original synthesized music + SFX, ducked under the voice,
mastered to -15 LUFS / -1.2 dBTP.

Run:  python koepenick_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Times are seconds on the voice timeline (frame / 30), locked to story.ts in the studio (src/videos/koepenick).
Uses the synth kit from templates/audio (dsp, sfx_gen, instruments).
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "templates", "audio"))
from dsp import (SR, ns, rng, lp, hp, bp, st, pan, place, dbg, fades, make_ir, convolve_st, integrated, true_peak,  # noqa: E402
                 read_wav, write_wav, momentary, short_term, lra)
import sfx_gen as G  # noqa: E402
import instruments as I  # noqa: E402

FPS = 30
TOTAL = 2335
DUR = TOTAL / FPS
N = ns(DUR)
fr = lambda f: f / FPS
TARGET = -15.0
CEIL = -1.2

# ---------------------------------------------------------------- story times (frames from story.ts)
FLASH = fr(198)
HALT1 = fr(173)
PIECES = [fr(f) for f in (356, 370, 409)]
HALT5, GO5 = fr(628), fr(646)
TRAIN0, BEER = fr(683), fr(771)
RATH7, ARREST = fr(798), fr(900)
CHIEF0, BAD = fr(929), fr(1022)
OFFICE0, LID, COINS, QUILL = fr(1038), fr(1064), fr(1144), fr(1183)
ATT, SHOE = fr(1239), fr(1391)
CAB0, CAB_GO = fr(1431), fr(1468)
FIELD0, CHANGE, AWAY = fr(1574), fr(1607), fr(1629)
ROOM0, POINT, REWARD = fr(1646), fr(1677), fr(1762)
LOBBY0, FLAPS = fr(1783), fr(1968)
CELL0, KAISER, STAMP = fr(2027), fr(2082), fr(2136)
TODAY0 = fr(2168)


def words():
    w = json.load(open(os.path.join(HERE, "..", "voice", "words.json"), encoding="utf-8"))
    return [(x["start"], x["end"]) for x in w]


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(23)

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

    def room(t0, t1, gain=0.25):
        d = t1 - t0
        put(fades(lp(r.standard_normal(ns(d)), 400) * 0.05, 0.2, 0.2), t0, gain)

    def steps(t0, t1, rate, gain=0.5, scuff=0.5, p=0.0):
        t = t0
        while t < t1:
            put(G.stroll_step(r, scuff), t, gain * r.uniform(0.75, 1.0), p + r.uniform(-0.2, 0.2))
            t += 1.0 / rate * r.uniform(0.93, 1.07)

    def march(t0, t1, rate=2.2, gain=0.45, p=0.0):
        t, k = t0, 0
        while t < t1:
            put(G.column_stomp(r, 0.6, k % 2, boots=10, boom_gain=0.1)[0], t, gain)
            t += 1.0 / rate
            k += 1

    def whoosh(t, dur=0.5, gain=0.5, peak=0.3):
        put(G.whoosh(dur, r, peak), t - dur * peak, gain)

    def puff(t, gain=0.5):
        whoosh(t, 0.45, gain, 0.2)
        put(I.glock(I.m2f(91), 0.4, r, 0.6), t + 0.02, gain * 0.5, 0.2)

    def scratch(t0, t1, gain=0.25):
        t = t0
        while t < t1:
            d = r.uniform(0.08, 0.22)
            x = bp(r.standard_normal(ns(d)), 2500, 7000, 2) * np.hanning(ns(d))
            put(x, t, gain * r.uniform(0.5, 1.0), 0.15)
            t += d + r.uniform(0.03, 0.12)

    def clops(t0, t1, rate=2.6, gain=0.4):
        t, k = t0, 0
        while t < t1:
            x = bp(G.boot(r, 0.9), 600, 3500, 1) * (1.0 if k % 2 else 0.7)
            put(x, t, gain, -0.2 + 0.4 * (k % 2))
            t += (0.11 if k % 2 == 0 else 1.0 / rate - 0.11)
            k += 1

    def beep(t, f=1760, d=0.12, gain=0.25):
        n = ns(d)
        x = np.sin(2 * np.pi * f * np.arange(n) / SR) * fades(np.ones(n), 0.005, 0.02)
        put(x, t, gain)

    # 1 hook: square ambience, the squad marching, the stomp on "erobert"
    amb(0, FLASH, birds=0.6, babble=0.25)
    march(0.1, HALT1, 2.2, 0.4)
    put(G.column_stomp(r, 1.3, 0, boots=14, boom_gain=0.3)[0], HALT1 + 0.05, 0.9)
    whoosh(FLASH, 0.5, 0.45, 0.6)
    # 2 street: traffic of the 1900s (hooves far, steps), a sad moth flutter on "pleite"
    amb(FLASH, fr(316), birds=0.3, babble=0.2)
    clops(FLASH + 0.5, fr(316) - 0.3, 2.4, 0.08)
    steps(FLASH + 0.2, fr(316) - 0.2, 2.0, 0.2, 0.6, 0.4)
    put(hp(G.flag_flutter(0.8, r), 1500) * 0.6, fr(296), 0.35, 0.2)
    # 3 shop: room tone, a puff and a sparkle per uniform piece
    room(fr(316), fr(450), 0.5)
    for t in PIECES:
        puff(t, 0.55)
    # 4 street: the captain steps out, the shop bell, the passers greet
    amb(fr(450), fr(683), birds=0.3, babble=0.25)
    put(I.glock(I.m2f(88), 0.35, r, 0.8), fr(452), 0.4, 0.3)
    put(I.glock(I.m2f(84), 0.3, r, 0.8), fr(456), 0.35, 0.3)
    steps(fr(454), fr(492), 2.3, 0.35, 0.4)
    # 5 the squad marches in, halts on "an", follows from "folgen"
    march(fr(562), HALT5, 2.2, 0.45, -0.2)
    put(G.column_stomp(r, 1.2, 0, boots=12, boom_gain=0.2)[0], HALT5 + 0.06, 0.85)
    march(GO5, fr(683), 2.2, 0.45, -0.3)
    # 6 train: wheel clatter on the rail joints, the rattle of the carriage, a cheer and mugs on "Bier"
    d = fr(798) - TRAIN0
    put(fades(lp(r.standard_normal(ns(d)), 300) * 0.25, 0.3, 0.3), TRAIN0, 0.8)
    t = TRAIN0
    while t < fr(798):
        for k in (0, 0.11):
            put(lp(G.boot(r, 0.8), 1500), t + k, 0.3, -0.2)
        t += 0.62
    put(G.rattle(d, r, 12), TRAIN0, 0.15)
    for k in range(5):
        put(G.clink(r), BEER + 0.05 + k * 0.07, 0.4, r.uniform(-0.6, 0.6))
    for k in range(4):
        put(G.hurrah(r, r.uniform(110, 150), 1.0), BEER + 0.1 + r.uniform(0, 0.2), 0.3, r.uniform(-0.6, 0.6))
    # 7 Rathaus: running boots to the doors, the arrest
    amb(RATH7, fr(1038), birds=0.4, babble=0.35)
    for k in range(6):
        t = fr(800 + 3 * k)
        while t < fr(800 + 3 * k) + 2.3:
            put(G.boot(r, 0.8), t, 0.18, r.uniform(-0.7, 0.7))
            t += 0.16
    put(G.push_thump(r), ARREST, 0.6)
    whoosh(ARREST, 0.4, 0.4)
    for k in range(3):
        put(G.whoa(r), ARREST + 0.1 + k * 0.12, 0.25, r.uniform(-0.6, 0.6))
    # 8 the police chief strolls off to his bath, humming
    steps(fr(936), fr(1038), 1.6, 0.35, 0.3)
    put(I.whistle([(fr(1024) + i * 0.18, 0.17, m_, 0.8) for i, m_ in enumerate((72, 76, 79, 76, 84))], r)[1], fr(1024) - 0.15, 0.25, 0.1)
    # 9 office: the lid, the coins, the quill
    room(OFFICE0, fr(1431), 0.5)
    put(G.creak(0.25, r, 160, 220, scale=0.6), LID, 0.5)
    put(G.boot(r, 0.4), LID + 0.25, 0.3)
    for k in range(14):
        put(G.clink(r, None, 0.15, 1.2), COINS + 0.03 * k + r.uniform(0, 0.03), 0.35 * r.uniform(0.5, 1.0), r.uniform(-0.5, 0.5))
    scratch(QUILL, QUILL + 1.0, 0.28)
    # 10 attention: one heel click; the hammer on "Schuster"
    put(G.column_stomp(r, 0.9, 0, boots=4, boom_gain=0.0)[0], ATT + 0.1, 0.6)
    for k in range(3):
        put(G.hammer_hit(r, 0.7), SHOE + k * 0.5, 0.55)
    # 11 the cab: hooves and wheels
    amb(CAB0, FIELD0, birds=0.4, babble=0.2)
    clops(CAB_GO, FIELD0, 2.4, 0.45)
    put(G.rattle(FIELD0 - CAB_GO, r, 20, heavy=True), CAB_GO, 0.2)
    put(G.creak(0.4, r, 80, 140), CAB_GO - 0.1, 0.35)
    # 12 Tempelhofer Feld: wind, the change, off he goes
    amb(FIELD0, ROOM0, birds=0.7, breeze=0.9)
    puff(CHANGE, 0.6)
    steps(AWAY, ROOM0, 3.4, 0.3, 0.5, 0.4)
    # 13 the room: the door, the cup, the snitch's chuckle, the coin purse
    room(ROOM0, LOBBY0, 0.5)
    put(G.creak(0.5, r, 90, 150), fr(1650), 0.45, -0.3)
    put(G.clink(r, 1900, 0.2), fr(1675), 0.4)
    for k in range(4):
        put(G.clink(r, None, 0.12, 1.1), REWARD + 0.05 + k * 0.06, 0.3)
    # 14 today's lobby: air handling, the sliding doors, the turnstile beep
    put(fades(lp(r.standard_normal(ns(CELL0 - LOBBY0)), 900) * 0.06, 0.3, 0.3), LOBBY0, 0.7)
    put(fades(lp(G.babble(CELL0 - LOBBY0, r, 140, 1.0, active=0.3), 2500), 0.3, 0.3) * 0.25, LOBBY0, 0.7)
    whoosh(fr(1790), 0.8, 0.25)
    steps(LOBBY0 + 0.2, CELL0 - 0.3, 1.8, 0.25, 0.2)
    beep(FLAPS, 1760, 0.1, 0.3)
    beep(FLAPS + 0.14, 2350, 0.12, 0.3)
    whoosh(FLAPS + 0.1, 0.35, 0.25)
    # 15 cell (dripping, distant keys), the Kaiser's stamp
    room(CELL0, KAISER, 0.6)
    put(G.rattle(0.6, r, 25), CELL0 + 0.6, 0.15, -0.6)
    room(KAISER, TODAY0, 0.4)
    put(G.push_thump(r) * 1.4, STAMP, 0.8)
    # 16 today: square ambience, a church bell
    amb(TODAY0, DUR, birds=0.6, breeze=0.5, babble=0.35)
    return s


# ================================================================ music
BPM = 112
BEAT = 60 / BPM

MARCH = [  # Bb major march tune, 16 beats
    (0, .75, 70), (.75, .25, 70), (1, 1, 74), (2, 1, 77), (3, 1, 74), (4, .75, 75), (4.75, .25, 74), (5, 1, 72), (6, 1.5, 70), (7.5, .5, None),
    (8, .75, 72), (8.75, .25, 72), (9, 1, 75), (10, 1, 79), (11, 1, 77), (12, 1, 75), (13, 1, 74), (14, 1.5, 72), (15.5, .5, 77),
]
MCHORDS = [(0, 46), (4, 51), (6, 46), (8, 41), (12, 51), (14, 41)]  # root per span (major triads)
SNEAK = [  # tiptoe tune for the con (G minor, staccato), 8 beats
    (0, .5, 67), (1, .5, 70), (1.5, .5, 69), (2, .5, 67), (3, .5, 62), (4, .5, 63), (5, .5, 66), (5.5, .5, 67), (6, 1, 62),
]


def music_track():
    m = np.zeros((2, N))
    r = rng(7)

    def march(t0, t1, vel=0.6, drums=True, mel=True, beat=BEAT):
        loop = 16 * beat
        t = t0
        while t < t1 - 0.3:
            if mel:
                for b_, d, n_ in MARCH:
                    tn = t + b_ * beat
                    if n_ is None or tn >= t1 - 0.1:
                        continue
                    place(m, pan(I.brass(I.m2f(n_), d * beat * 0.85, vel, r, "horn"), 0.15), tn, 0.55)
                    place(m, pan(I.fife(I.m2f(n_ + 12), d * beat * 0.85, vel * 0.5, r), 0.3), tn, 0.35)
            for i, (cb, root) in enumerate(MCHORDS):
                end = MCHORDS[i + 1][0] if i + 1 < len(MCHORDS) else 16
                for k in range(int(cb), end):
                    tn = t + k * beat
                    if tn >= t1 - 0.1:
                        break
                    if k % 2 == 0:
                        place(m, pan(I.brass(I.m2f(root - 12 + (7 if k % 4 == 2 else 0)), beat * 0.6, vel, r, "tuba"), -0.2), tn, 0.9)
                    else:
                        for j, n_ in enumerate((root + 4, root + 7, root + 12)):
                            place(m, pan(I.brass(I.m2f(n_), beat * 0.3, vel * 0.45, r, "stab"), 0.3 - 0.2 * j), tn, 0.45)
            if drums:
                for k in range(16):
                    tn = t + k * beat
                    if tn < t1 - 0.1:
                        place(m, pan(I.snare(0.35 if k % 4 == 0 else 0.22, r, 0.2, 1.2), 0.25), tn, 0.5)
                        if k % 2:
                            place(m, pan(I.snare(0.12, r, 0.12, 1.3), 0.25), tn + beat / 2, 0.4)
            t += loop

    def sneak(t0, t1, vel=0.6, tr=0):
        loop = 8 * BEAT
        t = t0
        while t < t1 - 0.3:
            for b_, d, n_ in SNEAK:
                tn = t + b_ * BEAT
                if tn < t1 - 0.1:
                    place(m, pan(I.pluck(I.m2f(n_ + tr), vel, r, 0.35, 0.6), 0.2), tn, 0.8)
            for k in range(0, 8, 2):
                tn = t + k * BEAT
                if tn < t1 - 0.1:
                    place(m, pan(I.pluck(I.m2f(43 + tr if k % 4 == 0 else 50 + tr), vel, r, 0.4, 0.3), -0.25), tn, 0.9)
            t += loop

    def tuba_wah(t, notes, d=0.32, vel=0.7):
        for k, n_ in enumerate(notes):
            place(m, pan(I.brass(I.m2f(n_), d * (1.6 if k == len(notes) - 1 else 0.9), vel, r, "tuba", fall=(-200 if k == len(notes) - 1 else 0)), 0), t + k * d, 1.0)

    def sting(t, root=46, vel=0.8):
        for j, n_ in enumerate((root, root + 4, root + 7, root + 12)):
            place(m, pan(I.brass(I.m2f(n_ + 12), 0.7, vel, r, "stab"), -0.3 + 0.2 * j), t, 0.6)
        place(m, pan(I.timpani(I.m2f(root - 12), 0.9, r), 0), t, 0.8)
        place(m, st(I.cymbal(0.6, r)), t, 0.5)

    # hook: the march, a hit on "erobert", stop at the flash
    march(0.0, FLASH - 0.05, 0.6)
    sting(HALT1 + 0.05)
    # Voigt is broke: sparse sneak, a sad tuba on "pleite"
    sneak(FLASH + 0.1, fr(316), 0.45)
    tuba_wah(fr(296), [41, 40, 38], 0.28, 0.6)
    # the shop: sneak with a glock sparkle per piece, brass button on "Hauptmanns"
    sneak(fr(316), fr(450), 0.55)
    for k, t in enumerate(PIECES):
        for j in range(3):
            place(m, pan(I.glock(I.m2f(79 + 4 * j + 2 * k), 0.4, r, 1.0), 0.3), t + 0.06 * j, 0.5)
    sting(PIECES[2], 46, 0.6)
    # the uniform works: march from the shop door through the train
    march(fr(452), BEER - 0.05, 0.62)
    sting(fr(538), 46, 0.5)
    # beer: oompah
    march(BEER, fr(798), 0.5, drums=False, beat=60 / 132)
    # the Rathaus taken: march, timpani hit on the arrest
    march(RATH7 + 0.05, fr(929), 0.6)
    sting(ARREST, 41, 0.7)
    # the police chief off to his bath: light sneak in major
    sneak(CHIEF0, OFFICE0, 0.4, tr=3)
    # the cash box: sneak, glock run on the coins, sting on "falschem Namen"
    sneak(OFFICE0, ATT, 0.5)
    for j, n_ in enumerate((82, 86, 89, 94, 98)):
        place(m, pan(I.glock(I.m2f(n_), 0.45, r, 1.2), 0.2), COINS + 0.05 * j, 0.6)
    tuba_wah(fr(1206), [46, 41], 0.25, 0.55)
    # attention: the march, very straight, cut by the hammer
    march(ATT, SHOE - 0.05, 0.5, mel=True)
    # the cab: march fades, half tempo
    march(CAB0, FIELD0, 0.45, drums=True, beat=60 / 96)
    # Tempelhofer Feld: Voigt whistles himself off
    st_, w = I.whistle([(AWAY + i * 0.2, 0.19, n_, 0.8) for i, n_ in enumerate((70, 74, 77, 74, 70, 72, 74))], r)
    place(m, pan(w, 0.15), st_, 0.5)
    # the snitch: sneak, tuba fall on "verrät"
    sneak(ROOM0, LOBBY0, 0.45)
    tuba_wah(POINT, [43, 42, 41, 38], 0.25, 0.65)
    # today: vibes + brush, office-lobby cool
    t = LOBBY0
    prog = [[58, 62, 65, 69], [55, 58, 62, 65], [53, 57, 60, 64], [51, 55, 58, 62]]
    k = 0
    while t < CELL0 - 0.2:
        ch = prog[k % 4]
        for j, n_ in enumerate(ch):
            place(m, pan(I.vibes(I.m2f(n_), 0.35, r, 1.6), -0.3 + 0.2 * j), t + 0.02 * j, 0.5)
        for b_ in range(4):
            place(m, pan(I.brush(0.3, r, 0.3, b_ % 2 == 1), 0.2), t + b_ * BEAT, 0.5)
        place(m, pan(I.pluck(I.m2f(ch[0] - 24), 0.6, r, 0.9, 0.3), -0.1), t, 0.8)
        t += 4 * BEAT
        k += 1
    sting(FLAPS + 0.1, 46, 0.4)
    # cell: low pad; Kaiser: fanfare on "begnadigt"
    place(m, st(fades(I.pad([I.m2f(43), I.m2f(50), I.m2f(55)], KAISER - CELL0, 0.4, r, 0.4, 0.3).mean(0), 0.2, 0.2)), CELL0, 0.7)
    march(KAISER, STAMP - 0.05, 0.5, drums=False)
    sting(STAMP, 46, 0.9)
    # today: the march, gentle, ending on a held chord + glock button
    march(TODAY0 + 0.1, DUR - 1.5, 0.45, drums=True)
    place(m, st(fades(I.pad([I.m2f(46), I.m2f(53), I.m2f(58), I.m2f(62)], 1.3, 0.5, r, 0.05, 0.6).mean(0), 0.02, 0.4)), DUR - 1.5, 0.7)
    place(m, pan(I.glock(I.m2f(82), 0.5, r, 1.6), 0.2), DUR - 1.5, 0.5)
    ir = make_ir(1.0, 3, hf=0.6)
    return convolve_st(m, ir) * 0.22 + m


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
    M = M * dbg(duck_curve(words()))[None, :]
    # same balance as Erfurt after the user's note: music ~12.5 LU under the voice, SFX ~13 LU under
    Lm, Ls = integrated(M), integrated(S)
    gm, gs = (v_ref - 15.5) - Lm, (v_ref - 16.0) - Ls  # user: brass music and SFX a touch quieter (-3 dB each)
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
        f.write("# Köpenick 1906 - soundtrack\n\nAll music and SFX synthesized (koepenick_audio.py); voice = ElevenLabs \"Daniel\", gain only.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: Bb-major Prussian march (horn + fife + tuba/stab oompah + snare) whenever the uniform works, a G-minor"
                " pizzicato sneak for the con (broke, shop, cash box, snitch), brass stings on erobert / Hauptmanns / arrest /"
                " begnadigt, tuba falls on pleite and verrät, oompah for the beer, vibes + brushes for today's lobby, held chord + glock.\n")


if __name__ == "__main__":
    main()
