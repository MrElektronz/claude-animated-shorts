# Blackout Teil 4 – Shotplan

Code: `B:/Projects/Youtube/shorts-studio/src/videos/blackout_p04/` (Komposition `BlackoutP04`, 1920×1080, 30 fps), gebaut als
Kopie von Teil 3. Alle Schnitte hängen an **Wörtern** (`at("radio", 1)` = zweites Vorkommen), siehe `AT` in story.ts.
Neue Aufnahme: `python voice/sync_words.py`, dann `python audio/blackout4_audio.py`, dann neu rendern.
Ende: Schnitt auf Schwarz am Ende von „weg“ + 3 f, dann 30 f Schwarz mit Pauke und rückwärts laufendem Becken.
`HOOK_CUT` = „Tag“ − 4 f, `RECAP_END` = „Malik“ − 4 f. Weißer Blitz auf „Draußen“ − 3 f (raus ins Tageslicht).

**Retention-Bauplan:**
1. **Hook:** Der Hook nennt, was auf dem Spiel steht (Feuer im 4., Frau Brandt im 9.), und die Kamera fährt vom Brandfenster zu ihrem Fenster.
2. **Physik als Uhr:** Der Rauch steigt im Treppenhaus nach oben, der Nebel wird mit jedem Shot dichter.
3. **Countdown:** Acht bis eins. Auf jeder Zahl ein Kick, ein Schritt und ein Tick, und der Herzschlag wird schneller.
4. **Radio:** Es steht auf dem Tisch, sie will es holen, am Ende liegt es am Boden.
5. **Offene Fragen:** Maliks Schlüssel bleibt ungeklärt, neu kommt Kesslers Brummen dazu (Aggregat, Teil 7/8).
6. **Falsche Erleichterung:** Im Hof steht ein Dur-Akkord, dann zählt man die Gesichter.

| # | ab Wort | Licht | Ort | Bild |
|---|---|---|---|---|
| 1 | Der (Hook) | grey | Fassade | Rauch aus dem Brandfenster (4. Stock), Push; harter Schnitt auf „Und“: Tele auf ihr Fenster im 9. |
| 2 | Tag zwei | grey | Vorplatz | Du mit dem Handy; nah: „Kein Netz“; Nachbarn schauen hoch: „Kein Notruf“ |
| 3 | Malik | grey | Vorplatz | Malik springt aufs blaue Rad und fährt los; seitlich mitfahrend: „Ich hol die Feuerwehr!“ |
| 4 | Du rennst | grey | Vorplatz | Von hinten, Handkamera: du rennst in die Haustür |
| 5 | Der Rauch | smoke | Treppe | Blick die Treppe hinauf, Rauchschwaden steigen, du steigst |
| 6 | Im vierten | smoke | Absatz 4 | Rauch quillt unter der braunen Tür; seitlich nah: Hand an der Tür, „Heiß“ (Kick, zurückzucken) |
| 7 | Also weiter | smoke | Treppe | Von unten hinten die Treppe hoch; nah: Augen brennen |
| 8 | Neunter Stock | smoke | Absatz 9 | Du hämmerst an die grüne Tür (Klopf-Ringe, 6 Kicks); „Nichts“: Profil, Stille |
| 9 | Dann geht sie auf | smoke | Absatz 9 | Tür schwingt auf: Frau Brandt am Tisch vor dem hellen Fenster |
| 10 | Frau Brandt packt | grey | Wohnung | Brandt nah, ruhig; Detail: Tablettendose |
| 11 | Ihr Radio | grey | Wohnung | Push auf das Radio auf dem Tisch (Setup) |
| 12 | Ein Stock höher | smoke | Absatz 10 | Kesslers dunkle Tür öffnet einen Spalt, warmes Licht; nah: Kessler im Spalt |
| 13 | Hinter ihm | smoke | Absatz 10 | Push in den warmen Spalt (Brummen); Tür knallt zu (Kick) |
| 14 | Runter | smoke | Absatz | Du und Brandt (mit Tasche) gehen zur Treppe, dichter Rauch |
| 15 | Du zählst / Acht | smoke | Treppe | Von unten: ihr kommt herunter; „Sieben“: du seitlich nah; „Frau Brandt hustet“: sie nah |
| 16 | Sechs | smoke | Treppe | Sie bleibt stehen, du drehst dich um; „Ihr Herz“: sie nah |
| 17 | Fünf | smoke | Treppe | Licht steigt von unten; Jansen nah mit Taschenlampe; „Ich hab sie“: Jansen bei Brandt |
| 18 | Vier | smoke | Treppe | Du nah, Handkamera, Luft anhalten |
| 19 | Drei, zwei, eins | smoke | Treppe | Drei Schnitte: von oben, seitlich, von hinten auf die helle Haustür |
| 20 | Draußen | grey | Vorplatz | Blitz; du stolperst raus, Brandt und Jansen da; „Sirene“: Tele, Löschzug mit Blaulicht, Malik vorneweg |
| 21 | Aber der Hydrant | grey | Vorplatz | Feuerwehrmann mit Strahlrohr, es spuckt; Hydrant mit schlaffem Schlauch |
| 22 | Malik greift | grey | Vorplatz | Malik nah, Schlüssel am Hals; Push, er lässt los |
| 23 | Sie löschen | grey | Fassade | Wasserbogen ins Brandfenster; Tele: Glut erlischt, Rauch wird grau |
| 24 | Im Hof | grey | Vorplatz | Reihe in Decken; du nah, schaust dich um |
| 25 | Jansen. Malik. | grey | Vorplatz | Drei Nahe: Jansen, Malik, Familie aus dem 4. (je ein Pluck) |
| 26 | Frau Brandt nicht | grey | Vorplatz | Leere Haustür; „Sie wollte nur …“: Jansen nah |
| 27 | Du rennst | grey | Vorplatz | Du rennst an der Feuerwehr vorbei, ein Feuerwehrmann greift nach dir |
| 28 | Neun Stockwerke | smoke | Treppe | Handkamera, du rennst hoch |
| 29 | Ihre Tür | smoke | Absatz 9 | Die grüne Tür steht weit offen, Push |
| 30 | Das Radio | grey | Wohnung | Radio liegt am Boden, Stuhl weggeschoben; „Und Frau Brandt ist weg“: leeres Zimmer, Schwarz auf „weg“ |

Neu in Teil 4:
- **Licht:** Preset `smoke` (warmer Rauchdunst, Nebel pro Shot über `smokeFog`), Dunstpuffs (`haze`), Rauch unter der Tür.
- **Orte:** Treppenhaus-Absatz `X_LD` (eine Tür für 4./9./10. Stock, Material pro Shot), Treppe runter mit heller Haustür (`EXIT_X`) und Treppe hoch, Frau Brandts Wohnung dahinter (Tapete, Tisch, Radio, Tabletten, Sessel, Fotos).
- **Straße:** Löschzug mit Blaulicht, Hydrant, Schläuche, Wasserbogen, Maliks Fahrrad.
- **Figuren:** `KESSLER`, `JANSEN`, `firefighter(k)`, `blanket(o)` (toon.ts).
- **Welt:** Unter dem Treppen-Set (x 676-720) gibt es keine Bodenplatte mehr, weil die Treppe unter y 0 führt.
