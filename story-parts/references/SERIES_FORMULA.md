# Serien-Formel: spannende Geschichten in Teilen

Abgeleitet aus dem Selbstexperiment „7 Tage KI-Videos“ (YouTube `_wjlp47RUtc`, Stand 2026-11). Dort wurde eine
animierte Zombie-Story in Teilen gepostet. Nach 7 Tagen hatte der Instagram-Kanal über 20.000 Follower. Das Transkript
liegt privat unter `B:/Projects/Youtube/ref-wjlp/`. Es dient nur zum Studieren und kommt nie ins Repo.
Wir übernehmen das **Format**, nie die Geschichte, die Figuren oder den Text.

## Was dort gemessen wurde (und was wir daraus machen)
| Beobachtung im Video | Unsere Regel |
|---|---|
| 9 von 10 erfolgreichen Accounts erzählen Katastrophen (Zombie-Ausbruch, Anschlag, …) | Jede Staffel ist ein Überlebens-Szenario mit klarer Bedrohung |
| Erzählt in der **2. Person, Präsens**: „Eine Polizeisirene rast an deinem Haus vorbei.“ | Immer „du“, Präsens. Der Zuschauer ist die Hauptfigur |
| Die Zuschauer „feiern die Hook“: Das Video muss **direkt mit Action** starten | Sekunde 0 ist schon mitten im Geschehen, ohne Intro und ohne „Hallo“ |
| ~45 % Zuschauer bis zum Ende waren ein Top-Wert | Ziel: ≥ 45 % Durchsicht. Jede 8-12 s ein neuer Reiz |
| **Kanal-Wachstum hängt am Cliffhanger am Ende**: je stärker, desto mehr Follows | Jeder Teil endet auf einer offenen Bedrohung oder Entscheidung |
| Die ganze Story wurde **zuerst komplett durchgeplant** | Erst `SERIES.md` (alle Teile, alle Cliffhanger), dann Teil 1 |
| Schwäche der anderen Accounts: zu wenige, schwache Bilder | Viele, hochwertige Bilder: neue Einstellung alle 2-4 s |
| **Künstliche Verknappung**: ein Teil pro Tag, die Leute folgen, um nichts zu verpassen | 1 Teil pro Tag. Nie mehrere Teile auf einmal posten |
| **Trial Reels**: gleiches Video mit 5 anderen Hooks lief genauso gut oder besser | Pro Teil 3-5 Hook-Varianten (nur die ersten 3-6 s anders) |
| TikTok Creator Rewards zahlt nur für Videos **> 1 Minute** (dort RPM ~2,17 $) | Jeder Teil 65-90 s, **nie unter 62 s** |
| YouTube-Longform: Teile zu einem langen Video zusammenschneiden, AdSense | 16:9-Master, daraus `longform.mp4` mit Kapiteln |
| Die Fans wollten „alles auf einmal sehen“ | Longform erst nach Staffel-Ende (oder als Early Access) |
| KI-Stimme + Soundeffekte tragen die Spannung | Eine Erzählstimme (Gvd9RXquQXWjTYwBivjq) und dichte SFX |

## Aufbau einer Staffel
- 6-10 Teile, jeder Teil 65-90 s. Zusammen ergibt das 8-13 min Longform (ab 8 min sind Mid-Roll-Ads möglich).
- **Bogen:**
  - Teil 1: Erwachen in der Bedrohung.
  - Teile 2-3: Flucht und erste Regel lernen.
  - Mitte: Verbündete/r, sicherer Ort.
  - Teile N-2..N-1: Der sichere Ort fällt, Verrat oder Verlust.
  - Finale: Entscheidung.
  - Danach ein Epilog-Haken für Staffel 2.
- **Ein roter Faden pro Staffel** (Ziel + Uhr): z. B. „Bis Sonntag zum Evakuierungspunkt am Rhein“. Jeder Teil bringt
  dem Ziel näher oder wirft zurück.
- **Regeln der Welt** früh festlegen und nie brechen (z. B. Zombies hören, aber sehen schlecht). Spannung entsteht
  aus Regeln, die der Zuschauer kennt.
- **Echte Fakten als Würze:** Überlebens-Details aus echten Quellen (BBK-Ratgeber, Notfall-Vorrat, Funk,
  Wasseraufbereitung, Stromausfall-Abläufe). Die Quellen stehen oben in `SERIES.md`. Das ist unser Plus gegenüber
  den KI-Accounts und passt zur Zielgruppe 30+.
- Deutsche Schauplätze, die man kennt: Altbauwohnung, Treppenhaus, Späti, S-Bahn, Autobahnraststätte, Baumarkt,
  Rheinbrücke. Lokalbezug macht Kommentare.
- **Kein Gore** (Monetarisierung, TikTok-Richtlinien, Comic-Look): Bedrohung zeigen, Gewalt andeuten, Schnitt vor dem
  Treffer, Geräusch statt Bild.

## Aufbau eines Teils (65-90 s, ~2,7 Wörter/s → 175-240 Wörter)
| Zeit | Beat | Regeln |
|---|---|---|
| 0-3 s | **Kalter Einstieg** | Ein Satz, mitten in der Action, Geräusch zuerst (Sirene, Klopfen, Glas). Bild bewegt sich schon im ersten Frame |
| 3-8 s | **Rückblende in einem Satz** (ab Teil 2) | „Gestern Nacht bist du aus deiner Wohnung entkommen. Jetzt …“ Wer neu ist, versteht es. Wer dabei war, wird nicht gelangweilt. Mit `RECAP_END` markieren |
| 8-60 s | **Eskalation in 3-4 Stufen** | Jede Stufe: ein Ziel, ein Hindernis, eine Entscheidung. Neue Info alle 8-12 s. Ein Atemholer (kurze Ruhe vor dem nächsten Schock) |
| 60-80 s | **Wende** | Etwas klappt, oder ein Ausweg zeigt sich |
| letzte 5-8 s | **Cliffhanger** | Neue Bedrohung oder offene Frage auf dem allerletzten Wort. Schnitt auf Schwarz exakt auf dem Wort, kurzer Sound-Stinger, dann Stille |

Satz-Werkzeuge:
- Kurze Sätze. Präsens. Sinne statt Gefühle: „Deine Hände zittern“ statt „Du hast Angst“.
- Zeitmarken geben Druck: „Noch vier Minuten.“, „Kurz nach drei Uhr nachts.“
- Pro Teil höchstens eine wörtliche Rede einer anderen Figur. Die Erzählstimme spricht sie mit („Sie flüstert: …“).
- **Cliffhanger-Typen** (abwechseln):
  1. Geräusch hinter dir.
  2. Die Tür geht von selbst auf.
  3. Der Verbündete ist gebissen oder lügt.
  4. Radio-Durchsage mit schlechter Nachricht.
  5. Du erkennst jemanden unter den Infizierten.
  6. Eine Entscheidung mit zwei schlechten Optionen („Links die Brücke. Rechts die Schreie.“).
- Kein „Folge für Teil 2“ im Voice-over. Die Aufforderung steht in der Caption und in der Beschreibung. Das letzte
  Wort gehört der Geschichte.

## Hook-Varianten (Trial Reels)
- Pro Teil 3-5 alternative erste Sätze. Bild und Ton tauschen nur die ersten 3-6 s, ab dem Variantenschnitt
  (`HOOK_CUT`, ein harter Schnitt im Bildplan) ist alles gleich.
- Typen:
  - Gefahr im ersten Wort („Sie stehen schon vor deiner Tür.“).
  - Frage („Was würdest du tun, wenn …?“).
  - Zahl oder Uhr („Noch drei Minuten bis …“).
  - Sinneseindruck („Das Erste, was du hörst, ist Glas.“).
  - Widerspruch („Der sicherste Ort der Stadt ist jetzt der gefährlichste.“).
- Auf Instagram als Trial Reels posten, auf TikTok sparsam. Nach 24 h: die beste Variante ist die Hook für den
  nächsten Teil.

## Veröffentlichung
- **Short:** `short.mp4` (9:16, 1440×2560, das 16:9-Bild mittig, oben und unten schwarz) auf TikTok, Instagram und
  YouTube Shorts.
  - Caption: „Teil N“ plus eine Frage an die Zuschauer („Was hättest du gemacht?“). Kommentare treiben die
    Reichweite.
- **Master:** `video.mp4` (16:9, 2560×1440) wird archiviert und ist die Grundlage für die Longform.
- **Longform** nach Staffelende: `longform.mp4` + `chapters.txt` (Kapitel „Teil 1: …“).
  - Rückblenden ab Teil 2 herausschneiden (`RECAP_END`). Beim Durchschauen stören sie.
  - Optional ein neuer 20-s-Einstieg (Cold Open aus dem stärksten Moment der Staffel).
- Alle Zahlen (Views, Follower, Durchsicht in %, Follows pro Teil) nach 24 h in `SERIES.md` → „Zahlen“ eintragen.
  Daraus entsteht die nächste Staffel.
