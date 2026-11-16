"""Insert original-footage quotes (video + their own audio) into the voice timeline.

usage: python insert_clips.py <video_dir>
reads   <video_dir>/voice/clips.json, voice/words.json and the voice wav named in clips.json
writes  <video_dir>/voice/timeline/words.json   voice words shifted + the clips' caption words ("clip": id)
        <video_dir>/voice/timeline/voice.wav    voice with silent gaps where the clips play (48 kHz mono)
        <video_dir>/voice/timeline/clips_audio.wav  the clips' own audio at their timeline position (-16 LUFS each)
        <video_dir>/voice/timeline/clips.json   ClipInfo list for Remotion (startF, durF, file, labels)
        <video_dir>/voice/timeline/QUELLEN_CLIPS.txt  lines for the video description
        <public_dir>/<id>.mp4                   the cut clip (video only), PAD_S lead-in and lead-out

From then on story.ts, make_audio.py and youtube_meta.py read voice/timeline/* instead of voice/*.

clips.json:
{
  "voice": "voice/aufnahme.wav",
  "public_dir": "B:/Projects/Youtube/shorts-studio/public/clips/l02",
  "public_prefix": "clips/l02",
  "clips": [{
    "id": "altman", "after": "letzte Worte vor dem Clip",      # phrase from words.json (A()-style match)
    "src": "B:/Projects/Youtube/clips-raw/l02/altman.mp4", "in": 83.2, "out": 97.6,   # seconds in the source
    "who": "Sam Altman", "role": "CEO · OpenAI", "event": "Senatsanhörung · 16.5.2023",
    "label": "Firmenangabe · eigene Zahl", "url": "https://www.youtube.com/watch?v=...&t=83",
    "translated": true,
    "subs": [[0.0, 3.2, "Deutsche Untertitelzeile"], [3.2, 7.0, "..."]]   # seconds relative to "in"
  }]
}
Keep quotes short (5-25 s, only what the argument needs), never edit the speaker's words, name the source in the
picture AND in the description (Zitatrecht § 51 UrhG). Raw downloads stay private (outside the repo).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
FPS = 30
PAD_S = 0.5  # video lead-in / lead-out around the quote (fades), = CLIP_PAD_F / 30 in Footage.tsx
GAP_S = 0.35  # silence between voice and clip on each side


def ff(*a):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


def norm(s):
    return re.sub(r"[^\w]", "", s.lower())


def phrase_end(words, phrase):
    p = [norm(t) for t in phrase.split() if norm(t)]
    nw = [norm(w["word"]) for w in words]
    hits = [i for i in range(len(nw) - len(p) + 1) if nw[i:i + len(p)] == p]
    if len(hits) != 1:
        raise SystemExit(f"phrase {'not found' if not hits else 'ambiguous'}: {phrase!r} (make it longer)")
    return words[hits[0] + len(p) - 1]["end"]


def read_mono(path, start=None, end=None):
    tmp = Path(str(path) + ".tmp.wav")
    args = []
    if start is not None:
        args += ["-ss", f"{start:.3f}", "-to", f"{end:.3f}"]
    ff(*args, "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), str(tmp))
    x, _ = sf.read(tmp)
    tmp.unlink()
    return x


def main():
    vd = Path(sys.argv[1]).resolve()
    cfg = json.loads((vd / "voice" / "clips.json").read_text(encoding="utf-8"))
    words = json.loads((vd / "voice" / "words.json").read_text(encoding="utf-8"))
    voice = read_mono(vd / cfg["voice"])
    out = vd / "voice" / "timeline"
    out.mkdir(parents=True, exist_ok=True)
    pub = Path(cfg["public_dir"])
    pub.mkdir(parents=True, exist_ok=True)

    clips = sorted(cfg["clips"], key=lambda c: phrase_end(words, c["after"]))
    segs, clip_aud, infos, cap_words, src_lines = [], [], [], [], []
    cursor, shift = 0.0, 0.0  # cursor in original voice time, shift = total inserted so far
    for c in clips:
        t = phrase_end(words, c["after"]) + 0.12  # a hair after the last word's end
        dur = c["out"] - c["in"]
        if not 2 <= dur <= 40:
            raise SystemExit(f"{c['id']}: clip length {dur:.1f}s - keep quotes 2-40 s")
        gap = GAP_S + dur + GAP_S
        segs.append(voice[int(cursor * SR):int(t * SR)])
        segs.append(np.zeros(int(round(gap * SR))))
        tl_start = t + shift + GAP_S  # timeline second where the clip's first sound plays
        # clip audio, levelled like the voice
        a = read_mono(c["src"], c["in"], c["out"])
        tmp = out / f"_{c['id']}.wav"
        sf.write(tmp, a, SR)
        a = a * 10 ** ((-16 - lufs(tmp)) / 20)
        tmp.unlink()
        clip_aud.append((tl_start, a))
        # clip video: PAD_S before/after, video only, 1920 wide (the frame is 1210 px at 1.33x export = 1613 px)
        lead = min(PAD_S, c["in"])
        vf = "scale=1920:-2,fps=30" + (f",tpad=start_duration={PAD_S - lead:.3f}:start_mode=clone" if lead < PAD_S else "")
        ff("-ss", f"{c['in'] - lead:.3f}", "-to", f"{c['out'] + PAD_S:.3f}", "-i", c["src"], "-an", "-vf", vf, "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", str(pub / f"{c['id']}.mp4"))
        infos.append({
            "id": c["id"], "file": f"{cfg['public_prefix']}/{c['id']}.mp4", "startF": round(tl_start * FPS), "durF": round(dur * FPS),
            "who": c["who"], "role": c["role"], "event": c["event"], "label": c.get("label"), "translated": bool(c.get("translated")),
        })
        for s0, s1, text in c.get("subs", []):
            ws = text.split()
            for k, w in enumerate(ws):
                a0 = tl_start + s0 + (s1 - s0) * k / len(ws)
                cap_words.append({"word": w, "start": round(a0, 3), "end": round(a0 + (s1 - s0) / len(ws), 3), "clip": c["id"]})
        src_lines.append(f"- {c['who']} ({c['role']}), {c['event']}: {c['url']}")
        cursor = t
        shift += gap
    segs.append(voice[int(cursor * SR):])
    tl_voice = np.concatenate(segs)
    total = len(tl_voice) / SR
    ca = np.zeros(len(tl_voice))
    for t0, a in clip_aud:
        i = int(round(t0 * SR))
        ca[i:i + len(a)] += a[: len(ca) - i]
    sf.write(out / "voice.wav", tl_voice, SR, subtype="PCM_24")
    sf.write(out / "clips_audio.wav", ca, SR, subtype="PCM_24")

    # shift voice words after each insertion point
    ins = []  # (orig_time, cumulative shift after it)
    acc = 0.0
    for c in clips:
        acc += GAP_S + (c["out"] - c["in"]) + GAP_S
        ins.append((phrase_end(words, c["after"]) + 0.12, acc))
    tw = []
    for w in words:
        sh = max([s for (t, s) in ins if w["start"] >= t], default=0.0)
        tw.append({**w, "start": round(w["start"] + sh, 3), "end": round(w["end"] + sh, 3)})
    tw = sorted(tw + cap_words, key=lambda w: w["start"])
    (out / "words.json").write_text(json.dumps(tw, ensure_ascii=False, indent=0), encoding="utf-8")
    (out / "clips.json").write_text(json.dumps(infos, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "QUELLEN_CLIPS.txt").write_text("Originalaufnahmen (Zitat, Quelle):\n" + "\n".join(src_lines) + "\n", encoding="utf-8")
    print(f"timeline {total:.2f}s ({len(clips)} clips, +{shift:.2f}s) -> frames = ceil(({total:.2f} + 3) * 30) = {int(np.ceil((total + 3) * FPS))}")


if __name__ == "__main__":
    main()
