# Herzlabor – Mission Kreislauf

Statische Lernspiel-Website für GitHub Pages. Keine Datenbank, kein Login, keine Übertragung von Schülerdaten. Der Fortschritt wird nur per `localStorage` im Browser gespeichert.

## Dateien für GitHub Pages

- `index.html`
- `styles.css`
- `game.js`
- `README.md` (optional; für die Website technisch nicht nötig)

## Spielstruktur

### Ebene 1 – Herzlabor: Wiederholung
Blutbestandteile, Gefäße, doppelter Blutkreislauf, Herz, Puls/Blutdruck und ein System-Finale.

### Ebene 2 – Forschungstrakt: neue Inhalte
Nach Abschluss der ersten Ebene werden drei frei wählbare Forschungswege geöffnet:

1. **Herzproblem – KHK & Herzinfarkt**
   - Herzkranzgefäße versorgen den Herzmuskel
   - Plaques und koronare Herzkrankheit
   - Gefäßverschluss / Herzinfarkt
   - Notfall: 112

2. **Organspende**
   - Transplantation und Patientenfall
   - Voraussetzungen: unumkehrbarer Ausfall der gesamten Hirnfunktionen + Zustimmung
   - Entscheidungslösung in Deutschland; Altersgrenzen 14/16
   - ethische Perspektiven und private, nicht gespeicherte Reflexion

3. **Blutgruppen & Blutspende**
   - AB0-Antigene auf Erythrozyten
   - Anti-A/Anti-B im Plasma
   - Transfusionspuzzle im vereinfachten Erythrozyten-Modell
   - Rhesusfaktor, 0 Rh−, Blutbestandteile

## Quellen / Stand

Fachliche Quellen für die neuen Inhalte, geprüft am 04.10.2026:

- Deutsche Herzstiftung: https://herzstiftung.de/infos-zu-herzerkrankungen/herzinfarkt/ursachen
- Deutsche Herzstiftung (Anzeichen): https://herzstiftung.de/infos-zu-herzerkrankungen/herzinfarkt/anzeichen
- BIÖG Organspende: https://www.organspende-info.de/
- BIÖG Voraussetzungen: https://www.organspende-info.de/organspende/voraussetzungen/
- BIÖG Entscheidungslösung: https://www.organspende-info.de/gesetzliche-grundlagen/entscheidungsloesung/
- DRK Blutspendedienst: https://www.blutspende.de/blutspende/wissenswertes-ueber-blut-blutgruppen

**Wichtig:** Rechtliche Regelungen können sich ändern. Vor späterer Wiederverwendung der Organspende-Ebene den Rechtsstand erneut prüfen.

## GitHub Pages

1. Neues Repository anlegen.
2. `index.html`, `styles.css` und `game.js` in das Stammverzeichnis hochladen.
3. GitHub: `Settings` → `Pages` → `Deploy from a branch` → `main` / `/ (root)`.
4. Die erzeugte Pages-Adresse als Link oder QR-Code an die Schüler:innen geben.

## Lehrkraft-Demo

Zum direkten Testen der Anschlusswelten kann an die URL angehängt werden:

- `?demo=hub`
- `?demo=heart`
- `?demo=organ`
- `?demo=blood`

Diese Parameter sind nur für die Vorschau gedacht; der normale Schülerweg bleibt unverändert.
