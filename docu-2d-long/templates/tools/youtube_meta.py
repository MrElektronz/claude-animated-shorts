"""YouTube upload files from the voice timings.

Usage: python youtube_meta.py voice/words.json CHAPTERS.json out_dir

CHAPTERS.json: [{"word": "Warum", "n": 1, "title": "Warum altern wir?"}, {"phrase": "Platz 10 Komponistinnen", "title": "..."}]
  - the chapter starts at the n-th occurrence of `word` (same rule as `at()` in anim.ts),
    or at the first occurrence of a multi-word `phrase` (same rule as `A()` in a video's story.ts)
  - the first chapter is forced to 0:00 (YouTube requires it), each chapter must be >= 10 s

Writes:
  out_dir/untertitel.srt   sentence chunks (same chunking as the burned-in captions)
  out_dir/kapitel.txt      "0:00 Titel" lines for the description
"""
import json
import re
import sys
from pathlib import Path


def norm(s: str) -> str:
    return re.sub(r"[^\w]", "", s.lower())


def chunks(words, max_words=7, max_chars=44):
    """Same rule as chunkWords() in Text.tsx. Uses `show` (caption spelling) when a word has one."""
    words = [dict(w, word=w.get("show", w["word"])) for w in words]
    out, cur = [], []

    def flush():
        if cur:
            out.append((" ".join(w["word"] for w in cur if w["word"]), cur[0]["start"], cur[-1]["end"]))
        cur.clear()

    for w in words:
        if len(cur) >= max_words or len(" ".join(x["word"] for x in cur)) + len(w["word"]) + 1 > max_chars:
            flush()
        cur.append(w)
        if re.search(r"[.!?:;]$", w["word"]) or (w["word"].endswith(",") and len(cur) >= 3):
            flush()
    flush()
    return out


def ts(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    words = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    chapters = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    out = Path(sys.argv[3])
    out.mkdir(parents=True, exist_ok=True)

    cs = chunks(words)
    srt = []
    for i, (text, a, b) in enumerate(cs, 1):
        nxt = cs[i][1] if i < len(cs) else b + 0.6
        srt.append(f"{i}\n{ts(a)} --> {ts(min(b + 0.5, nxt - 0.05))}\n{text}\n")
    (out / "untertitel.srt").write_text("\n".join(srt), encoding="utf-8")

    lines, last = [], -999.0
    for k, c in enumerate(chapters):
        if "phrase" in c:
            p = [norm(x) for x in c["phrase"].split() if norm(x)]
            nw = [norm(w["word"]) for w in words]
            hits = [words[i]["start"] for i in range(len(nw)) if nw[i:i + len(p)] == p]
            n = 1
        else:
            hits = [w["start"] for w in words if norm(w["word"]) == norm(c["word"])]
            n = c.get("n", 1)
        if len(hits) < n:
            sys.exit(f'chapter anchor {c.get("phrase") or c.get("word")} #{n} not found')
        t = 0.0 if k == 0 else hits[n - 1]
        if t - last < 10:
            sys.exit(f'chapter "{c["title"]}" is < 10 s after the previous one')
        last = t
        lines.append(f"{int(t // 60)}:{int(t % 60):02d} {c['title']}")
    (out / "kapitel.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(cs)} subtitle chunks, {len(lines)} chapters -> {out}")


if __name__ == "__main__":
    main()
