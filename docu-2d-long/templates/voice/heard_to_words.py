"""Step 2 for a HUMAN recording: Whisper words (asr_recording.py) -> clean words.json for captions and cues.

Usage: python heard_to_words.py heard.json fixes.json words.json

- glues Whisper's split pieces back together ("KI" "-Revolution" -> "KI-Revolution", "9" ".000" -> "9.000")
- fixes.json: {"Chachipiti": "ChatGPT", "IRB": "IAB", "Vor Vor": "Vor"} (case-sensitive, after glueing).
  A key with a space replaces a word sequence; an empty value deletes it. Fix ASR mishearings only,
  never the speaker's wording: captions must show what was really said.
"""
import json
import re
import sys
from pathlib import Path

heard = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
fixes = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))

ws = []
for w in heard:
    t = w["word"].strip()
    if ws and re.match(r"^(-\w|[.,]\d|%)", t):
        ws[-1]["word"] += t
        ws[-1]["end"] = w["end"]
    elif ws and t == "-":
        ws[-1]["word"] += "-"
    else:
        ws.append({"word": t, "start": w["start"], "end": w["end"]})

for k, v in sorted(fixes.items(), key=lambda kv: -len(kv[0].split())):
    ks, vs = k.split(), v.split()
    i, out = 0, []
    while i < len(ws):
        if [x["word"] for x in ws[i:i + len(ks)]] == ks:
            grp = ws[i:i + len(ks)]
            if vs:
                n = len(vs)
                a, b = grp[0]["start"], grp[-1]["end"]
                for j, s in enumerate(vs):
                    out.append({"word": s, "start": round(a + (b - a) * j / n, 3), "end": round(a + (b - a) * (j + 1) / n, 3)})
            i += len(ks)
        else:
            out.append(ws[i])
            i += 1
    ws = out

Path(sys.argv[3]).write_text(json.dumps(ws, ensure_ascii=False, indent=0), encoding="utf-8")
print(f"{len(ws)} words -> {sys.argv[3]}")
