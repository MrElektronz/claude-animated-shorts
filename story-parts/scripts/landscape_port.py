"""Port a copy of the portrait cartoon-3d template (templates/bridge or a finished short) to 16:9 landscape.

usage: python landscape_port.py <studio>/src/videos/<name>_p01

Every pixel-sized parameter in the template is written "at 1080x1920" and scaled with output height / 1920. In
landscape the short side is the height, so the scale becomes height / 1080: ink widths, card rims, lens blur,
grain and the bloom MIP chain keep the same size relative to the short side (5.1 px ink at 1080 short side stays
5.1 px). The canvas becomes 1920x1080. Values in story.ts (cInf etc.) keep their numbers, now meaning
"px at 1920x1080". Camera fov stays VERTICAL in three.js: see SKILL.md "16:9 framing" for new fov values.
Idempotent: a second run changes nothing.
"""
import sys
from pathlib import Path

EDITS = {
    "Bridge.tsx": [
        ("<ThreeCanvas width={1080} height={1920}", "<ThreeCanvas width={1920} height={1080}"),
        ("setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920)", "setSize(Math.round((1080 * w) / Math.max(h, 1)), 1080)"),
    ],
    "cast.ts": [("(rt ? rt.height : r.domElement.height) / 1920", "(rt ? rt.height : r.domElement.height) / 1080")],
    "ink.ts": [("pxScale.value = height / 1920", "pxScale.value = height / 1080")],
    "lensblur.ts": [
        ("float s = resolution.y / 1920.0;", "float s = resolution.y / 1080.0;"),
        ("cellPx * resolution.y / 1920.0", "cellPx * resolution.y / 1080.0"),
    ],
}
MARK = "// LANDSCAPE 16:9: pixel sizes are px at 1920x1080 (scale = height / 1080), see story-parts/scripts/landscape_port.py\n"


def main(folder: str) -> None:
    d = Path(folder)
    for fn, pairs in EDITS.items():
        p = d / fn
        s = p.read_text(encoding="utf-8")
        for a, b in pairs:
            if b in s:
                continue
            if a not in s:
                sys.exit(f"{fn}: pattern not found (template changed?): {a}")
            s = s.replace(a, b)
        if MARK not in s:
            s = MARK + s
        p.write_text(s, encoding="utf-8")
        print(f"ported {fn}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
