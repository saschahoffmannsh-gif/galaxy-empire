# Galaxy Empire Remake (Einzelspieler, Web-App)
Start: `python3 -m http.server 8792` im Ordner, dann http://localhost:8792/ (Querformat).
Dateien: index.html, style.css, js/data.js (Werte), js/engine.js (Logik, DOM-frei), js/ui1-3.js (Oberfläche), js/replay.js (Kampfwiedergabe), js/art.js (Bild-Fallbacks), sw.js (Offline-Cache).
Test: `node test/sim.js 300` spielt das Tutorial automatisch durch und erstellt eine Nebel-Statistik.
Bilder: assets/needed_images.json listet die fehlenden Icons (assets/img/<id>.png), bis dahin werden automatisch Ersatz-Abzeichen erzeugt.
