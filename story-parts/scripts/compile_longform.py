"""Join the 16:9 masters of a season into one YouTube long-form video plus chapter list.

usage: python compile_longform.py <out.mp4> <part1.mp4>[@trim][=Title] <part2.mp4>[@trim][=Title] ...
  @trim  seconds cut from the start of that part (the one-sentence recap, RECAP_END in the part's story.ts;
         the cold-open line before it goes too, so start the cut at a hard cut in the shot plan)
  =Title chapter title (default "Teil N")
example:
  python compile_longform.py longform.mp4 p01/video.mp4=Erwachen p02/video.mp4@5.4=Das Treppenhaus
Writes <out>.mp4 (re-encoded, crf 18) and chapters.txt next to it (paste into the YouTube description; YouTube
needs the first chapter at 0:00, at least 3 chapters, each >= 10 s). Trimmed audio gets a 0.12 s fade-in so the
cut never clicks.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

FF_DIR = "C:/Users/KBeck/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"


def tool(name: str) -> str:
    return shutil.which(name) or os.path.join(FF_DIR, name + ".exe")


def duration(p: str) -> float:
    out = subprocess.run([tool("ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def parse(arg: str, n: int) -> tuple[str, float, str]:
    title = f"Teil {n}"
    if "=" in arg:
        arg, title = arg.split("=", 1)
        title = f"Teil {n}: {title}"
    trim = 0.0
    if "@" in arg:
        arg, t = arg.rsplit("@", 1)
        trim = float(t)
    return arg, trim, title


def stamp(t: float) -> str:
    t = int(round(t))
    return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else f"{t // 60}:{t % 60:02d}"


def main(out: str, args: list[str]) -> None:
    parts = [parse(a, i + 1) for i, a in enumerate(args)]
    cmd, chains, labels, chapters, t = [tool("ffmpeg"), "-v", "error", "-y"], [], "", [], 0.0
    for i, (p, trim, title) in enumerate(parts):
        cmd += ["-i", p]
        fade = f",afade=t=in:d=0.12" if trim > 0 else ""
        chains.append(f"[{i}:v]trim=start={trim},setpts=PTS-STARTPTS,fps=30,format=yuv420p[v{i}]")
        chains.append(f"[{i}:a]atrim=start={trim},asetpts=PTS-STARTPTS,aresample=48000{fade}[a{i}]")
        labels += f"[v{i}][a{i}]"
        chapters.append(f"{stamp(t)} {title}")
        t += duration(p) - trim
    chains.append(f"{labels}concat=n={len(parts)}:v=1:a=1[v][a]")
    cmd += ["-filter_complex", ";".join(chains), "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18",
            "-preset", "slow", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    ch = Path(out).with_name("chapters.txt")
    ch.write_text("\n".join(chapters) + "\n", encoding="utf-8")
    print(f"{out}: {stamp(t)} total, {len(parts)} parts\n" + "\n".join(chapters))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
