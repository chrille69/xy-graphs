# lmschart
Custom-HTML-Element zum Darstellen von XY-Daten und Funktionsgraphen. Es wurde besonderes Augenmerk auf das Hauptgitter gelegt: Es soll in
Zentimeter-Einheiten erstellt werden. Achtet man beim Ausdrucken darauf, dass der Druckertreiber keine Skalierungen mehr vornimmt, wird
das Hauptgitter auf dem Blatt in Zentimetereinheiten gedruckt.

## Voraussetzungen
Es ist ein einigermaßen moderner Browser mit Javascript- und SVG-Unterstützung von Nöten. Die Berechnungen, die für die Erstellung
von Funktionsgraphen benötigt werden, werden mit Hilfe der Funktion [evaluate](https://mathjs.org/docs/expressions/parsing.html#evaluate)
von [mathjs](https://mathjs.org/) vorgenommen.

## Installation
Lade die Datei lms-chart.js in ein geeignetes Verzeichnis und füge im `head` deines HTML-Dokuments folgende Zeilen ein.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.9.0/math.min.js"></script>
<script src="/pfad/zu/lms-chart.js"></script>
```

Ersetze bitte `/pfad/zu/` mit einer korrekten URL.

## Beschreibung
Diese kleine Bibliothek stellt XY-Daten und Funktionsgraphen nur mit Hilfe von HTML
in einem Diagramm dar. Das Diagramm wird mit SVG erzeugt. Achsenbeschriftung und Skalierungen
werden mit CSS-grid platziert.

```html
<lms-chart graph-expr-1="x^2"></lms-chart>
```

erzeugt das folgende Diagramm:

![image](https://github.com/chrille69/lmschart/assets/47904800/2fb73a41-522a-4f10-8b1b-cce25fc37725)

Skalierung, Koordinatengitter und Wertebereiche lassen sich mit HTML-Attributen einstellen. Achsenbeschriftungen und Titel
des Diagramms können mit Hilfe von Slots angegeben werden. Der Standardslot wird direkt auf das Diagramm platziert.

### Attribute
Attribute, die für dieses Template relevant sind, beginnen entweder mit `grid-` oder `graph-`.

#### Attribute für das Gitter
 `grid`-Attribute konfigurieren das Koordinatengitter, die Größe des Diagramms und die Skalierung der Achsen.
 
| Attribut | Funktion | Beispiel | Standard |
| --- | --- | --- | --- |
| `grid‑xmin`<br/>`grid‑ymin` | Untere Intervallgrenze der x- bzw. y-Werte |  -4 | 0 |
| `grid‑xmax`<br/>`grid‑ymax` | Obere Intervallgrenze der x- bzw. y-Werte |  8 | 10 |
| `grid‑xsize`<br/>`grid‑ysize` | Größe des Hauptkästchens in cm |  2 | 1 |
| `grid‑xdelta`<br/>`grid‑ydelta` | Größe des Hauptgitters in x- bzw. y-Werten |  5 | 1 |
| `grid‑xsubdelta`<br/>`grid‑ysubdelta` | Größe des Untergitters in x- bzw. y-Werten |  0.1 | .2 |
| `grid‑xhidegrid`<br/>`grid‑yhidegrid` | Hauptgitter verbergen |  true | false |
| `grid‑xhidesubgrid`<br/>`grid‑yhidesubgrid` | Untergitter verbergen |  true | false |
| `grid‑xhidescale`<br/>`grid‑yhidescale` | Skalierung verbergen |  true | false |
| `grid‑legendposition` | Platzierung der Legende im Diagramm (t, r, b, l, tr, tl, br, bl, none) | tr | tl |
| `grid‑xlegendpadding`<br/>`grid‑ylegendpadding` | Padding in CSS-Koordinaten | 5mm | 2mm |

#### Attribute für Graphen
 Mit Hilfe der `graph`-Attribute können Messwertepaare oder Funktionsgraphen dargestellt werden. Es muss entweder
 das Attribut `graph-values-[id]` oder `graph-expr-[id]` gesetzt werden, damit ein Graph zu sehen ist.

| Attribut | Funktion | Beispiel | Standard |
| --- | --- | --- | --- |
| `graph‑values‑[id]` | Wertepaare in x,y-Koordinaten für Graph der ID `id` als zweidimensionales JSON-Array. | [[0,0],[1,4],[2,6],[3,9]] | null |
| `graph‑expr‑[id]` | Mathematischer Ausdruck, der von math.js evaluiert werden kann. Muss x als Variable enthalten. | 2*sin(x) | null |
| `graph‑start‑[id]` | x-Startwert des Graphen mit der ID `id`. | -4 | grid-xmin |
| `graph‑end‑[id]` | x-Endwert des Graphen mit der ID `id`. | 20 | grid-xmax |
| `graph‑step‑[id]` | Schrittweite der x-Werte zum Graphen mit der ID `id`. | 0.02 | grid-xsubdelta |
| `graph‑name‑[id]` | Der Name, der in der Legende für den Graphen mit der ID `id` angezeigt wird. Fehlt diese Angabe wird der Wert von `id` in der Legende angezeigt. | Sinus | null |
| `graph‑nolegend‑[id]` | Graph wird nicht in die Legende eingetragen. | true | false |
| `graph‑symbol‑[id]` | Gibt an, wie der Graph zur ID `id` dargestellt werden soll (line, circle, cross, square, diamond, triangle).  | diamond | line |
| `graph‑linewidth‑[id]` | Die Liniendicke des Graphen zur ID `id` in CSS-Einheiten.  | 2pt | 1.3pt |
| `graph‑symbolsize‑[id]` | Die Größe der Symbole des Graphen zur ID `id` in cm.  | 0.1 | 0.15 |
| `graph‑strokecolor‑[id]` | Die Linienfarbe des Graphen zur ID `id`.  | magenta | blue |
| `graph‑fillcolor‑[id]` | Die Füllfarbe des Graphen zur ID `id`.  | cyan | null |

### Slots
lmschart stellt sieben Slots zur Verfügung, die in der folgenden Tabelle erklärt sind.
| Slot | Funktion | Beispiel |
| --- | --- | --- |
| standardslot | Wird direkt auf dem Diagramm dargestellt | |
| `title` | Die Überschrift des Diagramms. | `<div slot="title">Röntgenspektrum</div>` |
| `xlabel` | Die Beschriftung der x-Achse. | `<div slot="xlabel">Spannung U in V</div>` |
| `ylabel` | Die Beschriftung der y-Achse. | `<div slot="ylabel">Stromstärke I in A</div>` |
| `legend‑before` | Text vor der Legende | `<div slot="legend-before">Legende:</div>` |
| `legend‑after` | Text nach der Legende | `<div slot="legend-after">gemessen mit Spezialgerät</div>` |
| `error` | Formatiert die Fehlermeldung. Nur zum internen Gebrauch gedacht. | |

## Beispiele
| HTML | Diagramm |
| :---: | :---: |
| `<lms-chart grid-legendposition="none"></lms-chart>` | ![image](https://github.com/chrille69/lmschart/assets/47904800/ef4ce2e0-458f-4c82-8271-add8a361f07c) |

## SVG-Koordinaten und reale Werte
Für die Abbildung der Wertekoordinaten auf SVG-Koordinaten ist folgende Abbildung hilfreich:

<img src="https://github.com/chrille69/lmschart/assets/47904800/f33a473c-4c48-454e-bab9-1a98f43a7611" width="50%" >

Die schwarzen Achsen stellen das Koordinatensystem der realen Werte dar, so wie es normalerweise gezeichnet wird (Y-Achse nach oben).
Die roten Achsen stellen das SVG-Koordinatensystem dar. Die Ursprünge und X-Achsen der beiden Koordinatensysteme liegen übereinander.
Die jeweiligen Achsen der realen Werte und von SVG haben verschiedene Skalierungen `xscale` und `yscale`. Ein Punkt im realen
Koordinatensystem soll die Koordinaten `xr` und `yr` haben. Dann hat der gleiche Punkt im SVG-Koordinatensystem die Koordinaten
`xr*xscale` und `-yr*yscale`. Man beachte das Minuszeichen bei der Y-Koordinate.

Mit Hilfe der SVG-Attribute `width`, `height` und `viewBox` lässt sich der sichtbare Ausschnitt und die Größe der SVG-Abbildung
einstellen. Die Breite wird auf `(xrmax - xrmin)cm` und die Höhe auf `(yrmax - yrmin)cm` gesetzt. Das Attribut `viewBox` muss in
SVG-Koordinaten angegeben werden. Anhand der Abbildung erkennt man die Parameter
`xmin*xscale -ymax*yscale (xrmax - xrmin)*xscale (yrmax - yrmin)*yscale`.
