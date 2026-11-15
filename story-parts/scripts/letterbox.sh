#!/usr/bin/env bash
# 16:9 master -> 9:16 short with black bars top and bottom (picture unchanged, centred, no crop).
# usage: bash letterbox.sh <video_16x9.mp4> <short.mp4> [width=1440]
#   1440 -> 1440x2560 short, picture 1440x810 at y=875 (2K master 2560x1440 is downscaled with lanczos)
#   1080 -> 1080x1920 short, picture 1080x608 at y=656 (for drafts)
set -eu
IN=$1; OUT=$2; W=${3:-1440}
H=$((W * 16 / 9)); PH=$(( (W * 9 / 16) / 2 * 2 )); Y=$(( (H - PH) / 2 ))
command -v ffmpeg >/dev/null || export PATH="$PATH:/c/Users/KBeck/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"
ffmpeg -v error -y -i "$IN" \
  -vf "scale=${W}:${PH}:flags=lanczos,pad=${W}:${H}:0:${Y}:black,setsar=1" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT"
echo "short ${W}x${H} (picture ${W}x${PH} at y=${Y}) -> $OUT"
