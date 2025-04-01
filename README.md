# Dokumentation für `xy-graphs`

## Zweck der Datei

Die Datei definiert eine benutzerdefinierte HTML-Komponente namens `<xy-graphs>`, die interaktive und anpassbare 2D-Diagramme (z.B. Liniendiagramme, Punktwolken) direkt in HTML-Seiten ermöglicht. Sie basiert auf SVG und CSS und bietet eine flexible Möglichkeit, Daten visuell darzustellen. Mit dieser Komponente können Entwickler:

- Diagramme mit Achsen, Gittern und Legenden erstellen.
- Verschiedene Datentypen darstellen (z.B. Punkte mit Symbolen oder Linien).
- Mathematische Funktionen grafisch abbilden (mit Hilfe der `mathjs`-Bibliothek).
- Das Erscheinungsbild (Farben, Symbolgrößen, Sichtbarkeit von Elementen) detailliert anpassen.

Die Komponente ist ideal für wissenschaftliche Visualisierungen, Datenanalysen oder interaktive Webanwendungen.

## Nutzung in eigenen HTML-Seiten

Um die `<xy-graphs>`-Komponente zu nutzen, binden Sie die JavaScript-Datei in Ihrer HTML-Seite ein und verwenden das benutzerdefinierte Element im HTML-Code. Schritte:

1. **Einbinden der Datei:**
   Speichern Sie die JavaScript-Datei (z.B. als `xy-graphs.js`) und binden Sie sie ein:

   ```html
   <script src="xy-graphs.js"></script>
   ```

2. **Verwendung des Elements:**
   Fügen Sie das `<xy-graphs>`-Tag in Ihrem HTML ein und konfigurieren Sie es über Attribute oder CSS.

3. **Optionale Abhängigkeit:**
   Für mathematische Funktionen (via `expr`-Attribut) binden Sie die `mathjs`-Bibliothek ein:

   ```html
   <script src="https://unpkg.com/mathjs/lib/browser/math.js"></script>
   ```

## Konfigurationsmöglichkeiten

Die Konfiguration erfolgt über:
- **HTML-Attribute:** Für Diagrammeigenschaften (`grid-`) und Graphen (`graph-`).
- **CSS-Variablen:** Für Styling einzelner Graphen oder Symbole.
- **CSS `part`-Attribute:** Für gezieltes Styling spezifischer Komponententeile.

### Wichtige Grid-Konfigurationsattribute (`grid-*`)
Diese Attribute steuern das Erscheinungsbild des Diagramms:

| Attribut                | Beschreibung                                                                 | Standardwert        | Beispiel             |
|-------------------------|------------------------------------------------------------------------------|---------------------|----------------------|
| `grid-range`            | Bereich der Achsen: `'max'`, `'xmin xmax'` oder `'xmin ymin xmax ymax'`      | `'0 0 10 10'`       | `'0 0 5 5'`          |
| `grid-size`             | Größe des Diagramms in cm: `'xsize ysize'`                                   | `'1 1'`             | `'2 2'`              |
| `grid-delta`            | Abstände der Haupt- und Subgitter: `'xdelta ydelta xsubdelta ysubdelta'`     | `'1 1 0.2 0.2'`     | `'2 2 0.5 0.5'`      |
| `grid-hidegrid`         | Sichtbarkeit von Gittern: `'xhide yhide xhidesub yhidesub'`                  | `'0 0 0 0'`         | `'1 0 1 0'`          |
| `grid-hideaxis`         | Sichtbarkeit der Achsen: `'xhide yhide'`                                     | `'0 0'`             | `'0 1'`              |
| `grid-hideticknumbers`  | Sichtbarkeit der Achsenbeschriftungen: `'xhide yhide'`                       | `'0 0'`             | `'1 0'`              |
| `grid-ticklinelength`   | Länge der Ticks (innen/außen): `'in out'`                                    | `'0.2 0.2'`         | `'0.3 0.1'`          |
| `grid-tickgaplinenumber`| Abstand zwischen Tick und Nummer: `'length'`                                 | `'0.1'`             | `'0.3'`              |
| `grid-legendpadding`    | Legendeinnenabstand: `'length length'`                                       | `'0.2 0.2'`         | `'0.5 0.5'`          |
| `grid-legendposition`   | Position der Legende: `'t'`, `'b'`, `'l'`, `'r'`, `'tl'`, `'br'`, etc.       | `'tl'`              | `'br'`               |

### Graph-Konfigurationsattribute (`graph-*-<id>`)
Diese Attribute definieren einzelne Graphen im Diagramm. Jeder Graph muss mit einer id identifiziert werden, die mit einem
ASCII-Buchstaben beginnen muss (z.B. `g1`):

| Attribut            | Beschreibung                                              | Standardwert   | Beispiel                   |
|---------------------|-----------------------------------------------------------|----------------|----------------------------|
| `graph-values-<id>` | JSON-Array mit Punkten: `[[x1,y1], [x2,y2], ...]`         | `null`         | `'[[1,2], [2,4], [3,6]]'`  |
| `graph-expr-<id>`   | Mathematische Funktion (benötigt mathjs): `'f(x)'`        | `null`         | `'x^2'`                    |
| `graph-start-<id>`  | Startwert für Funktion                                    | `null` (xmin)  | `'0'`                      |
| `graph-end-<id>`    | Endwert für Funktion                                      | `null` (xmax)  | `'5'`                      |
| `graph-step-<id>`   | Schrittweite für Funktion                                 | `null` (xsubdelta) | `'0.1'`                |
| `graph-symbol-<id>` | Symboltyp: `square`, `circle`, `cross`, etc.              | `'line'`       | `'circle'`                 |
| `graph-name-<id>`   | Name in der Legende                                       | `null`         | `'Quadratfunktion'`        |

### CSS-Variablen
Alle Grid-Attribute können auch als CSS-Variablen verwendet werden. Dazu legt man z.B. in einer CSS-Klasse oder im style-Attribut
die Variable fest, z.B. `.myclass {--grid-hideaxis: 1 1}`.

Die folgenden CSS-Variablen können für Styling verwendet werden.

| Variable                | Beschreibung                          | Standardwert       | Hinweis                          |
|-------------------------|---------------------------------------|--------------------|----------------------------------|
| `--tick-font-size-pt`   | Fontgröße der Ticks in pt             | `12`               | z.B. `---tick-font-size-pt: 10;` |
| `--graph-<id>-stroke`   | Linienfarbe des Graphen mit ID `<id>` | `'black'`          | z.B. `--g1-stroke: blue;`        |
| `--graph-<id>-fill`     | Füllfarbe des Graphen mit ID `<id>`   | `'none'`           | z.B. `--g1-fill: red;`           |
| `--graph-<id>-width`    | Linienbreite des Graphen              | `'1pt'`            | z.B. `--g1-width: 2pt;`          |
| `--path`                | SVG-Pfad für benutzerdefinierte Symbole | `'m-0.15 -0.15 l0.3 0.3 m-0.3 0 l0.3 -0.3'` | Für Symbol `custompath` anpassbar |

### CSS `part`-Attribute
Die Komponente exportiert spezifische Teile (via `part`-Attribut), die mit CSS gezielt gestylt werden können:

| `part`-Wert       | Beschreibung                             | Beispiel Styling                   |
|-------------------|------------------------------------------|------------------------------------|
| `chart`           | Das Diagramm                             | `xy-graphs::part(chart) { background-color: yellow; }` |
| `grid`            | Das Hauptgitter (Hauptlinien)            | `xy-graphs::part(grid) { stroke: gray; }` |
| `subgrid`         | Das Subgitter (feinere Linien)           | `xy-graphs::part(subgrid) { stroke: lightgray; }` |
| `xaxisline`       | Die x-Achse                              | `xy-graphs::part(xaxisline) { stroke-width: 2pt; }` |
| `xticklines`      | Die Tick-Markierungen an der x-Achse     | `xy-graphs::part(xticklines) { stroke: black; }` |
| `yaxisline`       | Die y-Achse                              | `xy-graphs::part(xaxisline) { stroke-width: 2pt; }` |
| `yticklines`      | Die Tick-Markierungen an der y-Achse     | `xy-graphs::part(xticklines) { stroke: black; }` |
| `legend`          | Der Legendenbereich                      | `xy-graphs::part(legend) { background: #f0f0f0; }` |
| `graph-<id>`      | Ein bestimmter Graph (z.B. `graph-g1`)   | `xy-graphs::part(graph-g1) { stroke: red; }` |
| `legenditem-<id>` | Legende-Eintrag eines Graphen (z.B. `legenditem-g1`)   | `xy-graphs::part(legenditem-g1) { padding: 10px 0px; }` |

## Beispiele

### Beispiel 1: Einfaches Liniendiagramm
Ein Diagramm mit einem einzelnen Liniengraphen:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="xy-graphs.js"></script>
</head>
<body>
    <xy-graphs grid-range="0 0 5 5" graph-values-g1='[[0,0], [1,1], [2,4], [3,3]]' graph-name-g1="Linie"></xy-graphs>
</body>
</html>
```

### Beispiel 2: Funktion mit Punkten
Ein Diagramm mit einer Funktion und Punkten, inklusive mathjs:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/mathjs/lib/browser/math.js"></script>
    <script src="xy-graphs.js"></script>
</head>
<body>
    <xy-graphs 
        grid-range="-2 -4 2 4" 
        grid-delta="1 1 0.2 0.2" 
        graph-expr-f1="x^2" 
        graph-name-f1="x²" 
        graph-symbol-f1="line"
        graph-values-p1='[[-1,1], [0,0], [1,1]]' 
        graph-symbol-p1="circle">
    </xy-graphs>
</body>
</html>
```

### Beispiel 3: Anpassung mit CSS und `part`
Ein Diagramm mit benutzerdefiniertem Styling für Achsen und Graphen:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="xy-graphs.js"></script>
    <style>
        xy-graphs {
            --graph-g1-stroke: purple;
            --graph-g1-width: 2pt;
        }
        xy-graphs::part(axis) {
            stroke: blue;
            stroke-width: 1.5pt;
        }
        xy-graphs::part(legend) {
            background: lightyellow;
            border: 1px solid black;
        }
    </style>
</head>
<body>
    <xy-graphs 
        grid-range="0 0 10 10" 
        grid-legendposition="br" 
        graph-values-g1='[[1,1], [2,4], [3,9]]' 
        graph-name-g1="Daten">
    </xy-graphs>
</body>
</html>
```

Diese Beispiele zeigen die Flexibilität der `<xy-graphs>`-Komponente. Durch die Kombination von Attributen, CSS-Variablen und `part`-Styling können Sie das Diagramm an Ihre spezifischen Anforderungen anpassen.
