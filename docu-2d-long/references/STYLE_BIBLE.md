# Stilbibel docu-2d-long (gemessen 2026-11-15)

Referenz: ein englischer KI-/Zukunfts-Doku-Kanal, 6 Videos gemessen (720p), 12 Transkripte gelesen.
Rohdaten privat unter `B:/Projects/Youtube/docu-ref-raw/` (vids/, subs/, tx/, sheets/, frames/, thumbs/, measure.json).
**Nie ins Repo, nie hochladen.** Der Kanalname kommt in keinem Voice-over und keiner Beschreibung vor.
Was wir übernehmen: das Genre (dunkle Nacht-Bühne, Infografik-Doku, Du-Ansprache). Was wir **nicht** übernehmen:
ihre Skripte, ihre Leitmotive (Tacho, Preisticket, Dominoreihe), ihre gelbe Regenjacken-Figur, ihren Missionssatz.

## Format
| Wert | Referenz | Wir |
|---|---|---|
| Seitenverhältnis | 16:9, 30 fps | 1920×1080 Komposition, Export 2560×1440 (`--scale 1.3333333333333333`) |
| Länge | 8:15-12:20, Median ~10:30 | 7-12 min, Ziel **8:30-10:30** (ab 8:00 sind Mid-Roll-Anzeigen möglich) |
| Sprechtempo | 2,36-2,69 Wörter/s (EN), Median 2,5 | Deutsch ~2,2 Wörter/s → **~1.150-1.400 Wörter** für 9-10,5 min |
| Stimme startet | 0,8-1,1 s | 1,0 s (Musik/Atmo davor) |
| Harte Schnitte | 0-2 pro Video | 0-3, nur bei Ort-/Zeitsprung |
| Untertitel | eingebrannt | eingebrannt (Nutzer-Entscheidung) + .srt für YouTube |
| Fremd-Footage | 3-6 Interviewclips | **1-3 Originalaufnahmen** (`FootageQuote`, 5-25 s, Quelle im Bild + Beschreibung); sonst Zitatkarte |

## Farbe (k-means über 1 Bild/s, 6 Videos)
- Luma: Mittel 0,14-0,23, **Median 0,08-0,19**, p5 0,04-0,07, p99 0,77-0,93 → dunkles Bild, wenige helle Akzente.
- Sättigung Median 0,70-0,87 (sattes Blau, kein Grau).
- **70-85 % jedes Bildes sind Navy**: `#050e2c` `#081437` `#0a1942` `#0c1d49` `#13265a` `#1b2c58` `#263050`.
- **Ein warmer Akzent, 3-10 %** (bei uns 4-15 %, siehe Kontrast-Regel): creme `#ece0b7` / `#e1d5af`, gold `#b19d79`,
  messing `#7a6e60`; bei uns heißer: `GOLD_HOT #ffcf6e`, `ORANGE_HOT #ff9a3c`. Er markiert immer das, worauf der Blick
  soll (Hauptobjekt, Zahl, Zitatkarte, Lichtkegel).
- **Zweiter Akzent, sparsam**: kühles Cyan-Glühen `#7fd0ff` für „Technik/KI/das Neue“ (Kurven, Linien).
- Graustufen-Mitteltöne `#444b62` `#69717f` `#81848c` für ferne Objekte und Nebenfiguren.
- Unsere Tokens: `templates/remotion/lib/docu/theme.ts` (`C`).

## Licht und Fläche
- Eine Bühne: dunkle Rückwand, etwas hellerer Boden mit schmaler heller Kante als Horizont, dünne perspektivische
  Bodenlinien (creme, 2 px) zu einem Fluchtpunkt in Bildmitte.
- Lichtquellen sind sichtbar (Hängelampe, leuchtendes Objekt) mit weichem Lichtkegel (blur ~18 px) und Lichtpfütze.
- **Licht wechselt mit dem Erzählschritt**: Lampe aus → Leitmotiv leuchtet auf; Szene dimmt, wenn eine Gegenstimme kommt.
- Verläufe sind leicht verrauscht (Körnung ~7 %, overlay), Vignette an den Rändern (~0,55).
- Keine Outlines auf Flächen. Formen werden nur durch Helligkeit getrennt. Haarlinien nur bei Diagrammen/Rahmen.

## Figuren
- Gesichtslose Silhouetten, langer weicher Mantel, runder Kopf, Beine als zwei Striche, Kontaktschatten.
- 2-Ton-Licht von der Lampenseite (hell oben/Lampenseite, dunkel unten/abgewandt), heller Rand am Kopf.
- Größe: Hauptfiguren 18-25 % der Bildhöhe, Hintergrundfiguren kleiner, Kinder ~55 %.
- **Unsere Du-Figur**: orangeroter Mantel `#f08a3c` mit cremefarbenem Schal. Die einzige warmfarbige Person im Bild.
  Sie steht für den Zuschauer und taucht in jeder Szene auf (auch winzig auf Diagrammen, auf der Kurve „gehend“).
- Gehen: leichtes Wippen, Beine pendeln; meist stehen sie und schauen.

## Typografie (alle Google Fonts, geladen in theme.ts)
| Rolle | Referenz-Eindruck | Wir |
|---|---|---|
| Große Zahlen, Jahre, Titel, Zitate | schmale Serif mit Kontrast | **Instrument Serif** 64-120 px |
| Datenlabel | fette Grotesk in Versalien, Laufweite +6 % | **Inter 700** 22 px, Versalien |
| Unterzeile/Quelle | kleine Versalien, `·` als Trenner, grau/gold | **Inter 600** 15 px, Laufweite +8 % |
| Kapitel-Frage | Versalien in dünnem Rahmen oben links | **Inter 700** 15 px, Rahmen 1,5 px creme |
| Untertitel | weiße Grotesk, Schatten, unten mittig | **Inter 500** 42 px, y ≈ 880 px |
| Thumbnail | sehr fette schmale Versalien | **Anton** 190 px |
- **Jede Zahl im Bild trägt ihre Quelle** als Unterzeile (`GEMESSEN · DESTATIS 2025`, `FIRMENANGABE · NICHT GEPRÜFT`).
- Ehrlichkeitslabels sind Teil des Looks: `SCHÄTZUNG, KEINE STUDIE`, `IN MÄUSEN`, `ILLUSTRATION`.

## Infografik-Vokabular
- Kurven zeichnen sich selbst (40-70 f), creme = Mensch/bisher, cyan mit Glühen = KI/neu. Gestrichelt = Prognose.
- Zahlen zählen hoch (24-40 f), Serif.
- Zitatkarte: cremefarbenes Papier, Serif-Zitat in dunkler Tinte, Versalien-Name + Quelle/Datum, großer weicher Schatten,
  erscheint mit Skalierung 0,96 → 1 und 18 px Anstieg.
- Platzschilder (Jahre, Namen, „DU“) als cremefarbene Trapez-Kärtchen auf dem Boden.
- Nummerierte Listen: kleine Hebel/Lämpchen 1-2-3-4, die nacheinander aufleuchten, plus Versal-Label oben rechts
  (`1 · PATENTE BÜNDELN`).
- Symbole (Auge, Zelle, Gebäude, Dokument) als flache Formen mit Verlauf und weichem Glühen, nicht als Icons mit Outline.

## Kamera und Schnitt (gemessen: Bilddifferenz bei 10 fps)
- Anteil fast stiller Bilder 3-58 %; die Kamera kriecht fast immer (Push-in ~0,02 %/f).
  **Bei uns nicht übernehmen:** Subpixel-Kriechen/Zoom-Atmen lässt Text zittern (ClearType, siehe SKILL.md Gotchas).
  Wir atmen nur in x/y, auf ganze Pixel gerastet, und holen die Lebendigkeit aus Parallax und Lichtwechseln.
- Bewegungen sind langsame Fahrten (Kran, Schwenk, Zoom) über **30-60 f** mit Smootherstep; Beispiel: Kran von der
  Lampe hinunter zum Leitmotiv in ~45 f.
- Übergänge: Kamerafahrt durch dieselbe Welt (bevorzugt), Überblendung 10-15 f, Lichtwechsel. Harte Schnitte selten.
- **Eine Welt pro Video**: das Leitmotiv-Set bleibt das ganze Video lang und wird immer wieder besucht; Kapitel sind
  Nachbar-Sets in derselben Welt (Kamera fährt nach rechts zum Diagramm-Bereich und zurück).
- Untertitel blenden in 4 f ein/aus, Labels in 8-12 f mit 14 px Anstieg.

## Ton (gemessen)
- Integriert **-14 LUFS**, LRA 3-4,5 LU.
- Musik läuft durchgehend; in Sprechpausen ~7-9 dB unter dem Sprachpegel (Ducking unter der Stimme).
- Musikcharakter (Spektralschwerpunkt in Pausen 1,1-2,1 kHz): ruhige, pulsierende Ambient-/Klavierflächen.
  *Nicht gemessen, beim Anhören prüfen:* genaue Instrumente, SFX-Typen.
- SFX zurückhaltend: weiche Whooshes bei Kamerafahrten, Ticks beim Hochzählen, Papiergeräusch bei Zitatkarten,
  tiefer Impuls beim Aufleuchten des Leitmotivs.

## Kontrast-Regel (Nutzer-Feedback 2026-11-16, gilt für Thumbnails UND Videos)
- Gemessen (1 Bild / 6 s, `templates/analysis/warm_qa.py`): warm leuchtende Pixel im Median **Referenz 2,4-8,9 %**,
  43-72 % der Bilder ≥ 3 % warm, helle Pixel 4,4-6,8 %. **L01: 0,2 %, 13 %, 1,5 %** → „zu blau, nichts für das Auge“.
  Ziel: Median ≥ 4 %, ≥ 60 % der Bilder ≥ 3 % warm, hell ≥ 3 %; keine Strecke > 10 s unter 1 % warm.
- Was in der Referenz warm ist: das **Fokus-Objekt selbst leuchtet** (Tachoscheibe golden angestrahlt, Gebäude/
  Preisschilder von innen hell, Karten creme-glühend), dazu Lampenkegel + Lichtpfütze, Fenster, Goldlinien am Boden.
  Das Objekt, über das gerade gesprochen wird, ist das hellste im Bild; alles andere bleibt dunkel-navy.
- **Ausnahme: bewusst kalte Szenen** (Nutzer, 2026-11-16). Fast nur Blau darf ein Stilmittel sein, wenn es eine
  Stimmung trägt: Verlust, Bedrohung, Leere, Einsamkeit, „das Licht geht aus“. Regeln, damit es gewollt wirkt:
  - Im Skript markiert (`**Bild:** KALT – <warum>`), im Bildplan als `COLD`-Bereich in story.ts.
  - Der Wechsel ist sichtbar inszeniert: das warme Licht **geht aus** (dimmt über 20-40 f), statt einfach zu fehlen.
  - Kühler werden, nicht nur dunkler: Cyan/Grau-Töne, weniger Sterne, Nebel; die Du-Figur darf entsättigt werden.
    Ein winziger warmer Rest (ein Fenster, die Du-Figur) kann die Einsamkeit noch verstärken.
  - Kurz: einzelne Szenen 5-30 s, zusammen höchstens ~15 % der Laufzeit. Danach kommt das Licht als Wendung zurück.
  - `warm_qa.py ... --cold 8:09-8:40` nimmt diese Bereiche aus der Wertung und meldet ihren Anteil.
- Bei uns: `Emissive` (leuchtende Karte/Schild/Paneel mit Bloom + Lichtpfütze) für Zahlen und Kernbegriffe,
  `Building lit` für „breitet sich aus“, `Spot`/`Lamp` auf die Du-Figur, `Beam` für Schwellen/Marken.
- Blau auf Blau wirkt flach. Pro Schlüsselbild **eine heiße Gold/Orange-Lichtquelle** (`Beam`, `HorizonGlow` in
  `lib/docu/Scenery.tsx`, Farben `GOLD_HOT #ffcf6e` / `ORANGE_HOT #ff9a3c`), deutlich heller und größer als bisher.
- Hintergründe nicht leer: Sternenhimmel mit Verlauf zum hellen Horizont (`NightSky`), 2-3 Bergketten mit Gold-Kante
  zur Lichtquelle (`Mountains`), Stadt mit warmen Fenstern (`Town`), Hügel mit Lichtkante für die Du-Figur (`Hill`).
- Du-Figur vor warmem Licht freistellen (orangener Lichthof als **Radialverlauf**, nie flache Ellipse).
- Navy bleibt 70-85 % der Fläche; der Akzent darf jetzt 8-15 % haben.
- SVG-Glow auf waagerechten Linien: Filter mit `filterUnits="userSpaceOnUse"` (Bounding-Box-Höhe 0 → sonst kein Blur).
- Beispiele: `references/demo_thumb_l01_v2.jpg`, Kanal-Branding in `branding/` (Vorlage `templates/remotion/videos/brand/`).

## Ort statt Folie (Nutzer-Feedback 2026-11-16: „zu leer/monoton, interessanter als eine PowerPoint“)
Beobachtet in zwei Referenz-Videos (Kontaktbögen alle 5 s):
- **Kein Bild ist leer.** Selbst Zahlen-Einstellungen stehen in einem Ort: Bühne mit Tachoscheibe als Rückwand,
  Nachtlandschaft mit Straße, Häusern, Strommasten, Satelliten, Mond; Rechenzentren als leuchtende Türme.
- Der Hintergrund hat **Tiefe**: Sternenhimmel hinten, Hügel/Skyline mittig, Boden mit Lichtlinie vorn.
- Requisiten erzählen das Thema mit (Schallplatte für Musik, Strommast für Energie, Satellit für GPS, Häuserzeile für
  Mieten). Sie sind dunkle Silhouetten; nur das gerade besprochene leuchtet auf.
- Figuren stehen **im** Bild (mit Namens-/Jahres-Schildern am Boden), die Du-Figur ist immer irgendwo.
- Zahlen sitzen an Objekten (über dem Turm, auf dem Schild, auf dem Paneel), nicht frei im Raum.
- Gleicher Ort wird wieder besucht und **verändert sich** (Fenster gehen an, Objekt wächst, Licht wandert).
Bei uns: Szenen-Checkliste in SKILL.md Schritt 6; Bausteine `Setpieces.tsx`; Beispiel `demo_look_v2.jpg`.

## Originalaufnahme (`FootageQuote`, Beispiel `demo_footage_v2.jpg`)
- Clip rechts in einem Rahmen (1210×680 bei 1080p, Haarlinie creme, großer Schatten), Welt dahinter gedimmt,
  links stärker abgedunkelt (Lesbarkeit).
- Bauchbinde links mit Goldbalken: Ehrlichkeitslabel (z. B. `FIRMENANGABE · EIGENE ZAHL`) darüber, dann
  `ORIGINALAUFNAHME (· ÜBERSETZT)`, Name in Serif, `ROLLE · ORGANISATION`, `ANLASS · DATUM`.
- Ton des Clips läuft, Musik geduckt; eingebrannte Untertitel laufen weiter (deutsch, bei Übersetzung markiert).
- Ein-/Ausblenden 12 f mit leichtem Skalieren 0,965 → 1.

## Thumbnails (6 gemessen)
- Gemalte Nachtszene (Sterne, Stadtlichter, Hügel), Navy → Blau.
- **2-4 Wörter**, fette schmale Versalien, creme mit Glühen, oben links über ~55 % der Breite.
- **Ein** goldglühendes Objekt (Preisschild, Chip, Kurve, Kalenderblatt) rechts.
- Die Hauptfigur winzig (5-10 % Höhe), schaut auf das Objekt.
- Titel und Thumbnail-Text sind nie identisch; das Thumbnail ist die steile These, der Titel ergänzt sie.
