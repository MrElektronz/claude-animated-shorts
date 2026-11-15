# Blackout Teil 1 – Shotplan

Code: `B:/Projects/Youtube/shorts-studio/src/videos/blackout_p01/` (Komposition `BlackoutP01`, 1920×1080, 30 fps).
Alle Schnitte hängen an **Wort-Indizes** von `voice/words.json` (`w(i)` in story.ts). Mit einer neuen Aufnahme
richtet sich das Bild selbst neu aus, solange `script_tts.txt` gleich bleibt.
Ende: Schnitt auf Schwarz am Ende von „ist“ (Wort 189) + 3 f, dann 33 f Schwarz mit Radiorauschen und Paukenschlag.
`HOOK_CUT` = Wort 15 − 4 f (nach „…Licht aus.“). `RECAP_END` = 0 (Teil 1).

| # | Wörter | Licht | Ort | Bild |
|---|---|---|---|---|
| 1 | 0–13 | elev (hell) | Kabine | Du mit Handy, Nah auf die Pfeil-Anzeige ab „zwischen“, Ruck auf „stehen“ (Kick), Du schockiert |
| 2 | 14–47 | torch (dunkel) | Kabine | Harter Schnitt: Licht aus. Nah Gesicht mit Handy-Licht; Notrufknopf (Arm ausgestreckt); Handy ohne Netz; Untersicht „rufst um Hilfe“ (Arme hoch); Nah „Atem“ |
| 3 | 48–58 | torch | Kabine | Von hinten: Du drückst die Türen auseinander, sie öffnen sich bis „Spalt“ |
| 4 | 59–70 | emerg (grün) | Kabine → Spalt | Blick durch die Öffnung nach oben, dann in den grünen Flur |
| 5 | 71–87 | emerg | Flur | Du ziehst dich hoch (Kick auf „reißt“), liegst auf dem Boden |
| 6 | 88–91 | emerg | Treppenhaus | Seitlich die Treppe hoch |
| 7 | 92–98 | night | Wohnung | Dunkle Wohnung (Blende 8 f), Kühlschranktür geht auf, drinnen dunkel |
| 8 | 99–108 | night | Wohnung | Von hinten zum Fenster, über die Schulter |
| 9 | 109–125 | night | Stadt | Dom (Tele, Brennweite kriecht), Hohenzollernbrücke, Altstadt, andere Rheinseite, zurück: Silhouette am Fenster |
| 10 | 126–143 | night | Straße | Stau von oben mit Lichtkegeln; Auto blinkt mit Fernlicht ab „hupt“ |
| 11 | 144–159 | candle | Wohnungstür | Klopfen (3 Kicks + Klopf-Effekt), Tür auf, Frau Brandt mit Kurbelradio; Nah aufs Radio |
| 12 | 160–167 | candle | Tür | Nah Frau Brandt: „Das ist nicht nur unser Haus“ |
| 13 | 168–177 | candle | Tür | Nah Kurbel dreht, Kick auf „knackt“ |
| 14 | 178–Ende | candle | Tür | Nah Du, Schock ab „Stromausfall“, Push auf „Bundesgebiet“, Schwarz auf „ist“ |

Lichter: `lights.ts` → `elev`, `torch`, `emerg`, `night`, `candle`. Schatten nur bei `night` (Mondlicht durchs Fenster).
Figuren: `DU` (senfgelbe Jacke), `BRANDT` (grüne Strickjacke, graues Haar) in toon.ts. Neu: Props `phone`, `["radio", Kurbel]`,
Optionen `arms: spread/up/reach`, `back: true` (Rückenansicht).
