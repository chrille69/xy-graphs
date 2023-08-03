# lmschart
Custom-HTML-Element zum Darstellen von XY-Daten und Funktionsgraphen.

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

| Attribut | Funktion | Beispiel | Standard |
| --- | --- | --- | --- |
| `grid-xmin` | Untere Intervallgrenze der x-Achse |  -4 | 0 |
| `grid-xmax` | Obere Intervallgrenze der x-Achse |  8 | 10 |
| `grid-delta` | Größe des Hauptkästchens in x-Werten |  5 | 1 |
| `grid-xsize` | Größe des Hauptkästchens in cm |  2 | 1 |
