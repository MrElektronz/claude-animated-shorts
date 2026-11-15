---
name: story-parts
description: Make a German serialized suspense/survival story told in parts ("Teil 1, Teil 2 …") - second-person present-tense narration ("du"), cold open in action, a cliffhanger at the end of every 65-90 s part, a season bible planned up front, 3-5 hook variants per part for Trial Reels - in the cartoon-3d look (2D cards in a 3D world, three.js + Remotion), rendered HORIZONTAL 16:9 (2560x1440 master) with a 9:16 letterboxed short (black bars top/bottom) and a long-form compile of the whole season with chapters. Narrator voice Gvd9RXquQXWjTYwBivjq (ElevenLabs). Use when the user wants a story in parts, a series/Staffel, "Part 1", a zombie/blackout/disaster/survival story, cliffhanger shorts, "wie im 7-Tage-KI-Video", "story-parts", or a short that can also be uploaded as long-form.
---

# Story in Teilen (16:9, Short mit Balken, Longform)

Schwester-Skill von `cartoon-3d-short` (Repo-Wurzel, `SKILL.md`). Look, Welt, Figuren, Post, Ton-Bausteine und alle
Gotchas kommen **von dort**. Vor dem ersten Teil die Wurzel-`SKILL.md` lesen. Hier steht nur, was anders ist:
- Format: Serie statt Einzelvideo.
- Skriptlogik: Spannung und Cliffhanger statt Pointe.
- 16:9 statt 9:16.
- Neue Stimme.
- Drei Ausgaben pro Teil.

Wissensquellen (vor jeder Staffel lesen):
- `references/SERIES_FORMULA.md`: was im Vorbild-Video funktioniert hat, Staffel- und Teil-Aufbau, Cliffhanger-Typen,
  Hook-Varianten, Veröffentlichung.
- `references/IDEAS.md`: Staffel-Ideen.
- `templates/SERIES_TEMPLATE.md` und `templates/PART_SCRIPT_TEMPLATE.md`.

Vorbild-Material (privat, außerhalb des Repos): `B:/Projects/Youtube/ref-wjlp/` (Transkript, Beschreibung).
- Nur das Format übernehmen.
- Nie die Geschichte, die Sätze oder den Namen des Kanals.

## Nutzer-Regeln
- Deutsch, 2. Person Präsens.
- **Stimme `Gvd9RXquQXWjTYwBivjq`** (ElevenLabs-Bibliotheksstimme), Tempo 1.0, für jeden Teil der Staffel dieselbe Stimme und dieselben Settings.
  - Der API-Schlüssel kommt nur aus der User-Umgebungsvariable `ELEVENLABS_API_KEY`. Er steht nie im Chat und nie in einer Datei.
  - **Stand 2026-11-15:**
    - Das Konto ist im Gratis-Tarif. Bibliotheksstimmen gehen dort nicht per API (HTTP 402 `paid_plan_required`).
    - Dem Schlüssel fehlen außerdem die Rechte `voices_read` und `forced_alignment`.
    - Weg ohne Upgrade: den Take im ElevenLabs-Web erzeugen (gleiche Stimme, Stabilität 0.5, Ähnlichkeit 0.8, Stil 0) und als `voice/take_<n>.mp3` speichern. Danach berechnet `scripts/align_local.py` die Wortzeiten lokal.
    - Getestet: Median-Abweichung 0,09 s zu echten ElevenLabs-Zeiten. Interpolierte Wörter nachhören.
- **Horizontal rendern:**
  - Master 16:9 in 2560×1440: `--scale 1.3333333333333333` auf eine 1920×1080-Komposition, exakt, sonst verweigert Remotion das Zusammenfügen.
  - Der Short ist 1440×2560 mit dem 16:9-Bild mittig und schwarzen Balken oben und unten. Die Balken bleiben leer, kein Text darin.
  - Die Longform wird aus den Mastern geschnitten.
- Kein Text im Bild (keine Untertitel, keine Labels). Die Ansage „Teil N“ steht in der Caption.
- Jeder Teil 65-90 s, nie unter 62 s (TikTok Creator Rewards zahlt erst ab > 1 min).
- Kein Gore.
- Skript und Staffel-Bibel brauchen die Freigabe des Nutzers, danach „einfach machen“. Nach jedem Schritt speichern.
- Opus max verifiziert jeden Look-Check.

## Ordner
- Repo: `series/<nn-name>/SERIES.md`.
- Pro Teil: `series/<nn-name>/part-NN/`
  - `SCRIPT.md`
  - `SHOTPLAN.md`
  - `voice/`: `script_tts.txt`, Takes, `voice.wav`, `words.json`
  - `audio/`: `<name>_audio.py`, `mix.wav`, Stems, `cues.md`
  - `hooks/`
- Studio `B:/Projects/Youtube/shorts-studio`:
  - Code: `src/videos/<name>_pNN/`.
  - Ausgaben: `out/<name>_pNN/{st,draft,final}/`. In `final/` liegen `video.mp4` (16:9) und `short.mp4` (9:16).
- **Teil N+1 startet als Kopie von Teil N** (`cp -r src/videos/<name>_p01 src/videos/<name>_p02`).
  - So bleiben Welt, Figuren und Look über die Staffel gleich.
  - Ändert sich etwas Gemeinsames (eine Figur, ein Ort), wird es auch in die späteren Teile kopiert, bevor man sie rendert.

## Pipeline
1. **Staffel wählen.** Aus `references/IDEAS.md`: Bedrohung, Ziel mit Uhr, ein bekannter deutscher Ort, 6-10 Teile.
2. **Staffel-Bibel → `SERIES.md`** aus `templates/SERIES_TEMPLATE.md`.
   - Fakten mit Quellen, Logline, Regeln der Welt, Figuren mit wiedererkennbarem Outfit, Schauplätze mit Licht.
   - **Alle Teile mit ihrem Cliffhanger.**
   - Freigabe abwarten.
3. **Skript Teil N → `part-NN/SCRIPT.md`** aus `templates/PART_SCRIPT_TEMPLATE.md`.
   - 175-240 Wörter.
   - Beats: HOOK → RECAP_END (ab Teil 2) → 3-4 Stufen → Wende → CLIFF.
   - Dazu 3-5 Hook-Varianten. Checkliste abhaken. Freigabe abwarten.
4. **Stimme** (`part-NN/voice/`).
   - `scripts/elevenlabs_tts.py` und `scripts/align_local.py` dorthin kopieren.
   - `tighten.py` aus `videos/01-erfurt-1184/voice/` kopieren, mit Spannungspausen: `KEEP_WORD=0.12`, `KEEP_SENTENCE=0.38`. Vor dem CLIFF-Satz 0,5 s Stille stehen lassen.
   - `script_tts.txt`: ein Satz pro Zeile, Zahlen und Uhrzeiten ausgeschrieben, ohne Beat-Marken.
   - Mit Bezahl-Tarif: `python elevenlabs_tts.py say 1`.
   - Ohne Bezahl-Tarif: Take im Web erzeugen, dann `python align_local.py take_1.mp3 1`.
   - Danach tighten → `voice.wav` (48 kHz) + `words.json`. Wortzeiten stichprobenartig hören.
5. **Bildplan → `SHOTPLAN.md` + `story.ts`**, wie in der Wurzel-SKILL (SHOTS, XFADE, CAMS, KICKS, DOF) mit diesen Änderungen:
   - **Dichte:** neue Einstellung alle 2-4 s (im Vorbild war „viele hochwertige Bilder“ der Unterschied). Glides 12-30 f, Ruhen kriechen weiter.
   - **Frame 0** bewegt sich schon. Kein Establishing Shot vorneweg, der Kalte Einstieg ist das erste Bild.
   - `RECAP_END` (Frame) und `HOOK_CUT` (harter Schnitt nach dem Hook-Satz) als Konstanten exportieren. Die Longform und die Hook-Varianten schneiden dort.
   - Der CLIFF-Satz endet mit einem **Schnitt auf Schwarz exakt auf dem letzten Wort**. Danach 0,6-1,0 s Schwarz mit Stinger und Nachhall.
6. **Welt und Figuren bauen.**
   - Das Template kopieren: Teil 1 aus `templates/bridge/` oder einem fertigen Short (z. B. `src/videos/koepenick/`), ab Teil 2 aus dem Vorgänger-Teil.
   - **Teil 1:** `python story-parts/scripts/landscape_port.py <studio>/src/videos/<name>_p01`. Das macht Canvas und alle Pixelgrößen 16:9, siehe „16:9-Rahmen“ unten.
   - Komposition in `src/Root.tsx` als `<Name>P01` mit `width={1920} height={1080}` registrieren.
   - Licht: Für Nacht und Dämmerung bekommt `lights.ts` beim ersten Bedarf die Presets `dusk` und `night`, siehe unten.
   - Bedrohung (z. B. Infizierte) als Outfit in `toon.ts`:
     - graugrüne Haut, zerrissene Kleidung, Hängeschultern, leere weiße Augen ohne Pupille, schlurfender Gang (Lean 8-12°, Bob 2 %).
     - Kein Blut. Bedrohung zeigt sich über Menge, Silhouetten im Gegenlicht und Geräusch.
7. **Ton** (`part-NN/audio/`, Bausteine aus `templates/audio/`). Spannung statt Marsch:
   - Musik:
     - Tiefer Drone (`I.pad`, Moll, langsamer Filter-Schwenk).
     - Herzschlag-Puls (`I.timpani` tief, 60-90 bpm, schneller bei Eskalation).
     - `I.pluck`-Ostinato für die Flucht.
     - Riser (gefiltertes Rauschen + `G.whoosh`) in die Schocks.
     - Stinger auf dem CLIFF (Timpani + `I.cymbal` rückwärts, dann Stille).
   - SFX tragen die Schreckmomente (Sirene, Glas, Türklopfen, Atmen, Schlurfen, Funkrauschen). Neue SFX in `sfx_gen.py` ergänzen.
   - Mix:
     - Stimme oben, Musik −10 bis −12 dB darunter.
     - SFX bei Schocks bis 3 dB unter der Stimme, sonst leise.
     - Master −14 LUFS integriert, True Peak ≤ −1 dBTP.
     - `mix.wav` 48 kHz, exakt Teil-Länge.
8. **Look-Checks.** `REMOTION_TMP=B:/remotion-tmp COMP=<Name>P01 node scripts/bridge-stills.mjs out/<name>_p01/st/x_ <frames> 0.5` ergibt Stills in 960×540.
   - Kontaktbogen: `scripts/grid.py`. Danach den Opus-max-Verifier fragen.
   - Zusätzlich prüfen: **Ist die Szene auch im Short-Kleinbild lesbar?** Das Bild ist dort nur 1440×810 auf einem Handy.
9. **Entwurf und Final.**
   - Entwurf: `bash scripts/render-chunks.sh <Name>P01 <frames> 0.5 out/<name>_p01/draft <mix.wav>`.
   - Final: `bash scripts/render-chunks.sh <Name>P01 <frames> 1.3333333333333333 out/<name>_p01/final <mix.wav> 150`. Ergebnis: 2560×1440.
   - QA: `python scripts/short_qa.py` auf das 16:9-Master.
   - Short: `bash story-parts/scripts/letterbox.sh out/<name>_p01/final/video.mp4 out/<name>_p01/final/short.mp4`.
     - Ergibt 1440×2560, Bild 1440×810 bei y = 875.
     - Für Entwürfe als drittes Argument `1080` übergeben.
   - Kontaktbogen beider Fassungen ansehen, dann beide Dateien per SendUserFile schicken.
10. **Hook-Varianten** (Trial Reels; Ablauf noch nicht erprobt):
    - Pro Variante nur den Hook-Satz neu sprechen (`hooks/v<k>/voice.wav`) und den ersten Shot anpassen.
    - In `story.ts` per `HOOK`-Prop umschalten; dazu `<Name>P01H<k>` mit `defaultProps={{hook:k}}` registrieren.
    - Nur `0..HOOK_CUT` rendern.
    - Den Ton für `0..HOOK_CUT` neu mischen: Musik läuft weiter, die Stimme ist die Variante.
    - Mit `ffmpeg -f concat` an `HOOK_CUT..Ende` des Hauptteils hängen.
    - Ab `HOOK_CUT` muss die Variante bild- und tongleich mit dem Hauptteil sein.
11. **Longform** nach Staffelende:
    - `python story-parts/scripts/compile_longform.py longform.mp4 p01/video.mp4=Titel p02/video.mp4@<RECAP_END s>=Titel …`
    - Ergibt `longform.mp4` + `chapters.txt` für die YouTube-Beschreibung.
12. **Abliefern.** Titel, Beschreibung und Caption in `SCRIPT.md` eintragen. Nach 24 h die Zahlen in `SERIES.md` nachtragen. Memory aktualisieren.

## 16:9-Rahmen (anders als im vertikalen Short)
- `landscape_port.py` stellt Canvas, Ink, Karten-Rim, Linsenunschärfe, Korn und Bloom auf „px bei 1920×1080“ um. Maßstab ist jetzt Höhe / 1080.
  - Alle Zahlen in story.ts (`cInf`, Ink-Breiten) behalten ihren Wert und meinen jetzt die kurze Seite 1080.
- **fov ist in three.js vertikal.** Die Short-Werte (50-56) wirken in 16:9 viel zu weit. Richtwerte:
  - Totale 38-44
  - Halbtotale (ganze Figur) 30-34: Figur 2,16 m füllt ~75 % der Höhe bei d ≈ 5 m und fov 32.
  - Nah 24-28
  - Detail 18-22
- Sichtbare Breite = 2·d·tan(fov/2)·1,78. Es passen 3-5 Figuren nebeneinander, Platz für Bedrohung und Fluchtweg im selben Bild.
- **Short-Lesbarkeit:**
  - ~60 % der Zeit Halbnah/Nah; Totalen ≤ 2 s.
  - Das Wichtige liegt im mittleren Drittel. Nichts Wichtiges klebt am Rand.
  - Starke Silhouetten (Gegenlicht, Türrahmen, Fenster).
- Komposition: Drittel-Regel. Bedrohung und Du an gegenüberliegenden Seiten, damit die Distanz sichtbar ist. Vordergrund-Rahmen (Türrahmen, Autos, Geländer) in ~1/3 der Shots.

## Nacht- und Dämmerungslicht (beim ersten Bedarf in lights.ts anlegen)
- **night:**
  - Mondlicht als kühler Key aus az 200 / el 35, Farbe #9fb4ff ×0.55.
  - Shade #1d2240, Lift [.03,.04,.08].
  - Himmel #0b1026 → #27304f, Nebel = Horizontfarbe, 15→160 m.
  - Fenster und Laternen als HDR-Emissive (Bloom).
  - **Blaulicht:** zwei Punktlichter #2f6bff/#ff2a2a, 2 Hz abwechselnd, nur außen und durch Fenster.
  - Zielwerte: Gesichter Helligkeit ≥ .6 (Karten-Licht anheben), Nicht-Ink-p5 ≥ .07 (kein abgesoffenes Schwarz), Median-Luma ~.22.
- **dusk:** Sonne az 260 / el 3, Key #ff9a5c ×1.1, violettblaue Schatten wie bei golden, Himmel #f08a4b → #3a3f6e.
- Innenräume nachts: warme Praktische (Schreibtischlampe, Kühlschrank, Handy-Display) als Key. Das Blaulicht kommt durchs Fenster.

## Gotchas (zusätzlich zu denen der Wurzel-SKILL)
- Die Karten-Rims und die Ink-Breiten wurden vorher über Höhe / 1920 skaliert. Ohne `landscape_port.py` werden alle Linien in 16:9 um 44 % zu dünn.
- Eine Szene, die im 16:9-Master gut wirkt, kann im Short zu klein sein. Den Kontaktbogen immer auch vom `short.mp4` machen.
- Schwarz am Ende (CLIFF) zählt `short_qa.py` als Schwarzbild-Fehler. Erwartet sind 18-30 f Schwarz am Ende, nicht mehr.
- `letterbox.sh` kodiert neu (crf 16). Nicht zweimal auf dieselbe Datei anwenden.
- `compile_longform.py` kodiert alles neu (crf 18), Dauer etwa 0,3× Echtzeit. Bei langen Staffeln im Hintergrund laufen lassen.
