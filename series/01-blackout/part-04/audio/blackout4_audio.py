"""Soundtrack for "Blackout - Teil 4: Feuer im vierten Stock": synthesized tension score + SFX under the voice,
mastered to -14 LUFS integrated / -1 dBTP.

Run:  python blackout4_audio.py      (writes mix.wav, stem_*.wav, cues.md next to this file)
Every time is a WORD of ../voice/words.json (at("radio") = its onset, the same anchors as story.ts), so after a new
take: python ../voice/sync_words.py, then this script, then re-render.
Retention build in sound: a crackle + low cluster under the hook; the stairwell as a chimney (rising noise); a hiss
on "Heiß"; door knocks into silence on "Nichts"; Kessler's generator hum behind the slit (planted for later); the floor
count 8..1 on a heartbeat pulse that speeds up, a step + tick on every number; Jansen's arrival as a held note; the
burst into daylight; a two-tone siren; the hydrant sputter; the key motif on Malik's key; water rush; a false-relief
chord in the yard; the count of faces on single plucks; the radio's static under the last line; cut to black on "weg".
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
HOOK_CUT = at("tag") - 4 * F
# places in time (story.ts shot starts)
T_STAIR = at("der", 1) - 3 * F          # into the stairwell
T_FLAT = at("frau", 2) - 3 * F          # inside her flat
T_KES = at("ein") - 3 * F               # Kessler's floor
T_DOWN = at("runter") - 3 * F           # down
T_OUT = at("draußen") - 3 * F           # out into the daylight
T_YARD = at("im", 2) - 3 * F            # everyone in blankets
T_UP = at("du", 6) - 3 * F              # back up
T_DOOR = at("ihre", 1) - 3 * F          # her door is open
T_ROOM = at("das") - 3 * F              # the radio on the floor
KNOCKS = [at("du", 2) + k / FPS for k in (4, 13, 22, 34, 43, 52)]
COUNT = [("acht", 0), ("sieben", 0), ("sechs", 0), ("fünf", 0), ("vier", 0), ("drei", 0), ("zwei", 1), ("eins", 0)]


def tone2(f0, dur, harm=(1, 0.5, 0.33, 0.25)):
    t = np.arange(ns(dur)) / SR
    return sum(a * np.sin(2 * np.pi * f0 * (k + 1) * t) for k, a in enumerate(harm))


# ================================================================ SFX
def sfx_track():
    s = np.zeros((2, N))
    r = rng(54)

    def put(x, t, gain=1.0, p=0.0):
        place(s, pan(x, p) if np.ndim(x) == 1 else x, t, gain)

    def noise(dur, lo, hi, slope=0.3):
        return bp(colored(ns(dur), r, slope), lo, hi)

    def tone(t0, t1, cut, g, p=0.0):  # a room / street bed between t0 and t1
        if t1 > t0:
            put(fades(lp(colored(ns(t1 - t0), r, 1.5), cut) * 0.05, 0.25, 0.25), t0, g, p)

    def crackle(t0, t1, g, dens=0.9985):
        c = noise(t1 - t0, 1500, 7000, 0.0)
        c *= (r.random(len(c)) > dens).astype(float) * 6 + 0.02
        put(fades(c, 0.3, 0.3), t0, g, 0.3)

    def cough(t, g=0.5, p=0.0):
        for k in range(2):
            nb = ns(0.14)
            put(bp(colored(nb, r, 0.6), 250, 2400) * np.exp(-np.linspace(0, 5, nb)) * 0.7, t + 0.22 * k, g * (1 - 0.3 * k), p)

    def steps(t0, t1, dt, g, ir=None, p=0.0):
        buf = np.zeros((2, ns(t1 - t0 + 1.0)))
        t = 0.05
        while t < t1 - t0:
            place(buf, pan(G.stroll_step(r, 0.6), p - 0.15), t, g)
            t += dt
        put(convolve_st(buf, ir) * 0.5 + buf if ir is not None else buf, t0, 1.0)

    def alarm(t0, t1, g):  # a smoke alarm somewhere: three beeps, pause
        t = t0
        while t < t1 - 0.2:
            for k in range(3):
                put(np.sin(2 * np.pi * 3150 * np.arange(ns(0.12)) / SR) * 0.12 * np.hanning(ns(0.12)), t + 0.28 * k, g, 0.4)
            t += 1.6

    ir_st = make_ir(1.9, 8, hf=0.4)
    # --- hook + street: wind, crackle from the window, the smoke alarm, people murmuring ---
    put(fades(G.breeze(T_STAIR, r, 0.8, 0.2, 800), 0.05, 0.4), 0.0, 0.4)
    crackle(0.0, T_STAIR, 0.22)
    alarm(0.3, T_STAIR, 0.4)
    mur = np.zeros((2, ns(T_STAIR - HOOK_CUT)))
    for k in range(4):
        place(mur, pan(G.babble(T_STAIR - HOOK_CUT, r, r.uniform(110, 220), r.uniform(0.9, 1.15), rate=3.5, active=0.4), r.uniform(-0.8, 0.8)), 0.0, 1.0)
    put(fades(lp(mur, 2400), 0.4, 0.4), HOOK_CUT, 0.1)
    for k in range(3):  # the phone: tapping, no tone
        put(G.clink(r, 4200, 0.03, 1.0), at("kein") - 0.4 + 0.18 * k, 0.25, -0.1)
    # Malik: bike stand kicked, chain ticking, he rides off
    put(G.clink(r, 1400, 0.1, 0.7), at("springt") + 0.1, 0.4, 0.2)
    tick = np.zeros(ns(2.4))
    for k in range(40):
        i = ns(0.06 * k)
        tick[i: i + 200] += np.random.default_rng(k).standard_normal(200) * np.exp(-np.linspace(0, 8, 200)) * 0.25
    put(hp(tick, 2500), at("springt") + 0.25, 0.4, 0.3)
    put(G.whoosh(0.7, r, 0.25, 1800, 300), at("hol") - 0.1, 0.4, 0.5)
    # you run in: steps on the pavement, the house door
    t = at("du") - 0.05
    while t < T_STAIR - 0.1:
        put(G.boot(r, 0.7), t, 0.45, -0.1)
        t += 0.3
    put(G.push_thump(r), T_STAIR - 0.12, 0.5)
    # --- the stairwell: closed in, echo, the chimney: a rising roar of air; your steps up ---
    n = ns(T_DOWN - T_STAIR)
    roar = lp(colored(n, r, 1.2), 380) * np.interp(np.arange(n) / SR + T_STAIR, [T_STAIR, at("kamin"), T_FLAT, T_KES, T_DOWN], [0.4, 1.0, 0.7, 0.8, 1.0])
    put(fades(roar * 0.25, 0.3, 0.3), T_STAIR, 0.8)
    steps(T_STAIR + 0.1, at("im", 1) - 0.1, 0.42, 0.45, ir_st)
    crackle(at("im", 1) - 0.1, at("also") - 0.1, 0.3, 0.998)
    put(fades(noise(0.7, 2000, 9000, 0.1) * 0.3, 0.02, 0.5), at("heiß") - 0.05, 0.7, 0.1)  # the hiss: hot
    put(G.push_thump(r) * 0.6, at("hand") + 0.1, 0.4)
    steps(at("also") - 0.05, at("neunter") - 0.15, 0.38, 0.45, ir_st)
    for k in range(2):
        cough(at("augen") + 0.6 + 0.7 * k, 0.4, -0.2)
    # the knocks, then nothing (room tone drops); the door opens (creak); her flat: a clock ticking
    for t in KNOCKS:
        put(G.push_thump(r), t, 0.85, 0.1)
    put(G.creak(0.8, r, 60, 40, scale=0.6), at("geht") - 0.1, 0.4, 0.1)
    tk = np.zeros((2, ns(T_KES - T_FLAT + 0.6)))
    for k in range(int((T_KES - T_FLAT) / 0.5) + 1):
        place(tk, pan(G.clink(r, 2800, 0.03, 0.6), 0.3), 0.5 * k, 0.25)
    put(tk, T_FLAT - 0.6, 1.0)
    put(G.rattle(0.5, r, 30), at("packt") + 0.1, 0.35, 0.2)  # the pills
    # Kessler: chain/lock, the slit; the generator hum behind it; the slam
    put(G.clink(r, 2200, 0.1, 0.8), at("öffnet") - 0.2, 0.4)
    put(G.creak(0.5, r, 90, 70, scale=0.5), at("öffnet") + 0.05, 0.35)
    nh = ns(at("zu") - at("öffnet") + 0.2)
    th = np.arange(nh) / SR
    hum = (np.sin(2 * np.pi * 50 * th) + 0.6 * np.sin(2 * np.pi * 100 * th) + 0.3 * np.sin(2 * np.pi * 150 * th)) * (0.8 + 0.2 * np.sin(2 * np.pi * 6.5 * th))
    hum = hum + lp(colored(nh, r, 1.0), 220) * 2.0
    hum *= np.interp(th + at("öffnet"), [at("öffnet"), at("kessler"), at("brummt") - 0.1, at("brummt") + 0.3, at("zu") - 0.1], [0.15, 0.3, 0.35, 1.0, 1.0])
    put(fades(hum * 0.18, 0.1, 0.03), at("öffnet"), 0.9)
    put(G.push_thump(r), at("zu") - 0.08, 1.2)
    put(G.wood_crack(r) * 0.5, at("zu") - 0.06, 0.5)
    # --- down: thicker roar, coughing, the count: a step on each number; Jansen's steps from below ---
    t = T_DOWN + 0.2
    i = 0
    while t < T_OUT - 0.1:
        dt = 0.42 if t < at("vier") else 0.24
        put(G.boot(r, 0.55), t, 0.35, -0.2 if i % 2 else 0.2)
        t += dt
        i += 1
    for w, n_ in COUNT:
        put(G.boot(r, 1.0), at(w, n_) - 0.05, 0.6)
    cough(at("hustet") - 0.05, 0.55, 0.2)
    cough(at("hustet") + 0.6, 0.4, 0.2)
    cough(at("herz") + 0.5, 0.35, 0.2)
    t = at("von") - 0.3
    while t < at("ich", 2):
        put(G.stroll_step(r, 0.4), t, 0.3, -0.4)
        t += 0.45
    # holding your breath: everything but the steps drops away (filtered room)
    put(fades(lp(colored(ns(T_OUT - at("luft")), r, 1.6), 200) * 0.06, 0.1, 0.05), at("luft"), 1.0)
    # --- out: a burst of air; street; the siren (two-tone), the engine; the hydrant sputter ---
    put(G.whoosh(0.8, r, 0.45, 3000, 400), T_OUT - 0.1, 0.9)
    put(fades(G.breeze(DUR - T_OUT, r, 0.9, 0.2, 850), 0.2, 0.3), T_OUT, 0.4)
    cough(T_OUT + 0.35, 0.5, -0.1)
    t0 = at("sirene") - 0.35
    ts = np.arange(ns(T_YARD - t0)) / SR
    two = np.where((ts % 1.3) < 0.65, 440.0, 587.0)
    ph = 2 * np.pi * np.cumsum(two) / SR
    sir = (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.interp(ts + t0, [t0, t0 + 0.4, at("aber") - 0.2, at("aber") + 0.6, T_YARD], [0.15, 0.6, 1.0, 0.25, 0.0])
    put(fades(lp(sir, 3200) * 0.12, 0.05, 0.3), t0, 1.0, 0.2)
    eng = lp(colored(ns(T_YARD - t0), r, 1.4), 160) * np.interp(ts + t0, [t0, at("aber"), T_YARD], [0.3, 1.0, 0.6])
    put(fades(eng * 0.35, 0.3, 0.6), t0, 0.8)
    put(G.push_thump(r), at("aber") - 0.3, 0.35, 0.3)  # the coupling
    t = at("spuckt") - 0.05
    while t < at("druck") + 0.4:  # sputter: water and air bursts
        put(fades(G.water_bed(0.18, r, close=0.8, slosh_rate=3.0), 0.01, 0.06), t, 0.55, 0.2)
        put(fades(noise(0.08, 800, 5000, 0.2) * 0.3, 0.005, 0.05), t + 0.12, 0.5, 0.2)
        t += r.uniform(0.3, 0.55)
    put(G.clink(r, 3400, 0.08, 1.0), at("schlüssel") - 0.02, 0.35, -0.2)
    # the tank water: a rush, steam hiss at the window
    tw = at("tankwasser") - 0.4
    put(fades(G.water_bed(T_YARD - tw, r, close=1.0, slosh_rate=0.4) + noise(T_YARD - tw, 600, 6000, 0.2) * 0.2, 0.2, 0.8), tw, 0.6)
    put(fades(noise(2.5, 2500, 9000, 0.1) * 0.25, 0.4, 1.5), at("reicht") - 0.2, 0.6, 0.3)
    crackle(T_OUT, at("tankwasser") + 1.2, 0.25)
    # yard: murmur, a blanket rustle; then the run back in, the stairwell again, a far creak of her door
    mur2 = np.zeros((2, ns(T_UP - T_YARD)))
    for k in range(4):
        place(mur2, pan(G.babble(T_UP - T_YARD, r, r.uniform(110, 220), r.uniform(0.9, 1.15), rate=3.0, active=0.35), r.uniform(-0.8, 0.8)), 0.0, 1.0)
    put(fades(lp(mur2, 2200), 0.4, 0.3), T_YARD, 0.08)
    t = T_UP
    while t < at("neun") - 0.15:
        put(G.boot(r, 0.8), t, 0.5, -0.1)
        t += 0.28
    st_ = np.zeros((2, ns(T_DOOR - at("neun") + 1.2)))
    t = 0.0
    while t < T_DOOR - at("neun"):
        place(st_, pan(G.boot(r, 0.8), 0.0), t, 0.5)
        t += 0.24
    put(convolve_st(st_, ir_st) * 0.6 + st_, at("neun") - 0.1, 0.9)
    put(G.creak(1.2, r, 40, 25, scale=0.5), T_DOOR + 0.3, 0.25, -0.2)
    # the radio on the floor: static, quiet, with a voice too far down to understand; the cut kills it
    nr = ns(BLACK - T_ROOM)
    stat = bp(colored(nr, r, 0.2), 900, 5200) * (0.6 + 0.4 * np.abs(np.sin(np.arange(nr) / SR * 3.1)))
    put(fades(stat * 0.12, 0.25, 0.01), T_ROOM, 0.8, -0.1)
    put(fades(G.breeze(BLACK - T_ROOM, r, 0.5, 0.25, 600), 0.4, 0.01), T_ROOM, 0.25)
    # --- the cut to black ---
    put(I.timpani(I.m2f(26), 0.95, r, 2.0), BLACK - 0.02, 1.0)
    put(I.cymbal(0.6, r, 1.6, 0.6)[::-1][: ns(0.8)], BLACK - 0.8, 0.25)
    s[:, ns(BLACK) + ns(0.05):] *= np.linspace(1, 0.4, s.shape[1] - ns(BLACK) - ns(0.05))[None, :]
    return s


# ================================================================ music
def music_track():
    m = np.zeros((2, N))
    r = rng(24)
    D = 38

    def padp(notes, t0, t1, vel, att=1.5, rel=1.5, warm=700.0):
        if t1 - t0 < 0.5:
            return
        place(m, I.pad([I.m2f(n_) for n_ in notes], t1 - t0, vel, r, att, rel, warm), t0, 1.0)

    def pulse(t0, t1, bpm0, bpm1=None, g=0.45, note=D - 12):
        t = t0
        while t < t1:
            bpm = bpm0 + ((bpm1 or bpm0) - bpm0) * (t - t0) / max(1e-6, t1 - t0)
            for dt, gg in ((0, g), (0.2, g * 0.6)):  # lub-dub
                place(m, pan(I.timpani(I.m2f(note), 0.5, r, 0.6), 0.0), t + dt, gg)
            t += 60 / bpm

    # hook: a low cluster, crackling; the stakes ("im neunten"): a high note above it
    padp([D - 12, D + 1, D + 6], 0.0, HOOK_CUT + 0.3, 0.3, 0.05, 0.4, 900)
    padp([D + 31], at("und") - 0.05, HOOK_CUT + 0.3, 0.16, 0.3, 0.3, 2600)
    # recap + Malik: the series chord, a fast pluck under the bike
    padp([D, D + 7, D + 10, D + 15, D + 19], HOOK_CUT + 0.05, T_STAIR, 0.2, 0.4, 0.6, 900)
    t, k = at("malik") - 0.1, 0
    while t < T_STAIR - 0.2:
        place(m, pan(I.pluck(I.m2f([D + 24, D + 27, D + 31, D + 27][k % 4]), 0.3, r, 0.5), 0.2 * (-1) ** k), t, 0.26)
        t += 0.22
        k += 1
    # the stairwell going up: a drone that rises (chimney), the pulse starts at 80
    padp([D - 12, D, D + 6], T_STAIR, at("neunter"), 0.24, 1.0, 0.6, 450)
    n = ns(at("heiß") - T_STAIR)
    place(m, st(bp(colored(n, r, 0.4), 300, 4000) * np.linspace(0, 1, n) ** 2 * 0.18), T_STAIR, 0.9)
    place(m, pan(I.timpani(I.m2f(D - 10), 0.8, r, 1.6), 0.0), at("heiß") - 0.02, 0.55)
    pulse(at("also"), at("nichts") - 0.1, 80, 92, 0.4)
    # "Nichts": the music stops dead; the door opens: a warm, quiet chord (Frau Brandt), a held note on the radio
    padp([D + 12, D + 19, D + 24], at("dann") - 0.05, T_KES, 0.18, 0.8, 0.6, 1100)
    padp([D + 31, D + 36], at("ihr") - 0.1, T_KES + 0.2, 0.14, 0.6, 0.5, 2600)
    # Kessler: a dissonant low cluster under the hum, cut by the slam
    padp([D - 12, D - 11, D - 5], T_KES, at("zu") - 0.05, 0.22, 0.6, 0.05, 400)
    place(m, pan(I.timpani(I.m2f(D - 12), 0.9, r, 1.8), 0.0), at("zu") - 0.02, 0.6)
    # down: drone, heartbeat pulse that speeds up through the count; a tick on each number
    padp([D - 12, D + 1, D + 13, D + 14], T_DOWN, at("fünf"), 0.24, 1.0, 0.5, 1000)
    pulse(T_DOWN + 0.3, at("herz"), 84, 104, 0.45)
    pulse(at("herz"), at("fünf"), 66, 60, 0.6, D - 14)  # her heart: slow, heavy
    for w, n_ in COUNT:
        place(m, pan(I.glock(I.m2f(96), 0.14, r, 0.1), 0.3), at(w, n_) - 0.02, 0.4)
    # Jansen's light: a held bright chord, hope
    padp([D + 15, D + 19, D + 22, D + 27], at("licht") - 0.2, at("vier"), 0.2, 0.5, 0.3, 2200)
    # four .. one: fast pulse, riser into the burst outside
    pulse(at("vier") - 0.05, T_OUT - 0.05, 132, 150, 0.55)
    n = ns(T_OUT - at("vier"))
    place(m, st(bp(colored(n, r, 0.4), 300, 6000) * np.linspace(0, 1, n) ** 2.5 * 0.25), at("vier"), 0.9)
    # outside: bright open chord, then tension again under the dry hydrant; the key motif
    padp([D + 3, D + 10, D + 15], T_OUT, at("aber"), 0.22, 0.3, 0.6, 1400)
    padp([D - 12, D - 5, D + 1], at("aber") - 0.05, at("sie", 3), 0.22, 0.6, 0.6, 500)
    pulse(at("aber"), at("malik", 2) - 0.1, 96, 96, 0.35)
    for k, n_ in enumerate((74, 73, 74, 70)):
        place(m, pan(I.glock(I.m2f(n_), 0.22, r, 1.6), -0.2 + 0.15 * k), at("schlüssel") - 0.1 + 0.35 * k, 0.3)
    # water: the series chord rises, resolves on "Es reicht"; false relief in the yard (major, warm)
    padp([D, D + 7, D + 12, D + 16], at("sie", 3), at("reicht"), 0.2, 0.8, 0.4, 900)
    padp([D + 5, D + 12, D + 16, D + 21], at("reicht") - 0.05, at("frau", 4), 0.22, 0.6, 0.8, 1200)
    # the faces: one pluck per name; "Frau Brandt nicht": everything drops to one low note
    for w, n_, p_ in (("jansen", 1, D + 24), ("malik", 3, D + 27), ("familie", 0, D + 31)):
        place(m, pan(I.pluck(I.m2f(p_), 0.4, r, 0.7), 0.1), at(w, n_) - 0.03, 0.4)
    padp([D - 12], at("frau", 4) - 0.05, T_UP, 0.24, 0.1, 0.3, 300)
    # back up: the fast pulse again; her door: drone; the radio: the high note, then the riser into the cut
    pulse(T_UP, T_DOOR, 150, 150, 0.5)
    padp([D + 1, D + 13, D + 14, D + 20], T_DOOR - 0.1, BLACK, 0.22, 0.8, 0.05, 1200)
    padp([D + 31, D + 36], T_ROOM, BLACK, 0.14, 0.4, 0.05, 2600)
    n = ns(BLACK - T_ROOM)
    place(m, st(bp(colored(n, r, 0.4), 300, 5000) * np.linspace(0, 1, n) ** 2.5 * 0.22), T_ROOM, 0.9)
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
        f.write("# Blackout Teil 4 - soundtrack\n\nAll music and SFX synthesized (blackout4_audio.py); voice gain only.\n\n")
        f.write("| metric | value |\n|---|---|\n" + "".join(f"| {k} | {float(x):.2f} |\n" for k, x in stats.items()))
        f.write("\nMusic: low cluster + a high note on 'im neunten'; the series chord; fast pluck under Malik's bike; a rising"
                " drone up the stairwell and a hit on 'Heiß'; heartbeat pulse 80-92; dead stop on 'Nichts'; a warm chord in her"
                " flat and a held note on the radio; a dissonant cluster under Kessler, cut by the slam; heartbeat 84-104 through"
                " the count with a tick on every number, slow heavy beats on 'Ihr Herz'; a bright chord on Jansen's light;"
                " 132-150 bpm + riser into the daylight; open chord outside; low drone under the dry hydrant; the key motif;"
                " the chord resolves on 'Es reicht' (false relief, major); a pluck per face; one low note on 'Frau Brandt"
                " nicht'; fast pulse back up; drone + high note + riser into the cut on 'weg'.\n"
                "SFX: wind, crackle, smoke alarm, murmur; phone taps; bike; running steps and the house door; the chimney"
                " roar; echoing steps; hiss on 'Heiß'; coughs; six knocks; door creak; a ticking clock in her flat; pills;"
                " lock + the generator hum (planted for Teil 7/8) and the slam; a step on every count; Jansen's steps; the"
                " burst outside; two-tone siren and engine; hydrant sputter; the key; water rush + steam; yard murmur;"
                " running back up; her door creaking; the radio's static; timpani + reversed cymbal into the black.\n")


if __name__ == "__main__":
    main()
