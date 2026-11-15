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
| Fremd-Footage | 3-6 Interviewclips | **keine**: Zitatkarten (Nutzer-Entscheidung) |

## Farbe (k-means über 1 Bild/s, 6 Videos)
- Luma: Mittel 0,14-0,23, **Median 0,08-0,19**, p5 0,04-0,07, p99 0,77-0,93 → dunkles Bild, wenige helle Akzente.
- Sättigung Median 0,70-0,87 (sattes Blau, kein Grau).
- **70-85 % jedes Bildes sind Navy**: `#050e2c` `#081437` `#0a1942` `#0c1d49` `#13265a` `#1b2c58` `#263050`.
- **Ein warmer Akzent, 3-10 %**: creme `#ece0b7` / `#e1d5af`, gold `#b19d79`, messing `#7a6e60`. Er markiert immer das,
  worauf der Blick soll (Hauptobjekt, Zahl, Zitatkarte, Lichtkegel).
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

## Thumbnails (6 gemessen)
- Gemalte Nachtszene (Sterne, Stadtlichter, Hügel), Navy → Blau.
- **2-4 Wörter**, fette schmale Versalien, creme mit Glühen, oben links über ~55 % der Breite.
- **Ein** goldglühendes Objekt (Preisschild, Chip, Kurve, Kalenderblatt) rechts.
- Die Hauptfigur winzig (5-10 % Höhe), schaut auf das Objekt.
- Titel und Thumbnail-Text sind nie identisch; das Thumbnail ist die steile These, der Titel ergänzt sie.
