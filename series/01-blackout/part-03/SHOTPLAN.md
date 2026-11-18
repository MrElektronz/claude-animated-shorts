# Blackout Teil 3 – Shotplan

Code: `B:/Projects/Youtube/shorts-studio/src/videos/blackout_p03/` (Komposition `BlackoutP03`, 1920×1080, 30 fps), gebaut als
Kopie von Teil 2. Alle Schnitte hängen an **Wörtern** (`at("kanister")`, `at("du", 3)` = viertes Vorkommen), siehe
`AT` in story.ts. Neue Aufnahme: `python voice/sync_words.py`, dann `python audio/blackout3_audio.py`, dann neu rendern.
Ende: Schnitt auf Schwarz am Ende von „Haus“ + 3 f, dann 30 f Schwarz mit Pauke und rückwärts laufendem Becken.
`HOOK_CUT` = „Eine (Stunde)“ − 4 f (weißer Blitz + Rückspul-Geräusch), `RECAP_END` = „Im (Schrank)“ − 4 f.

**Retention-Bauplan:**
1. Der Hook ist ein Flash-Forward. Er zeigt das Tauziehen um den letzten Kanister und wird bei etwa 61 s eingelöst.
2. Jede Szene hängt mit „aber/deshalb“ an der vorigen.
3. Der Countdown an der Tür: Bei jeder Zahl kommt ein Kick und ein Schritt, dazu tickt eine Uhr.
4. Die Frage nach dem Schlüssel und der Kellertür bleibt offen.
5. Der Cliffhanger kommt auf dem letzten Wort.

| # | ab Wort | Licht | Ort | Bild |
|---|---|---|---|---|
| 1 | Eine (Hook) | shop | Laden | Flash-Forward: du und der Vater ziehen am Kanister, Gegenlicht der Hintertür, Handkamera |
| 2 | Eine Stunde vorher | grey | Stadt | Weißer Blitz, graues Köln, dann der Dom (Tele) |
| 3 | Malik | grey | Wohnung | Malik schläft auf dem Sofa; nah: Augen offen, Schlüssel am Hals |
| 4 | Im Schrank | grey | Küche | Halbes Brot und Dose Mais; „Für zwei“: ihr beide an der Arbeitsplatte |
| 5 | Also runter | torch | Treppenhaus | Ihr kommt die dunkle Treppe herunter, Stirnlampe leuchtet; nah: dein Gesicht |
| 6 | Unten | torch | Kellertür | Malik vor der Kellertür; Detail: neues Vorhängeschloss; nah: Schlüssel am Hals |
| 7 | Du fragst | torch | Kellertür | Du nah (Stirnlampe); Malik zuckt mit den Schultern, schaut weg |
| 8 | Vor dem Supermarkt | grey | Straße | Totale von oben auf die Schlange um die Ecke (ihr am Ende), dann entlang der Schlange |
| 9 | An der Tür | grey | Laden außen | Der Zettel an der Scheibe (Gekritzel, kein lesbarer Text) |
| 10 | Ohne Strom | shop | Kasse | Tote Kasse, Kartenleser mit dunklem Display, Kerze |
| 11 | Du hast zwanzig Euro | grey | Schlange | Du nah mit dem blauen Schein |
| 12 | Nach einer Stunde | grey | Tür | Verkäufer mit roter Schürze an der Tür, zählt; nah: „Noch zwanzig Leute“ |
| 13 | Siebzehn | grey | Tür | Zwei Leute und Malik gehen hinein (Kick auf jede Zahl); du nah (Schock); „Der Letzte“: Arm sperrt hinter dir |
| 14 | Hinter dir | grey | Schlange | Die Schlange schreit; der Vater drängelt sich an der Bordsteinkante nach vorn |
| 15 | Drinnen | shop | Laden | Ihr geht hinein, Leute greifen in halb leere Regale |
| 16 | Kein Brot | shop | Regale | Leeres Brotregal, leeres Nudelregal (Push-ins) |
| 17 | Ganz hinten | shop | Palette | Der letzte Kanister im Gegenlicht der Hintertür |
| 18 | Du greifst | shop | Palette | Du greifst zu; „fremde Hand“: Tauziehen (wie der Hook) |
| 19 | Der Mann | shop | Palette | Der Vater nah: „Zwei Kinder.“ |
| 20 | Du hältst fest | shop | Palette | Tauziehen enger, Kicks auf „fest“ und „auch“ |
| 21 | Dann flüstert | shop | Laden | Malik nah |
| 22 | Du lässt los | shop | Laden | Du nah, der Vater geht mit dem Kanister; „Woher“: Push auf Maliks Schlüssel |
| 23 | Zwei Dosen | shop | Kasse | Kasse im Gegenlicht, du zahlst mit dem Schein |
| 24 | Auf dem Rückweg | grey | Straße | Seitliche Fahrt neben euch; Malik bleibt stehen und schaut hoch |
| 25 | Über den Dächern | grey | Straße | Tele: schwarzer Rauch steigt über den Dächern auf |
| 26 | Ihr rennt | grey | Straße | Von hinten, Handkamera, ihr rennt |
| 27 | Der Rauch | grey | Haus | Fassade: Rauch quillt aus einem Fenster im 4. Stock; Push; Schwarz auf „Haus“ |

Neu in Teil 3:
- **Licht und Orte:** Licht `grey` (grauer Novembermorgen) und `shop` (toter Laden), Supermarkt `X_MK` (außen Glasfront und rotes Band, innen Regale, Palette mit Hintertür als Gegenlicht, Kasse), Kellertür mit Vorhängeschloss (`CELLAR`, `LOCK`), Hausfassade mit Brandfenster (`FIRE_WIN`), Rauch-Partikel (`fxSmoke`).
- **Figuren und Requisiten:** Figuren `FATHER`, `SELLER`, `modern(k)` für die Schlange (toon.ts), Stirnlampe (`lamp`), Schlüssel am Hals (`key`), Requisiten `note` und `jug`, Tauziehen (`tug` in der Seitenansicht).
- **Straße:** Die Autos auf der Straße stehen in Teil 3 verlassen und ohne Licht da, das Notlicht im Treppenhaus ist aus.
