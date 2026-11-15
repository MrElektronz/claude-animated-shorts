# Lokale Stimme: Qwen3-TTS (eingerichtet 2026-11-15)

Die Kanalstimme ist ein **lokaler Klon der Nutzerstimme**. Kein ElevenLabs, keine Cloud, die Stimme bleibt auf dem PC.
ElevenLabs bleibt nur für die Shorts-Skills.

## Warum Qwen3-TTS (Stand Nov 2026)
| Modell | Deutsch | Lizenz | Urteil |
|---|---|---|---|
| **Qwen3-TTS 1.7B-Base** (Jan 2026) | offiziell (10 Sprachen) | Apache-2.0 | **gewählt**: Klon aus ~13 s Referenz, feinjustierbar |
| VoxCPM2 | ja (30 Sprachen) | Apache-2.0 | Alternative, kein belastbarer Deutsch-Vergleich; bei Bedarf A/B testen |
| Voxtral TTS (Mistral) | ja | CC BY-NC 4.0 | **nicht nutzbar**: monetarisierter Kanal = kommerziell |
| Chatterbox | ja | MIT | laut Quellen nicht mehr gepflegt |

## Installation (alles auf B:, C: ist voll)
```
B:/Projects/Youtube/tts/
  qwen-venv/   Python 3.12 venv: torch 2.11+cu128 (RTX 5060 Ti = sm_120 braucht CUDA >= 12.8), qwen-tts 0.1.1, soundfile
  hf/          HF_HOME: Qwen/Qwen3-TTS-12Hz-1.7B-Base (~4 GB) + openai/whisper-large-v3-turbo
  voices/<profil>/ref.wav + ref.txt
  tmp/         TEMP/TMP für alle Läufe
```
Neu aufsetzen:
```bash
cd /b/Projects/Youtube/tts && python -m venv qwen-venv
export PIP_CACHE_DIR=B:/Projects/Youtube/tts/pipcache TEMP=B:/Projects/Youtube/tts/tmp TMP=B:/Projects/Youtube/tts/tmp
./qwen-venv/Scripts/python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
./qwen-venv/Scripts/python -m pip install -U qwen-tts soundfile
```
**Vor jedem Lauf** setzen: `export HF_HOME=B:/Projects/Youtube/tts/hf TEMP=B:/Projects/Youtube/tts/tmp TMP=B:/Projects/Youtube/tts/tmp PYTHONIOENCODING=utf-8`
und ffmpeg in den PATH (siehe SKILL.md). Ohne `TEMP` landen pip-/Modell-Zwischendateien auf C: (2 GB beim ersten Setup).
Warnungen „SoX could not be found“ und „flash-attn is not installed“ sind harmlos.

## Kanalprofil
- **`voices/kanal_dynamisch2`** = Kanalstimme (Nutzer-Wahl 2026-11-15: „am interessantesten“).
- `kanal_monoton1` klingt am ähnlichsten, ist aber zu ruhig (eher Gute-Nacht-Geschichten). `kanal_dynamisch1` = Reserve.
- Rohaufnahmen: `voices/kanal/*.wav` (44,1 kHz, ~13 s, Text unten).
- Profil anlegen: Stille abschneiden, auf -18 LUFS normalisieren, 24 kHz mono → `ref.wav`; den exakt gesprochenen Text
  (Zahlen ausgeschrieben) → `ref.txt`. Mit Whisper prüfen, dass Aufnahme und Text Wort für Wort übereinstimmen.
- Referenztext: „Stell dir einen Pegel vor, wie am Rhein. Nur misst er kein Wasser, sondern Arbeit. Null Prozent heißt:
  Keine Maschine kann irgendetwas davon. Hundert Prozent heißt: alles. Das klingt einfach. Aber die Zahlen dahinter sind
  überraschend.“
- Die **Stimmung der Referenz bestimmt die Stimmung des ganzen Videos**: lebendig erklärend aufnehmen, nicht vorlesen.

## Pipeline (Skripte in `templates/voice/`)
1. **Text pro Kapitel** `voice/text/k01_coldopen.txt`, `k02_frage.txt` … (Dateiname = Kapitelname).
   - Leerzeile = Absatz = längere Pause und mögliche Naht. Absätze ≤ 700 Zeichen halten.
   - Zahlen/Abkürzungen als `[[Anzeige|gesprochen]]`: `[[2027|zweitausendsiebenundzwanzig]]`, `[[IAB|I A B]]`,
     `[[−14 %|minus vierzehn Prozent]]`. Die Anzeige geht in Untertitel und .srt (`show` in words.json).
   - `#` am Zeilenanfang = Kommentar.
2. **Stimme erzeugen** (Modell lädt einmal für alle Kapitel):
   `python qwen_say.py voices/kanal_dynamisch2 <video>/voice/takes <video>/voice/text/*.txt`
   → `takes/<kapitel>/c_XXX.wav` (roh), `take.wav` (48 kHz), `take.json`.
3. **Einzelne Abschnitte neu** (Versprecher, falsche Betonung): `--only k03_messgeraet:2 --seed 11`. Nur dieser Abschnitt
   wird neu erzeugt, take.wav neu zusammengesetzt.
4. **Wortzeiten**: `python align_words.py <video>/voice/takes/k01_* ... --out <video>/voice/words.json`
   → `words.json` (+ `show`), `voice.wav` (alle Kapitel, 0,9 s Pause dazwischen), `align_report.txt`.
   Abschnitte mit Score < 0,85 im Report anhören und mit `--only` neu erzeugen.
5. Probehören an den Nutzer schicken (SendUserFile), erst dann Bild/Ton darauf bauen.

## Nähte (gemessen und behoben)
Erste Tests hatten hörbare Übergänge zwischen den Abschnitten. Ursachen und Gegenmittel (alle in `qwen_say.py`):
| Problem (gemessen) | Gegenmittel |
|---|---|
| Pausen = digitale Stille, Stimme hat -54 dB Grundrauschen → „Loch“ | Pausen mit Raumklang auf Höhe des Stimm-Grundrauschens, 20 ms Überblendung |
| Qwen schneidet das letzte Phonem ab (v. a. Fragen, letzte 50 ms bei -23 dB) | jedem Abschnitt „ …“ anhängen; Ende lauter als -45 dB → automatisch neuer Seed (max. 3) |
| Tempo je Abschnitt 2,6-3,3 Wörter/s (±24 %) | auf den Median ziehen, tonhöhenneutral (ffmpeg atempo), max ±10 % |
| Lautheit ±1,5 dB | jeden Abschnitt auf den Median-Sprachpegel |
| viele kleine Nähte | Abschnitt = ganzer Absatz (≤ 700 Zeichen) statt 260 Zeichen |

## Leistung (RTX 5060 Ti 16 GB, bf16, sdpa)
- Modell + Stimme laden: ~10 s. Erzeugung: **~5 s Rechenzeit pro 1 s Audio** → ~45-50 min für 9 min Video.
- Über Nacht oder im Hintergrund laufen lassen (`run_in_background`), Kapitel für Kapitel.
- Offene Optimierung: FlashAttention-2 für Windows/Blackwell, `torch.compile`, 0.6B-Modell für Entwürfe (`--model 0.6B`).

## Kennzeichnung
Beim Upload „veränderte oder synthetische Inhalte“ anhaken; im Video sagt die Stimme selbst, dass sie ein KI-Klon ist.
