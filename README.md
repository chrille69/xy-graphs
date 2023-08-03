# lmschart
Custom-HTML-Element zum Darstellen von XY-Daten und Funktionsgraphen. Es wurde besonderes Augenmerk auf das Hauptgitter gelegt: Es soll in
Zentimeter-Einheiten erstellt werden. Achtet man beim Ausdrucken darauf, dass der Druckertreiber keine Skalierungen mehr vornimmt, wird
das Hauptgitter auf dem Blatt in Zentimetereinheiten gedruckt.

## Voraussetzungen
Es ist ein einigermaßen moderner Browser mit Javascript- und SVG-Unterstützung von Nöten. Die Berechnungen, die für die Erstellung
von Funktionsgraphen benötigt werden, werden mit Hilfe der Funktion [evaluate](https://mathjs.org/docs/expressions/parsing.html#evaluate)
von [mathjs](https://mathjs.org/) vorgenommen.

## Beschreibung
Diese kleine Bibliothek stellt XY-Daten und Funktionsgraphen nur mit Hilfe von HTML
in einem Diagramm dar. Das Diagramm wird mit SVG erzeugt. Achsenbeschriftung und Skalierungen
werden mit CSS-grid platziert.

    <lms-chart function-expr-1="x^2"></lms-chart>

erzeugt das folgende Diagramm:

![image](https://github.com/chrille69/lmschart/assets/47904800/2fb73a41-522a-4f10-8b1b-cce25fc37725)

Skalierung, Koordinatengitter und Wertebereiche lassen sich mit HTML-Attributen einstellen. Achsenbeschriftungen und Titel
des Diagramms können mit Hilfe von Slots angegeben werden. Der Standardslot wird direkt auf das Diagramm platziert.

### Attribute
Attribute beginnen entweder mit `grid-`, `xy-` oder `function-`. `grid`-Attribute konfigurieren das Koordinatengitter,
die Größe des Diagramms und die Skalierung der Achsen. Mit Hilfe der `xy`-Attribute können Messwertepaare dargestellt werden.
`function`-Attribute dienen der Darstellung von Funktionsgraphen.

#### Attribute für das Gitter
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

#### Attribute für xy-Daten
| Attribut | Funktion | Beispiel | Standard |
| --- | --- | --- | --- |
| `xy‑values‑[id]` | Wertepaare in x,y-Koordinaten für Graph der ID `id` als zweidimensionales JSON-Array. | [[0,0],[1,4],[2,6],[3,9]] | null |
| `xy‑name‑[id]` | Der Name, der in der Legende für den Graphen mit der ID `id` angezeigt wird. Fehlt diese Angabe wird der Wert von `id` in der Legende angezeigt. | Messung mit Reibung | null |
| `xy‑style‑[id]` | Gibt an, wie der Graph zur ID `id` dargestellt werden soll (line, circle, cross, square, diamond, triangle).  | diamond | line |
| `xy‑linewidth‑[id]` | Die Liniendicke des Graphen zur ID `id` in CSS-Einheiten.  | 2pt | 1.3pt |
| `xy‑symbolsize‑[id]` | Die Größe der Symbole des Graphen zur ID `id` in cm.  | 0.1 | 0.15 |
| `xy‑strokecolor‑[id]` | Die Linienfarbe des Graphen zur ID `id`.  | green | red |
| `xy‑fillcolor‑[id]` | Die Füllfarbe des Graphen zur ID `id`.  | yellow | null |

#### Attribute für Funktionen
| Attribut | Funktion | Beispiel | Standard |
| --- | --- | --- | --- |
| `function‑expr‑[id]` | Mathematischer Ausdruck, der von math.js evaluiert werden kann. Muss x als Variable enthalten. | 2*sin(x) | null |
| `function‑start‑[id]` | x-Startwert des Graphen mit der ID `id`. | -4 | 0 |
| `function‑end‑[id]` | x-Endwert des Graphen mit der ID `id`. | 20 | 10 |
| `function‑step‑[id]` | Schrittweite der x-Werte zum Graphen mit der ID `id`. | 0.02 | 0.1 |
| `function‑name‑[id]` | Der Name, der in der Legende für den Graphen mit der ID `id` angezeigt wird. Fehlt diese Angabe wird der Wert von `id` in der Legende angezeigt. | Sinus | null |
| `function‑style‑[id]` | Gibt an, wie der Graph zur ID `id` dargestellt werden soll (line, circle, cross, square, diamond, triangle).  | diamond | line |
| `function‑linewidth‑[id]` | Die Liniendicke des Graphen zur ID `id` in CSS-Einheiten.  | 2pt | 1.3pt |
| `function‑symbolsize‑[id]` | Die Größe der Symbole des Graphen zur ID `id` in cm.  | 0.1 | 0.15 |
| `function‑strokecolor‑[id]` | Die Linienfarbe des Graphen zur ID `id`.  | magenta | blue |
| `function‑fillcolor‑[id]` | Die Füllfarbe des Graphen zur ID `id`.  | cyan | null |

### Slots
lmschart stellt fünf Slots zur Verfügung, die in der folgenden Tabelle erklärt sind.
| Slot | Funktion | Beispiel |
| --- | --- | --- |
| standardslot | Wird direkt auf dem Diagramm dargestellt | |
| `title` | Die Überschrift des Diagramms. | `<div slot="title">Röntgenspektrum</div>` |
| `xlabel` | Die Beschriftung der x-Achse. | `<div slot="xlabel">Spannung U in V</div>` |
| `ylabel` | Die Beschriftung der y-Achse. | `<div slot="ylabel">Stromstärke I in A</div>` |
| `error` | Formatiert die Fehlermeldung. Nur zum internen Gebrauch gedacht. | |
