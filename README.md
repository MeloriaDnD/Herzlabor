# Herzlabor – Mission Kreislauf

Ein statisches Lernspiel für NaWi 8 zum Themenfeld Blut, Blutgefäße, doppelter Blutkreislauf, Herz sowie Puls und Blutdruck.

## Starten

`index.html` im Browser öffnen. Für die Veröffentlichung auf GitHub Pages werden keine Pakete und kein Build-Prozess benötigt.

## GitHub Pages

1. Neues GitHub-Repository anlegen, z. B. `herzlabor`.
2. Die Dateien `index.html`, `styles.css` und `game.js` in das Hauptverzeichnis hochladen.
3. In GitHub: **Settings → Pages**.
4. Unter **Build and deployment**: **Deploy from a branch** wählen.
5. Branch `main`, Ordner `/ (root)` auswählen und speichern.
6. Nach kurzer Zeit zeigt GitHub dort die öffentliche Pages-Adresse an.

## Bedienung

- Computer: WASD oder Pfeiltasten, E/Enter zum Untersuchen.
- Tablet/Smartphone: Steuerkreuz und Button „UNTERSUCHEN“.
- Laborterminals können erneut geöffnet werden, auch wenn eine Mission bereits abgeschlossen ist.

## Datenschutz

- Kein Login.
- Keine Namen.
- Keine Übertragung von Ergebnissen an einen Server.
- Fortschritt wird ausschließlich mit `localStorage` im Browser des verwendeten Geräts gespeichert.

## Inhaltliche Leitplanken

Das Spiel verwendet die im Unterricht behandelten Kerninhalte:

- Blutplasma: flüssiger Anteil; transportiert gelöste Stoffe.
- Erythrozyten: vor allem Sauerstofftransport.
- Leukozyten: Abwehr von Krankheitserregern.
- Thrombozyten: Blutgerinnung/Wundverschluss.
- Arterie: führt Blut vom Herzen weg.
- Vene: führt Blut zum Herzen hin.
- Kapillare: sehr feines Gefäß; Stoffaustausch zwischen Blut und Gewebe.
- Lungenkreislauf: Herz → Lunge → Herz; Gasaustausch.
- Körperkreislauf: Herz → Körper/Organe → Herz; Versorgung der Organe.
- Herz: Pumporgan; Herzklappen verhindern Rückfluss.
- Puls: fühlbare Druckwelle in einer Arterie; Pulsfrequenz = Pulsschläge pro Minute.
- Blutdruck: Druck des Blutes auf die Gefäßwände; systolischer und diastolischer Wert.

Die praktische Blutdruckmessung wird nicht vorausgesetzt.

## Unterrichtliche Verwendung

Die fünf Räume können frei gewählt werden. Jede Mission folgt derselben Struktur:

1. Wissen wiederholen.
2. Wissen anwenden.
3. Einen Störfall lösen.

Nach allen fünf Bereichen öffnet sich die Notfall-Zentrale. Das Finale endet mit einem Teaser auf die spätere Reanimationsmission.

## Anpassen

Die Texte, Aufgaben und Antworten stehen in `game.js`. Am Anfang der Datei befindet sich `CONFIG` für Titel, Speichername und Text der nächsten Mission.

Hinweis: Die Blutgruppen-/Organspende-Mission ist bewusst noch nicht integriert. Sie kann ergänzt werden, sobald das konkrete Blutgruppen-Puzzle und der geplante Unterrichtsablauf feststehen.
