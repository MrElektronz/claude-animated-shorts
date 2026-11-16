---
name: docu-2d-long
description: Make a 7-12 min German long-form 2D documentary explainer (16:9) about AI and the future in the "night-navy world" look - navy night places (starry sky, mountains, cities with lit windows, parallax depth) instead of slides, ONE hot gold/orange emissive focus object per frame that lights the scene, a Leitmotiv that measures the topic, faceless silhouette figures with an orange-coated "Du" figure, self-drawing infographic lines (cream = human, glowing cyan = AI), serif numbers with a source under every figure, original-footage quotes (real clip + audio, framed, source lower-third), burned-in captions, the user's own recorded voice, ambient music bed at -14 LUFS - built as SVG/React in Remotion. Use when the user wants a long-form video, a "Longform", a 10-minute video, a YouTube documentary/explainer, "wie The-Good-Takeoff-Stil", "docu skill", or a video that can carry mid-roll ads.
---

# Longform-Doku 2D (Remotion, SVG)

Schwester-Skill von `cartoon-3d-short` (das Repo-Wurzelverzeichnis). Gleicher Werkzeugkasten (ElevenLabs-Stimme,
words.json, Remotion-Studio, Mix, QA), aber anderes Format, andere Skriptlogik und ein reiner 2D-Look ohne three.js.

Wissensquellen (vor jedem Video lesen):
- `references/SCRIPT_FORMULA.md` – Bauplan, Satz-Werkzeuge, Checkliste.
- `references/STYLE_BIBLE.md` – gemessene Farben, Typo, Licht, Kamera, Ton, Thumbnails.
- `references/KANAL_LONG.md` – Zielgruppe, Säulen, Ideen-Speicher.
- `references/VOICE_LOCAL.md` – lokale Stimme (Qwen3-TTS): Setup, Profil, Befehle, Nähte.
- `references/demo_look_v2.jpg` (Szene), `references/demo_footage_v2.jpg` (Originalaufnahme), `demo_thumb_l01_v2.jpg` –
  aktueller Look-Stand (Komposition `LookV2`, Vorlage `templates/remotion/videos/look-v2/`). `demo_look_v1.jpg` ist
  der alte, zu blaue Stand von L01 – nicht mehr so bauen.

Referenzmaterial (privat, außerhalb des Repos): `B:/Projects/Youtube/docu-ref-raw/` (6 Videos 720p, 12 Transkripte,
Kontaktbögen alle 5 s, Vollbilder, Thumbnails, measure.json).
- Nur zum Studieren. Nie hochladen, nie ins Repo, nie versenden.
- Nie ihre Skripte, Leitmotive, Figuren oder ihren Missionssatz übernehmen. Kanalname nie nennen.

## Nutzer-Regeln
- Deutsch, duzen. Stimme: **der Nutzer spricht selbst ein** (Standard seit L01: „gibt dem Video mehr Qualität“).
  Lokaler Qwen3-TTS-Klon (Profil `kanal_dynamisch2`) nur als Notlösung/Probe. Kein ElevenLabs für Longform.
- Alles Große auf B: (Modelle, venv, TEMP). C: ist fast voll.
- **Untertitel eingebrannt** (`Captions` aus words.json) und zusätzlich `untertitel.srt` für YouTube.
- **Echte Aussagen als Originalaufnahme** (Video + Ton, `FootageQuote`), wo es eine gibt; sonst `QuoteCard`.
  Zitatrecht § 51 UrhG: der Clip belegt eine Aussage, über die wir sprechen (nicht Deko), nur so lang wie nötig
  (5-25 s, max. 2-3 pro Video), unverändert, Quelle im Bild (Name, Rolle, Anlass, Datum) **und** mit Link + Zeitmarke in
  der Beschreibung. Bevorzugt: CC-BY-Material, Pressematerial/Mediatheken von Parlamenten und Behörden, Konferenz-
  Mitschnitte. Rohdateien privat unter `B:/Projects/Youtube/clips-raw/<video>/`, nie ins Repo. Content-ID-Ansprüche
  sind trotzdem möglich – dem Nutzer vor dem Upload sagen, welche Clips drin sind.
- Jede Zahl im Bild trägt ihre Quelle. Firmenangaben, Schätzungen, Tierversuche als solche benennen.
- **Ort statt Folie, Licht statt Blau** (Nutzer-Feedback L01): jede Einstellung ist ein Ort mit Hintergrund und genau
  einem warm leuchtenden Fokus-Objekt. Regeln und Messwerte in STYLE_BIBLE („Kontrast-Regel“, „Ort statt Folie“);
  geprüft mit `templates/analysis/warm_qa.py`.
- Mix: Stimme oben, Musik ~8 dB darunter, SFX leise; Master -14 LUFS integriert, True Peak ≤ -1 dBTP.
- Export 2560×1440: `--scale 1.3333333333333333` (exakt, sonst verweigert Remotion das Zusammenfügen).
- Opus max verifiziert jeden Look-Check. Nach jedem Schritt speichern.
- Skript braucht die Freigabe des Nutzers; danach „einfach machen“.

## Pipeline
Projektordner: `videos/<nn-name>/` in diesem Repo (Skript, Quellen, Stimme, Audio). Code: `src/videos/<name>/` im
Studio `B:/Projects/Youtube/shorts-studio`.

1. **Thema und These.** Aus `KANAL_LONG.md` wählen. Muss erfüllen: betrifft den Zuschauer persönlich in Deutschland;
   hat **eine messbare Größe**, die sich bewegt (→ Leitmotiv); hat einen Nachrichten-Anlass < 3 Monate; hat eine echte
   Gegenstimme. Format wählen (Frage-Doku / Tag in der Zukunft / Ranking / Linie).
2. **Recherche → `SOURCES.md`.** Jede Zahl mit Link, Datum, Art (gemessen / Schätzung / Firmenangabe). Zitate wörtlich.
   Mit WebSearch arbeiten, Primärquellen bevorzugen (Destatis, IAB, Studien, Firmen-Originalmeldung). Unsicheres streichen.
   **Clip-Kandidaten** gleich mitsuchen (Abschnitt `## Originalaufnahmen` in SOURCES.md): wer sagt es, Video-URL,
   Zeitmarke in/out, wörtlicher Satz, Lizenz/Herkunft, warum der Clip eine Aussage belegt. 1-3 starke reichen.
3. **Gliederung → `OUTLINE.md`.** Die 10 Blöcke aus SCRIPT_FORMULA.md mit Zielzeiten, die 3-5 Kapitel-Fragen und eine
   Skizze des Leitmotivs mit seinen Zuständen (Anfang, Problem, Wendung, Ende).
4. **Skript → `SCRIPT.md`** aus `templates/script/SCRIPT_TEMPLATE.md`. 1.150-1.400 Wörter. Checkliste abhaken.
   Clips als eigene Zeile `[CLIP altman: „wörtliches Zitat“ – 14 s]` direkt nach dem Satz, der ihn ankündigt. Der
   Nutzer spricht einfach weiter (keine Pause nötig), die Lücke setzt `insert_clips.py` später ein.
   Zu jedem Absatz eine Zeile **Bild:** (Ort, Fokus-Objekt, was leuchtet auf) – der Bildplan entsteht mit dem Text.
   **Freigabe durch den Nutzer abwarten.**
5. **Stimme** (`voice/`): **Standard = eigene Aufnahme des Nutzers** (siehe unten). Nur als Probe/Notlösung lokal
   mit Qwen3-TTS (Klon der Nutzerstimme, Profil `kanal_dynamisch2`, Details in `references/VOICE_LOCAL.md`):
   - Kapiteltexte nach `voice/text/kXX_<name>.txt`, Zahlen als `[[2027|zweitausendsiebenundzwanzig]]`.
   - `templates/voice/qwen_say.py` → Takes pro Kapitel; `templates/voice/align_words.py` → `words.json` + `voice.wav`.
   - Abschnitte mit Score < 0,85 oder hörbaren Fehlern mit `--only <kapitel>:<i> --seed <n>` neu erzeugen.
   - Probehören an den Nutzer schicken, bevor Bild und Ton darauf gebaut werden.
   - **Eigene Aufnahme des Nutzers** (Standard; L01 so gemacht): wav nach `voice/` (gitignored, privat), dann
     `templates/voice/asr_recording.py <wav> voice/heard.json` (Whisper, Wortzeiten) und
     `templates/voice/heard_to_words.py voice/heard.json voice/fixes.json voice/words.json`. `fixes.json` korrigiert nur
     Hörfehler von Whisper (Namen, Fachwörter), nie den Wortlaut: Untertitel zeigen, was wirklich gesagt wurde.
     Abweichungen vom Skript sind normal – Bild-Anker deshalb immer aus words.json, nie aus SCRIPT.md.
   - **Originalaufnahmen einsetzen** (falls Clips): Rohclip nach `B:/Projects/Youtube/clips-raw/<video>/`
     (`python -m yt_dlp --js-runtimes node -f "bv*[height<=1080]+ba" ...`, eigener leerer Ordner), dann
     `voice/clips.json` (Format im Kopf von `templates/voice/insert_clips.py`: `after`-Phrase, in/out, Name, Rolle,
     Anlass, Label, URL, deutsche Untertitel `subs`) und `python templates/voice/insert_clips.py videos/<nn-name>`.
     Ergebnis `voice/timeline/` (words.json, voice.wav mit Lücken, clips_audio.wav, clips.json, QUELLEN_CLIPS.txt) und
     die geschnittenen Clips unter `public/clips/<video>/`. **Ab hier lesen story.ts, make_audio.py und
     youtube_meta.py `voice/timeline/`.** Die Gesamtlänge (und damit die Frame-Zahl) gibt das Skript aus.
6. **Bildplan → `story.ts`.** Anker sind **gesprochene Phrasen**: `A("Platz 10 Komponistinnen", after)` sucht die
   Wortfolge in words.json (ab Frame `after`) und wirft beim Import, wenn sie fehlt → Bild und Wort können nicht
   auseinanderlaufen. Vorlage: `templates/remotion/videos/l01/` (story.ts mit `A()`, Szenen-Sets nebeneinander,
   Kamera aus Moves, Leitmotiv Pegel + Treppe, Icons, Ranking-Set). Vor dem Rendern alle Phrasen gegen words.json prüfen.
   Pro Satz: Set, Kamera-Key, Elemente mit Phrasen-Anker (alt: `at(words,"Wort",n)`).
   - Eine Welt pro Video: Leitmotiv-Set in der Mitte, Kapitel-Sets daneben (x-Versatz ~2.000 px), Kamera fährt dazwischen.
   - **Szenen-Checkliste (jedes Set, vor dem Bauen):**
     1. *Ort:* Wo sind wir? Ein zum Thema passender Ort, nie ein leerer Raum mit Text. Hintergrund in 2-3 Tiefen mit
        `Parallax` (fern: `NightSky`/`Moon`, mittel: `Mountains`/Skyline aus `Building`, nah: `Hill`/Boden/`Road`).
     2. *Requisiten:* 2-4 Dinge, die das Thema zeigen (Gebäude mit Fenstern, `Pylon`, Werkstatt, Schreibtisch, Server …),
        als dunkle Silhouetten mit warmen Lichtpunkten.
     3. *Fokus-Licht:* **genau ein** warm leuchtendes Objekt (`Emissive` / `Beam` / `HorizonGlow` / `Spot`) – das, worüber
        gerade gesprochen wird. Es ist die Lichtquelle der Einstellung (Bloom, Lichtpfütze, Goldkanten zeigen zu ihm).
        Wechselt das Thema, wechselt das Licht (altes Objekt dimmt, neues leuchtet auf).
     4. *Du-Figur* im Bild (auch klein), mit warmem Lichthof.
     5. *Zahl/Label* sitzt an oder in einem Objekt (auf dem leuchtenden Schild, an der Hauswand, am Pegel), nie frei
        auf leerem Navy. Reine Text-Bilder („Folie“) sind verboten.
     6. *Bewegung im Halt:* Fenster gehen an (`Building lit`), Sterne funkeln, Linie zeichnet sich, Parallax – nicht Zoom.
   - Kamera-Keys mit `camAt(..., 0)` + Sinus-Atmen **nur in x/y** (±10/±5 px), Zoom ändert sich nur in Fahrten.
     Fahrten 30-60 f. Harte Schnitte nur bei Ort-/Zeitsprung. `Stage` rastet die Kamera auf ganze Pixel (siehe Gotchas).
   - Originalaufnahmen: `FootageQuote` mit den Einträgen aus `voice/timeline/clips.json` ins **Overlay** (nicht in die
     Welt); die Welt läuft gedimmt dahinter weiter.
   - Lichtwechsel auf Erzählschritte legen (Lampe aus → Leitmotiv leuchtet; Gegenstimme → Szene dimmt).
   - Reaktion im Bild 0-3 f vor dem Wort (`at()` hat `lead=2`).
   - `ChapterTag` pro Kapitel; die gleichen Fragen gehen in `CHAPTERS.json` für YouTube.
7. **Bauen.** `templates/remotion/lib/docu/` nach `src/lib/docu/` des Studios kopieren (liegt dort schon), neues
   `src/videos/<name>/` anlegen, `<Name>.tsx` + `story.ts` + `Leitmotiv.tsx` (das Leitmotiv ist pro Video neu gezeichnet).
   Komposition in `src/Root.tsx`: 1920×1080, 30 fps, `durationInFrames = ceil((voiceLen + 4) * 30)`.
   Bausteine (alle in `lib/docu/`):
   - `Stage` (Hintergrund, Kamera-Welt, Overlay, Körnung, Vignette), `Room` (Wand, Boden, Fluchtlinien), `Lamp`, `Layer`.
   - `Scenery`: `NightSky`, `HorizonGlow`, `Mountains`, `Town`, `Hill`, `Beam`. `Setpieces`: `Parallax`, `Emissive`,
     `Bloom`, `LightPool`, `Spot`, `Building`, `Pylon`, `Moon`, `Road`. `Footage`: `FootageQuote`.
     Beispiel mit allem: `templates/remotion/videos/look-v2/LookV2.tsx`.
   - `Figure` (`hero` | `crowd` | `elder` | `child` | `worker`, `walk`-Phase, Lichtseite).
   - `Label`, `SerifNumber` (zählt hoch), `Placard`, `ChapterTag`, `QuoteCard`, `Captions`, `DrawPath` (zeichnet sich, `glow`).
   - `Thumb` (Thumbnail-Rahmen), Timing: `ramp`, `life`, `reveal`, `keys`, `at`.
   - `templates/remotion/videos/docu-demo/DocuDemo.tsx` zeigt jeden Baustein einmal (Komposition `DocuDemo`, Still `DocuThumb`).
8. **Look-Check.** Stills mit `npx remotion still src/index.ts <Comp> out/<name>/f<n>.png --frame=<n>` (TEMP/TMP auf
   `B:/remotion-tmp`). Seite-an-Seite mit Referenzbildern aus `docu-ref-raw/frames/` bzw. `sheets/` (ffmpeg xstack).
   Opus-max-Prüfer: 1-3 Bögen, Noten /10 für Farbe, Licht, Typo, Figuren, Infografik, Komposition + nummerierte
   Fix-Liste. Look-Match-Schleife wie in `../SKILL.md` (Abschnitt „Look-match loop“), Besitzer pro Datei:
   cam = story.ts, world = Stage/Room/Lamp/Leitmotiv, char = Figure, type = Text/theme.
   **Kontrast-Messung** auf den Prüfbildern: `python -I templates/analysis/warm_qa.py out/<name>/stills/` – Ziel
   warm ≥ 4 % (Median), ≥ 60 % der Bilder ≥ 3 % warm, hell ≥ 3 %. Jedes „too blue“-Bild bekommt ein Fokus-Licht.
9. **Ton** (`audio/`): Vorlage `templates/audio/make_audio.py` (eigene Ambient-Musik in Moll, Abschnitte = Szenen per
   Phrase, Whoosh/Boom/Papier, Ducking ~10 dB unter der Stimme, Zwei-Pass-loudnorm auf -14 LUFS / -1,5 dBTP, Stems).
   Allgemein: Event-Tabelle aus words.json/story.ts → SFX (Whoosh bei Fahrten, Tick beim Hochzählen, Papier bei
   Zitatkarten, tiefer Impuls beim Aufleuchten) + Musikbett. Musik: ruhige, pulsierende Ambient-/Klavierflächen,
   durchgehend, unter der Stimme geduckt (Zielabstand ~8 dB), Höhepunkte in Kapitelpausen. Eigene Synthese mit
   `../templates/audio/` (dsp.py, instruments) oder lizenzfreie Musik mit dokumentierter Lizenz in `audio/LIZENZ.md`.
   Ausgabe `mix.wav` 48 kHz, exakte Länge, -14 LUFS, Stems. Bildzeiten vorher einfrieren.
10. **Rendern.** `bash scripts/render-chunks.sh <Comp> <frames> 1.3333333333333333 out/<name> <mix.wav> 900`
    (frischer Browser pro Chunk; ein 10-min-Video hat ~18.000 Frames). Danach QA: `python scripts/short_qa.py`
    funktioniert auch für 16:9, aber **„frozen“-Funde ignorieren, wo die Kamera bewusst kriecht**; schwarze/weiße/
    Pop-Frames und Lautheit sind echte Fehler. Lautheit mit `ffmpeg -af ebur128` gegenprüfen.
    `warm_qa.py out/<name>/video.mp4 3` listet Strecken > 10 s ohne warmes Licht – vor der Abgabe beheben.
11. **Upload-Paket** (`videos/<nn-name>/upload/`):
    - `python templates/tools/youtube_meta.py voice/words.json CHAPTERS.json upload` → `untertitel.srt`, `kapitel.txt`.
    - Thumbnail als Still (`Thumb`), 1920×1080 → JPG < 2 MB. 2-4 Wörter, ein glühendes Gold-Objekt, winzige Du-Figur.
    - Titel ≤ 60 Zeichen, nicht identisch mit Thumbnail-Text. Beschreibung: 2 Sätze Hook, Kapitel, **alle Quellen**
      inkl. `voice/timeline/QUELLEN_CLIPS.txt` (Originalaufnahmen mit Link + Zeitmarke), Hinweis zur Herstellung
      (L01: „Sprecher: echte Stimme. Animationen am Computer erstellt, Musik selbst komponiert.“).
    - Angepinnter Kommentar = die Kommentarfrage aus dem Skript.
    - Nutzer liefert das finale mp4 aus; Memory aktualisieren.

## Gotchas
- **Disk:** jedes Remotion-Bundle kopiert `public/` in TEMP. Immer `TEMP/TMP=B:/remotion-tmp`; nach Projektende
  `remotion-webpack-bundle-*` dort löschen (Nutzer fragen). C: hat kaum Platz.
- ffmpeg steht nicht im Bash-PATH: `/c/Users/KBeck/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin` anhängen.
- `@remotion/google-fonts` muss exakt die Remotion-Version haben (4.0.539). Fonts: Inter, Instrument Serif, Anton.
- SVG-`id`s müssen pro Bild eindeutig sein (Verläufe/Filter); die Bausteine bauen sie aus Position/Art. Zwei gleiche
  Figuren an derselben Stelle teilen sich die id – harmlos, aber bei eigenen Defs Präfix setzen.
- `filter: blur()` auf großen Flächen ist teuer; Glühen lieber über Verläufe. Körnung erneuert sich nur alle 2 f.
- Remotion schreibt eine stumme Tonspur: beim Muxen `-map 0:v:0 -map 1:a:0` (render-chunks.sh macht das).
- Untertitel-Chunks und `untertitel.srt` nutzen dieselbe Regel (≤ 7 Wörter / ≤ 44 Zeichen, Umbruch nach Satzzeichen).
- Text in der Kamera-Welt wird mitskaliert. Lesbare Mindestgröße bei Zoom 1: Labels 22 px, Quellen 15 px.
- 10-Minuten-Kamera: `camAt(..., creep=0)` und stattdessen sanftes Sinus-Atmen – ein linearer Creep zoomt über
  18.000 Frames sonst auf das Fünffache.
- **Text zittert bei langsamer Kamera** (L01, ab 7:05 oben links): Windows rendert Text mit ClearType; bei
  Subpixel-Verschiebung/-Zoom wird jede Glyphe pro Frame anders gerastert → Buchstaben springen ±1-2 px.
  Gemessen (Formänderung Frame→Frame): mit Atmen 0,73, statisch 0,07, **gerastete Kamera 0,09**. Deshalb:
  `Stage` rastet den Welt-Ursprung auf ganze Geräte-Pixel (`devicePixelRatio` = `--scale`), Zoom-Atmen ist aus.
  Wirkungslos/schlechter (getestet): `will-change`, `opacity: 0.999`, `text-rendering`, Mini-Rotation,
  chrome-headless-shell. Text nie in `Parallax` legen (bewegt sich subpixelig). Lebendigkeit im Halt über Parallax,
  Fensterlichter, Funkeln. Langsame Zoom-Fahrten mit Text im Bild vermeiden; schnelle Fahrten (30-60 f) sind ok.
- `OffthreadVideo` zählt ab seiner `Sequence`; `FootageQuote` setzt die Sequence selbst (Clip-Datei hat 0,5 s Vorlauf).
  Clips liegen in `public/` und werden pro Chunk mitgebündelt – geschnitten und kurz halten.
- `npx remotion still` bündelt jedes Mal neu: für viele Prüfbilder `scripts/bridge-stills.mjs` (COMP=<Id>) nutzen,
  Kontaktbögen mit PIL bauen (ffmpeg drawtext stürzt hier ohne fontconfig ab).
- Während render-chunks.sh läuft, keine Quelldateien im Studio ändern: jeder Chunk bündelt neu.
- Der Referenzkanal nutzt gelbe Regenjacke + Tacho: unsere Figur ist orange mit Schal, unser Leitmotiv ist pro Video neu.

## Neue Referenz analysieren (wenn der Nutzer ein weiteres Vorbild nennt)
`python -m yt_dlp --js-runtimes node` (Node als JS-Runtime nötig). Werkzeuge in `templates/analysis/`:
- `subs2txt.py <subs> <tx>` – json3-Untertitel → Text mit Zeitmarken + Wörter/s.
- `measure.py <vids> <out.json>` – Luma, Sättigung, k-means-Palette, Ruhe-/Bewegungsanteil.
- `audio.py <id>` (im Rohordner ausführen) – Sprach- vs. Pausenpegel, Spektralschwerpunkt.
- Kontaktbögen: `ffmpeg -i v.mp4 -vf "fps=1/5,scale=320:-1,tile=8x6" sheets/v_%02d.jpg`.
- Downloads in einen eigenen leeren Ordner, Python mit `-I` darauf laufen lassen.
