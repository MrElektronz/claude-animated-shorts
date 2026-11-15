"""ElevenLabs voice-over with word timings.

Usage:
  python elevenlabs_tts.py voices                 # list voices on the account (name, id, labels)
  python elevenlabs_tts.py say <voice_id> [take]  # render script_tts.txt -> take_<n>.mp3 + words_<n>.json

Reads the key from the environment variable ELEVENLABS_API_KEY (never from a file in the repo).
Uses the /with-timestamps endpoint, so word timings come straight from ElevenLabs' character alignment.
"""
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_multilingual_v2"
# One steady, dry narrator tone: high stability, no style exaggeration.
SETTINGS = {"stability": 0.6, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True,
            "speed": float(os.environ.get("TTS_SPEED", "1.0"))}


def key() -> str:
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        sys.exit("ELEVENLABS_API_KEY is not set.")
    return k


def call(path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": key(), "Content-Type": "application/json"},
        method="POST" if body is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode(errors='replace')}")


def list_voices() -> None:
    for v in call("/voices")["voices"]:
        labels = ", ".join(f"{k}={val}" for k, val in (v.get("labels") or {}).items())
        print(f"{v['name']:<28} {v['voice_id']}  [{v.get('category', '')}] {labels}")


def words_from_alignment(al: dict) -> list[dict]:
    chars, starts, ends = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur, t0, t1 = [], "", None, None
    for c, s, e in zip(chars, starts, ends):
        if c.isspace():
            if cur:
                words.append({"word": cur, "start": round(t0, 3), "end": round(t1, 3)})
            cur, t0 = "", None
            continue
        if t0 is None:
            t0 = s
        cur += c
        t1 = e
    if cur:
        words.append({"word": cur, "start": round(t0, 3), "end": round(t1, 3)})
    return words


def say(voice_id: str, take: str, lines: int = 0) -> None:
    text = (HERE / "script_tts.txt").read_text(encoding="utf-8").strip()
    if lines:
        text = "\n".join(text.splitlines()[:lines])
    # Lines become paragraphs: a newline gives ElevenLabs a natural sentence pause.
    res = call(
        f"/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
        {"text": text, "model_id": MODEL, "voice_settings": SETTINGS, "language_code": "de"},
    )
    mp3 = HERE / f"take_{take}.mp3"
    mp3.write_bytes(base64.b64decode(res["audio_base64"]))
    words = words_from_alignment(res["alignment"])
    (HERE / f"words_{take}.json").write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{mp3.name}: {len(words)} words, ends at {words[-1]['end']:.2f} s")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "voices":
        list_voices()
    elif len(sys.argv) >= 3 and sys.argv[1] == "say":
        say(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "1", int(sys.argv[4]) if len(sys.argv) > 4 else 0)
    else:
        sys.exit(__doc__)
