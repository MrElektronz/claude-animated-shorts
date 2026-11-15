"""ElevenLabs voice-over with word timings for story-parts series.

Usage (run inside series/<nn-name>/part-NN/voice/):
  python elevenlabs_tts.py say [take] [voice_id]     # script_tts.txt -> take_<n>.mp3 + words_<n>.json
  python elevenlabs_tts.py align <audio> [take]      # audio made in the ElevenLabs web app + script_tts.txt
                                                     #   -> words_<n>.json (forced alignment)
  python elevenlabs_tts.py voices                    # list voices on the account (needs voices_read)

Default voice: the series narrator Gvd9RXquQXWjTYwBivjq (a library voice). Library voices need a paid
ElevenLabs plan for API text-to-speech (free plan: HTTP 402 "paid_plan_required"). Without one, generate the
take in the web app with the same voice and settings, save it next to this script, then run `align`.

Reads the key from the environment variable ELEVENLABS_API_KEY (never from a file in the repo). On Windows the
key is a User variable, so in PowerShell first run:
  $env:ELEVENLABS_API_KEY = [Environment]::GetEnvironmentVariable('ELEVENLABS_API_KEY','User')
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

HERE = Path.cwd()
API = "https://api.elevenlabs.io/v1"
VOICE = "Gvd9RXquQXWjTYwBivjq"
MODEL = "eleven_multilingual_v2"
# Tense but steady narrator: a little less stability than the history shorts so fear and relief can colour the
# lines, still no style exaggeration (style > 0 makes takes drift between parts).
SETTINGS = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True,
            "speed": float(os.environ.get("TTS_SPEED", "1.0"))}


def key() -> str:
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        sys.exit("ELEVENLABS_API_KEY is not set (see the docstring for PowerShell).")
    return k


def request(path: str, data: bytes | None, ctype: str | None) -> dict:
    headers = {"xi-api-key": key()}
    if ctype:
        headers["Content-Type"] = ctype
    req = urllib.request.Request(API + path, data=data, headers=headers, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        if e.code == 402 and "paid_plan_required" in body:
            sys.exit("HTTP 402: this library voice needs a paid ElevenLabs plan for API speech.\n"
                     "Make the take in the web app (same voice and settings), save it here and run:\n"
                     "  python elevenlabs_tts.py align <file.mp3> [take]")
        sys.exit(f"HTTP {e.code}: {body}")


def call(path: str, body: dict | None = None) -> dict:
    return request(path, json.dumps(body).encode() if body is not None else None, "application/json")


def script_text() -> str:
    return (HERE / "script_tts.txt").read_text(encoding="utf-8").strip()


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


def save_words(take: str, words: list[dict]) -> None:
    (HERE / f"words_{take}.json").write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"words_{take}.json: {len(words)} words, ends at {words[-1]['end']:.2f} s")


def say(take: str, voice_id: str) -> None:
    # Lines become paragraphs: a newline gives ElevenLabs a natural sentence pause.
    res = call(f"/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
               {"text": script_text(), "model_id": MODEL, "voice_settings": SETTINGS, "language_code": "de"})
    (HERE / f"take_{take}.mp3").write_bytes(base64.b64decode(res["audio_base64"]))
    save_words(take, words_from_alignment(res["alignment"]))


def align(audio: str, take: str) -> None:
    """Forced alignment of an existing take against script_tts.txt (works on the free plan)."""
    p = Path(audio)
    b = uuid.uuid4().hex
    parts = [
        f"--{b}\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\n".encode() + script_text().encode() + b"\r\n",
        f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{p.name}\"\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n".encode() + p.read_bytes() + b"\r\n",
        f"--{b}--\r\n".encode(),
    ]
    res = request("/forced-alignment", b"".join(parts), f"multipart/form-data; boundary={b}")
    words = [{"word": w["text"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
             for w in res["words"] if w["text"].strip()]
    save_words(take, words)


def list_voices() -> None:
    for v in call("/voices")["voices"]:
        labels = ", ".join(f"{k}={val}" for k, val in (v.get("labels") or {}).items())
        print(f"{v['name']:<28} {v['voice_id']}  [{v.get('category', '')}] {labels}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["voices"]:
        list_voices()
    elif a[:1] == ["say"]:
        say(a[1] if len(a) > 1 else "1", a[2] if len(a) > 2 else VOICE)
    elif a[:1] == ["align"] and len(a) >= 2:
        align(a[1], a[2] if len(a) > 2 else "1")
    else:
        sys.exit(__doc__)
