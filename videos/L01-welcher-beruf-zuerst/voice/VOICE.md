# Stimme: ElevenLabs-Klon der Kanalstimme

Voice-ID: `<hier eintragen, sobald der Klon existiert>`  ·  Modell `eleven_multilingual_v2`  ·  `TTS_SPEED=1.0`

## Klon anlegen (macht der Nutzer im ElevenLabs-Web, nicht per API)
Unser API-Key hat kein `voices_read`/`voices_write`, und der Klon gehört bewusst in deine Hand.
1. **Abo:** Instant Voice Clone ab „Starter“, Professional Voice Clone ab „Creator“. Für einen Kanal mit 10-min-Videos
   ist **Professional** klar besser (gleichmäßiger über lange Texte, weniger Aussetzer).
2. **Aufnahme:**
   - Instant: 1-3 min, Professional: mindestens 30 min, ideal 1-2 h.
   - Ruhiger Raum ohne Hall (Kleiderschrank/Decken helfen), immer gleicher Mikrofonabstand (~15-20 cm), Popschutz.
   - **So sprechen wie im Video:** ruhig, Erklärton, Hochdeutsch, nicht vorlesend-monoton. Am besten Absätze aus
     `../SCRIPT.md` (sobald freigegeben) und Sachtexte vorlesen.
   - Keine Musik, keine Effekte, keine Kompression; WAV oder hochwertiges MP3. Versprecher einfach neu sagen.
3. **ElevenLabs:** Voices → Add a new voice → Instant/Professional Voice Clone → Dateien hochladen → Bestätigen,
   dass es deine eigene Stimme ist (Professional verlangt zusätzlich eine Sprachverifikation).
4. **Voice-ID** (Voice öffnen → „ID“ kopieren) oben eintragen oder mir schicken.

## Test vor dem ganzen Skript
`python elevenlabs_tts.py say <voice_id> probe` mit einem Absatz → anhören: Tempo, Betonung, Zahlen, Fremdwörter.
Danach erst Kapitel für Kapitel rendern.

## Kennzeichnung
YouTube verlangt beim Upload die Angabe „veränderte oder synthetische Inhalte“, wenn realistisch wirkende KI-Stimmen
genutzt werden. Wir sagen es im Video selbst (Platz 8, Sprecher) und haken es beim Upload an.
