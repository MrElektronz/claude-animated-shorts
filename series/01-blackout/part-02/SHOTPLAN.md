# Blackout Teil 2 – Shotplan

Code: `B:/Projects/Youtube/shorts-studio/src/videos/blackout_p02/` (Komposition `BlackoutP02`, 1920×1080, 30 fps), gebaut als
Kopie von Teil 1. Alle Schnitte hängen an **Wörtern** (`at("wasserhahn")`, `at("zwei", 1)` = zweites Vorkommen), siehe
`AT` in story.ts. Neue Aufnahme: `python voice/sync_words.py`, dann `python audio/blackout2_audio.py`, dann neu rendern.
Ende: Schnitt auf Schwarz am Ende von „gekommen“ + 3 f, dann 33 f Schwarz mit Paukenschlag.
`HOOK_CUT` = „Seit“ − 5 f, `RECAP_END` = „Zweiundzwanzig“ − 4 f (Longform schneidet bis dort).

| # | ab Wort | Licht | Ort | Bild |
|---|---|---|---|---|
| 1 | Wie (Hook) | candle | Küche | Zwei Töpfe und die Gießkanne im Kerzenlicht |
| 2 | Seit (Recap) | night | Stadt | Dunkles Köln, dann der Dom (Tele) |
| 3 | Zweiundzwanzig | candle | Bad | Du von hinten am Waschbecken; Nah auf den Hahn: Strahl stottert ab „hustet“, weg auf „Luft“ |
| 4 | Frau | candle | Tür | Erinnerung: Frau Brandt mit Radio in der Tür (Blende) |
| 5 | gewartet | candle | Bad | Du nah; Badewanne von oben; Pfütze am Wannenboden |
| 6 | Zwei Töpfe | candle | Küche | Töpfe, Gießkanne, dann Du an der Arbeitsplatte |
| 7 | Die Spülung | candle | Bad | Du drückt die Spülung (Arm), dann Schreck |
| 8–9 | Dein Handy | torch → dark | Wohnung | Handy-Licht im Gesicht; auf „aus“ wird es dunkel |
| 10 | gehst | night | Wohnung | Von hinten zum Fenster |
| 11 | Unten | night | Tankstelle | Von oben, dann entlang der toten Zapfsäulen, Nah auf eine Säule |
| 12 | Auf den Schienen | night | Straße | Dunkle Straßenbahn, offene Türen, leer |
| 13 | Ein Mann | night | Straße | Mann schiebt sein Auto (Seitenansicht, schieben) |
| 14 | Irgendwo | night | Fenster | Du am Fenster, Kick auf „klirrt“ |
| 15 | wird kalt | night | Wohnung | Du am Heizkörper; Nah auf den kalten Heizkörper |
| 16 | legst | night | Sofa | Du liegt in der Jacke auf dem Sofa; Töpfe; Nah Gesicht |
| 17 | Drei Uhr | night | Wohnung | Totale (Blende 14 f); Tür, vier Klopfer (Kicks + Klopf-Effekt) |
| 18 | Durch | dark | Tür | Du nah; Türspion-Blick (runde Maske, nur Dunkelheit) |
| 19 | öffnest | torch | Tür | Tür geht einen Spalt auf, Malik mit Handylicht; Nah; roter Pullover |
| 20 | „Ich bin Malik“ | torch | Tür | Malik nah, Du nah, Malik nah (Push), Schwarz auf „gekommen“ |

Neu in Teil 2: Bad-Set (`X_BA`), Töpfe/Gießkanne/Kerzen, Heizkörper unter dem Fenster, Tankstelle (`ST_X`), Straßenbahn
(`TRAM`), geschobenes Auto, Licht `dark`, Figur `MALIK` (toon.ts), Türspion-Maske (Bridge.tsx, `PEEP`).
Bäume im Stadtset sind in Teil 2 entfernt (wirkten nachts taggrün).
