"""Shared text handling for the local voice pipeline (qwen_say.py, align_words.py).

Script markup in chapter files (kapitel_XX.txt):
  - paragraphs are separated by a blank line (longer pause)
  - [[shown|spoken]]  -> TTS says "spoken", captions/.srt show "shown"
      e.g. [[2027|zweitausendsiebenundzwanzig]], [[IAB|I A B]], [[−14 %|minus vierzehn Prozent]]
  - lines starting with # are comments
"""
import re

MARK = re.compile(r"\[\[([^|\]]*)\|([^\]]*)\]\]")


def paragraphs(raw: str) -> list[str]:
    lines = [l for l in raw.splitlines() if not l.lstrip().startswith("#")]
    text = "\n".join(lines)
    return [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def spoken(s: str) -> str:
    return MARK.sub(lambda m: m.group(2), s)


def tokens(s: str) -> list[dict]:
    """Word tokens of a marked-up string: [{'word': spoken word, 'show': display text or None}].
    A [[shown|spoken]] group with several spoken words puts `show` on the first word and "" on the rest."""
    out, pos = [], 0
    for m in MARK.finditer(s):
        out += [{"word": w, "show": None} for w in s[pos:m.start()].split()]
        sp = m.group(2).split()
        for i, w in enumerate(sp):
            out.append({"word": w, "show": m.group(1) if i == 0 else ""})
        pos = m.end()
    out += [{"word": w, "show": None} for w in s[pos:].split()]
    # punctuation glued to a marked group ("[[2027|…]].") belongs to the shown text too
    for i, t in enumerate(out):
        if t["show"] is None and re.fullmatch(r"[.,;:!?…»«„“”)]+", t["word"]) and i:
            out[i - 1]["word"] += t["word"]
            if out[i - 1]["show"]:
                out[i - 1]["show"] += t["word"]
            t["drop"] = True
    return [t for t in out if not t.get("drop")]


def sentences(p: str) -> list[str]:
    parts = re.split(r"(?<=[.!?…])\s+(?=[A-ZÄÖÜ„\[\d])", p)
    return [x.strip() for x in parts if x.strip()]


def chunks(p: str, max_chars: int = 260) -> list[str]:
    """Group sentences of one paragraph into chunks of <= max_chars spoken characters (stable prosody, fewer slips)."""
    out, cur = [], ""
    for s in sentences(p):
        if cur and len(spoken(cur + " " + s)) > max_chars:
            out.append(cur)
            cur = s
        else:
            cur = (cur + " " + s).strip()
    if cur:
        out.append(cur)
    return out


def norm(w: str) -> str:
    return re.sub(r"[^\wäöüß]", "", w.lower())
