var xyChartTemplate = document.createElement('template')
xyChartTemplate.innerHTML = `<style id="lmschartstyle">
    :host {
        --breite: 15cm;
        --hoehe: 10cm;
        --ylabelbreite: 0px;
    }
    #overlaycontainer {
        grid-area: chart;
    }
    #chart {
        display: inline-grid;
        grid-template-columns: var(--ylabelbreite) auto auto;
        grid-template-areas:
            ". . title"
            "ylabel yscale chart"
            ". . xscale"
            ". . xlabel";
    }
    #charterrorname, #charterrormessage, charterrorstack {
        font-family: Courier;
    }
    #charterrorname {
        background-color: red;
        color: white;
    }
    #error {
        background-color: red;
        color: white;
        font-family: 'Courier New', Courier, monospace;
    }
    #legend {
        width: fit-content;
        display: flex;
        background-color: white;
        padding: 1mm;
        border: 0.5pt solid gray;
        border-radius: 2mm;
        margin: 2mm;
    }
    #svg {
        grid-area: chart;
    }
    #title {
        grid-area: title;
    }
    #xlabel {
        grid-area: xlabel;
    }
    #ylabel {
        grid-area: ylabel;
        align-self: center;
        rotate: 270deg;
        margin-left: calc(0.5*var(--ylabelbreite) - 0.5*var(--hoehe));
        margin-right: calc(0.5*var(--ylabelbreite) - 0.5*var(--hoehe));
    }
    #xscale {
        margin: 5px 0px;
        grid-area: xscale;
    }
    #yscale {
        grid-area: yscale;
        margin: 0 0.5em;
    }
    .no-scaling-stroke {
        vector-effect: non-scaling-stroke;
    }
    .absolute {
        position: absolute;
    }
    .relative {
        position: relative;
    }
    .breite {
        width: var(--breite);
    }
    .hoehe {
        height:var(--hoehe)
    }
    .grid, .subgrid {
        fill: none;
        stroke: grey;
        stroke-width: 0.9pt;
    }
    .subgrid {
        stroke-width: 0.3pt;
    }
    .graphpath {
        fill: none;
        stroke-width: 1.3pt;
        vector-effect: non-scaling-stroke;
    }
    .legenditem {
        display: flex;
        align-items: center;
    }
    .xaxis, .yaxis {
        fill: none;
        stroke: black;
        stroke-width: 1pt;
    }
    .titel, .xlabel, ylabel {
        text-align: center;
    }
    .legend {
        background-color: white;
        padding: 1mm;
        border: 0.5pt solid gray;
        border-radius: 2mm;
    }
    .svg {
        border: 1px solid grey;
        overflow: visible;
    }
    ::slotted([slot=ylabel]) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .yscalehidden, .xscalehidden {
        visibility: hidden;
    }
    .xscale {
        width:100%;
        text-align: center;
        top: 0;
        z-index: -10;
    }
    .yscale {
        line-height: var(--hoehe);
        vertical-align: middle;
        z-index: -10;
    }
    .symbol {
        vector-effect: non-scaling-stroke;
        transform-origin: center;
    }
</style>
<div>
    <div id="charterrorname"></div>
    <div id="charterrormessage"></div>
    <pre id="charterrorstack"></pre>
</div>
<div id="chart" class="chart">
    <div id="title"><slot name="title" class="titel breite"></slot></div>
    <div id="xlabel"><slot name="xlabel" class="xlabel breite"></slot></div>
    <div id="ylabel"><slot name="ylabel" class="xlabel"></slot></div>
    <div id="yscale" part="yscale" class="relative"></div>
    <div id="xscale" part="xscale" class="relative"></div>
    <div id="overlaycontainer" class="relative breite hoehe">
        <svg id="svg" class="svg absolute breite hoehe">
            <defs>
                <marker id="lmsarrow" preserveAspectRatio="none" viewBox="-10 -2 10 4"
                     refX="-10" refY="0" markerWidth="10" markerHeight="4" orient="auto">
                    <path style="stroke: none;" d="M0 0 L -10 2 L -10 -2 z"></path>
                </marker>
                <clipPath id="clipgraph">
                    <rect id="clipgraphrect"></rect>
                </clipPath>
                <path class="symbol" id="symbol-square" d="m-0.106066017 -0.106066017 h0.212132034 v0.212132034 h-0.212132034 z"/>
                <path class="symbol" id="symbol-circle" d="m-0.15 0 a0.15 0.15 180 0 0 0.3 0 a0.15 0.15 180 0 0 -0.3 0 z" />
                <path class="symbol" id="symbol-cross" d="m-0.15 -0.15 l0.3 0.3 m-0.3 0 l0.3 -0.3" />
                <path class="symbol" id="symbol-diamond" d="m-0.15 0 l0.15 0.15 l0.15 -0.15 l-0.15 -0.15 z" />
                <path class="symbol" id="symbol-triangle" d="m0 -0.1125 l0.12990381 0.225 l-0.259807621 0 z" />
                <path class="symbol" id="symbol-line" d="m-0.15 0 l0.3 0" />
            </defs>
            <g id="grids" class="grids">
                <path id="grid" part="grid" class="no-scaling-stroke grid"></path>
                <path id="subgrid" part="subgrid" class="no-scaling-stroke subgrid"></path>
            </g>
            <g id="graphs" clip-path ="url(#clipgraph)"></g>
            <g id="axis" class="axis">
                <line id="xaxis" part="xaxis" class="xaxis no-scaling-stroke" marker-end="url(#lmsarrow)"></line>
                <line id="yaxis" part="yaxis" class="yaxis no-scaling-stroke" marker-end="url(#lmsarrow)"></line>
            </g>
        </svg>
        <div id="legend" part="legend" class="absolute">
            <slot name="legend-before" id="legend-before"></slot>
            <div id="legend-list"></div>
            <slot name="legend-after" id="legend-after"></slot>
        </div>
        <div id="standardslot" class="absolute breite"><slot></slot></div>
        <div id="error" class="absolute breite"><slot name="error"></slot></div>
    </div>
</div>`


class ChartError extends Error {}

class ChartSvg {
    constructor(config, element) {
        this.config = config
        this.legend = element.getElementById("legend")
        this.legendlist = element.getElementById("legend-list")
        this.legendbefore = element.getElementById("legend-before")
        this.legendafter = element.getElementById("legend-after")
        this.svg = element.getElementById("svg")
        this.graphgroup = element.getElementById("graphs")

        this.svg.setAttribute("preserveAspectRatio", 'none')
        this.svg.setAttribute("viewBox", `${this.config.totalxmin} ${-this.config.totalymax} ${this.config.totalwidth} ${this.config.totalheight}`)
        this.svg.setAttribute("width", `${this.config.totalwidth}cm`)
        this.svg.setAttribute("height", `${this.config.totalheight}cm`)

        this.linewidth = 0.0352777778 // 1pt in cm

        this.drawSubgrid()
        this.drawGrid()

        if (! this.config.xhideaxis)
            this.drawXaxis()
        if (! this.config.yhideaxis)
            this.drawYaxis()

        this.cos30 = 0.8660254037844387
        this.sin30 = 0.5
    
        const clipgraphrect = this.svg.getElementById("clipgraphrect")
        clipgraphrect.setAttribute('x',  this.config.totalxmin)
        clipgraphrect.setAttribute('y', -this.config.totalymax)
        clipgraphrect.setAttribute('width',  this.config.totalwidth)
        clipgraphrect.setAttribute('height', this.config.totalheight)
    }

    tupelToPoint(tupel) {
        if (! Array.isArray(tupel) || tupel.length < 2)
            throw new ChartError(`${tupel} muss ein Array mit einer Länge von mindestens 2 sein.`)

        let x = parseFloat(tupel[0])
        if (isNaN(x))
            throw new ChartError(`${tupel[0]} ist keine Zahl.`)

        let y = parseFloat(tupel[1])
        if (isNaN(y))
            throw new ChartError(`${tupel[1]} ist keine Zahl.`)

        return {x: x*this.config.xscale, y: - y*this.config.yscale}
    }

    appendGraph(graphinfo) {
        const elements = []

        if (graphinfo['values'] !== null) {
            let values
            try {
                values = JSON.parse(graphinfo.values)
            } catch (error) {
                throw new ChartError(error.message)
            }
            elements[0] = this.createGraphElement(values, graphinfo)
        }
        if (graphinfo['expr'] !== null) {
            const values = this.createValuesFromFunction(graphinfo)
            elements[1] = this.createGraphElement(values, graphinfo)
        }

        for (let element of elements) {
            if (! element)
                continue
            
            element.classList.add('graphpath')
            element.style['stroke'] = graphinfo.strokecolor
            element.style['stroke-width'] = '1.3pt'
            this.graphgroup.appendChild(element)
        }
    }

    createGraphElement(values, graphinfo) {
        if (graphinfo.symbol == 'line')
            return this.createPathElement(values, graphinfo)
        else {
            return this.createSymbolGroup(values, graphinfo)
        }
    }

    createSymbolGroup(values, graphinfo) {

        if (! Array.isArray(values))
            throw new ChartError(`values muss ein zweidimensionales Array sein.`)

        const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
        for (let i=0; i<values.length; i++) {
            const point = this.tupelToPoint(values[i])
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use")
            use.setAttribute('href',`#symbol-${graphinfo.symbol}`)
            use.setAttribute('x', point.x)
            use.setAttribute('y', point.y)
            use.setAttribute('transform-origin', `${point.x} ${point.y}`)
            use.setAttribute('part', `graph${graphinfo.id}`)
            group.appendChild(use)
        }

        return group
    }

    createPathElement(values, graphinfo) {

        if (! Array.isArray(values))
            throw new ChartError(`values muss ein zweidimensionales Array sein.`)

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        let point = this.tupelToPoint(values[0])
        let dpath = `M${point.x} ${point.y}`
        for (let i=1; i<values.length; i++) {
            point = this.tupelToPoint(values[i])
            dpath += ` L${point.x} ${point.y}`
        }
        path.setAttribute("d", dpath)
        path.setAttribute('part', `graph${graphinfo.id}`)
        return path
    }

    createValuesFromFunction(graphinfo) {
        if (graphinfo['expr'] === null)
            return []
        
        if (typeof math === 'undefined') {
            throw new ChartError('Für Funktionen benötigt xy-graphs die Javascript-Bibliothek <a href="https://mathjs.org/">mathjs</a>')
        }
        let start, end, step, tupel = []
        if (graphinfo.start === null)
            graphinfo.start = this.config.xmin
        start = parseFloat(graphinfo.start)
        if (isNaN(start))
            throw new ChartError(`start ${graphinfo.start} ist keine Zahl.`)

        if (graphinfo.end === null)
            graphinfo.end = this.config.xmax
        end = parseFloat(graphinfo.end)
        if (isNaN(end))
            throw new ChartError(`end ${graphinfo.end} ist keine Zahl.`)

        if (graphinfo.step === null)
            graphinfo.step = this.config.xsubdelta
        step = parseFloat(graphinfo.step)
        if (isNaN(step))
            throw new ChartError(`step ${graphinfo.step} ist keine Zahl.`)

        if (step == 0)
            throw new ChartError(`step darf nicht null sein.`)
        if (step > 0 && start > end)
            throw new ChartError(`step > 0 aber end < start.`)
        if (step < 0 && start < end)
            throw new ChartError(`step < 0 aber end > start.`)

        const values = []
        for (let i = start; i <= end && start <= end || i >= end && start >= end; i += step) {
            try {
                tupel = [i, math.evaluate(graphinfo.expr, { 'x': i })]
                if (tupel[1] == Infinity)
                    throw new ChartError(`Bis zur Unendlichkeit und noch viel weiter...`)
                values.push(tupel)
            }
            catch(err) {
                throw new ChartError(err.message)
            }
        }

        return values
    }

    appendLegendItem(info) {
        const div = document.createElement('div')
        this.legendlist.appendChild(div)
        div.classList.add('legenditem')
        div.setAttribute('part',`legenditem${info.id}`)
        const symbolsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        symbolsvg.setAttribute('width', '0.5cm')
        symbolsvg.setAttribute('height', '0.5cm')
        symbolsvg.setAttribute('viewBox', `-0.225 -0.1875 0.45 .375`)
        div.appendChild(symbolsvg)
        const element = this.createSymbolGroup([[0,0]], info, true)
        symbolsvg.appendChild(element)
        element.classList.add('graphpath')
        element.style['stroke'] = info.strokecolor
        element.style['stroke-width'] = '1.3pt'
        div.innerHTML += `<div>${info.name ? info.name : (info.expr ? info.expr : info.id)}</div>`
    }

    hasEmptyLegend() {
        return this.hasEmptyLegendList() && this.hasEmptyLegendSlots()
    }

    hasEmptyLegendList() {
        return this.legendlist.childElementCount == 0
    }

    hasEmptyLegendSlots() {
        return this.legendbefore.childElementCount == 0 && this.legendafter.childElementCount == 0
    }

    hideLegend() {
        this.legend.style.visibility = "hidden"
    }

    drawXaxis() {
        const element = this.svg.getElementById("xaxis")
        element.setAttribute("x1", this.config.totalxmin)
        element.setAttribute("y1", 0)
        element.setAttribute("x2", this.config.totalxmax-10*this.linewidth)
        element.setAttribute("y2", 0)
    }

    drawYaxis() {
        const element = this.svg.getElementById("yaxis")
        element.setAttribute("x1", 0)
        element.setAttribute("y1", -this.config.totalymin)
        element.setAttribute("x2", 0)
        element.setAttribute("y2", -this.config.totalymax + 10*this.linewidth)
    }

    drawGrid() {
        let dgrid = ""

        if (! this.config.xhidegrid) {
            for (let i = this.config.totalxmin; i <= this.config.totalxmax; i += this.config.xdelta*this.config.xscale) {
                dgrid += ` M${i} ${-this.config.totalymin} L${i} ${-this.config.totalymax}`
            }
        }
        
        if (! this.config.yhidegrid) {
            for (let i = this.config.totalymin; i <= this.config.totalymax; i += this.config.ydelta*this.config.yscale) {
                dgrid += ` M${this.config.totalxmin} ${-i} L${this.config.totalxmax} ${-i}`
            }
        }

        if (! dgrid)
            return
        
        const element = this.svg.getElementById("grid")
        element.setAttribute("d", dgrid)
    }

    drawSubgrid() {
        let dsubgrid = ''

        if (! this.config.xhidesubgrid) {
            for (let i = this.config.totalxmin; i <= this.config.totalxmax; i += this.config.xsubdelta*this.config.xscale) {
                dsubgrid += ` M${i} ${-this.config.totalymin} L${i} ${-this.config.totalymax}`
            }
        }

        if (! this.config.yhidesubgrid) {
            for (let i = this.config.totalymin; i <= this.config.totalymax; i += this.config.ysubdelta*this.config.yscale) {
                dsubgrid += ` M${this.config.totalxmin} ${-i} L${this.config.totalxmax} ${-i}`
            }
        }

        if (! dsubgrid)
            return

        const element = this.svg.getElementById("subgrid")
        element.setAttribute("d", dsubgrid)
    }
}

class ChartContainer {
    constructor(config, element, errorfunc) {
        this.config = config
        this.element = element
        this.errorfunc = errorfunc
        this.colorlist = ['blue','red','green','magenta','cyan','purple','orange']

        this.chartsvg = new ChartSvg(this.config, this.element)

        if (! this.config.xhidescale)
            this.configureXscale()
        if (! this.config.yhidescale)
            this.configureYscale()

        this.positionLegend()
    }

    appendGraphPaths(graphs) {
        for (let graph of Object.values(graphs).sort((a,b) => a.order - b.order)) {
            try {
                graph.strokecolor = this.colorlist.length > 0 ? this.colorlist.shift() : 'black'
                if (! graphs['nolegend'])
                    this.chartsvg.appendLegendItem(graph)
                this.chartsvg.appendGraph(graph)
            }
            catch(err) {
                if (err instanceof ChartError) 
                    this.errorfunc(`graph (id=${graph.id}): ${err.message}`)
                else
                    throw err
            }
        }
        if (this.chartsvg.hasEmptyLegend()) {
            this.chartsvg.hideLegend()
        }
    }

    configureXscale() {
        const xscale = this.element.getElementById("xscale")
        for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
            if (i != 0)
                xscale.innerHTML += `<div class="xscale absolute" style="left: ${i*this.config.xscale-0.5*this.config.totalwidth-this.config.totalxmin}cm;">${i.toLocaleString('de-DE')}</div>`
        }
        xscale.innerHTML += `<div class="xscalehidden">Mg</div>`
    }

    configureYscale() {
        const yscale = this.element.getElementById("yscale")
        for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
            if (i != 0) {
                yscale.innerHTML += `<div class="yscale absolute" style="right: 0em; top: ${this.config.totalymax-i*this.config.yscale-0.5*this.config.totalheight}cm;">${i.toLocaleString('de-DE')}</div>`
                yscale.innerHTML += `<div class="yscalehidden">${i.toLocaleString('de-DE')}</div>`
            }
        }
    }

    positionLegend() {
        const legend = this.element.getElementById("legend")
        legend.style.setProperty('--xpad', this.config.xlegendpadding)
        legend.style.setProperty('--ypad', this.config.ylegendpadding)
        switch (this.config.legendposition) {
            case 't':
                legend.style['margin-left'] = '50%'
                legend.style['transform'] = 'translate(-50%, 0)'
                legend.style['top'] = 'var(--ypad)'
                break
            case 'l':
                legend.style['margin-top'] = '50%'
                legend.style['transform'] = 'translate(0, -50%)'
                legend.style['left'] = 'var(--xpad)'
                break
            case 'b':
                legend.style['margin-left'] = '50%'
                legend.style['transform'] = 'translate(-50%, 0)'
                legend.style['bottom'] = 'var(--ypad)'
                break
            case 'r':
                legend.style['margin-top'] = '50%'
                legend.style['transform'] = 'translate(0, -50%)'
                legend.style['right'] = 'var(--xpad)'
                break
            case 'tl':
            case 'lt':
                legend.style['top'] = 'var(--ypad)'
                legend.style['left'] = 'var(--xpad)'
                break
            case 'tr':
            case 'rt':
                legend.style['top'] = 'var(--ypad)'
                legend.style['right'] = 'var(--xpad)'
                break
            case 'lb':
            case 'bl':
                legend.style['bottom'] = 'var(--ypad)'
                legend.style['left'] = 'var(--xpad)'
                break
            case 'rb':
            case 'br':
                legend.style['bottom'] = 'var(--ypad)'
                legend.style['right'] = 'var(--xpad)'
                break
            case 'none':
                legend.style['display'] = 'none'
                break
            default:
                legend.style['top'] = 'var(--ypad)'
                legend.style['right'] = 'var(--xpad)'
                break
        }
    }
}

class ChartConfig {
    constructor(configobject) {
        Object.assign(this, configobject)

        for (let prop of ['xmax','xmin','ymax','ymin']) {
            this[prop] = parseFloat(this[prop])
            if (isNaN(this[prop]))
                throw new ChartError(`${prop} muss eine Zahl sein.`)
        }

        for (let prop of ['xsize','ysize','xdelta','ydelta','xsubdelta','ysubdelta']) {
            this[prop] = parseFloat(this[prop])
            if (isNaN(this[prop]) || this[prop] <= 0)
                throw new ChartError(`${prop} muss eine positive Zahl größer 0 sein.`)
        }

        for (let prop of ['xhidegrid','yhidegrid','xhidesubgrid','yhidesubgrid','xhideaxis','yhideaxis','xhidescale','yhidescale']) {
            this[prop] = ! ["0", "false", false].includes(this[prop])
        }

        this.xscale = this.xsize/this.xdelta
        this.yscale = this.ysize/this.ydelta
        this.width = this.xmax - this.xmin
        if (this.width < 0) throw new ChartError('xmin > xmax')
        this.height = this.ymax - this.ymin
        if (this.height < 0) throw new ChartError('ymin > ymax')

        this.totalwidth = this.width*this.xscale
        this.totalheight = this.height*this.yscale
        this.totalxmin = this.xmin*this.xscale
        this.totalymin = this.ymin*this.yscale
        this.totalxmax = this.xmax*this.xscale
        this.totalymax = this.ymax*this.yscale
    }
}

function slotChanged(event, styleelement) {
    const tmpele = event.target.attributes["name"]
    if (!!tmpele && tmpele.value == "ylabel") {
        styleelement.setProperty('--ylabelbreite', '2em')
    }
}


class XYGraphs extends HTMLElement {

    connectedCallback() {
        try {
            this.template = xyChartTemplate.content.cloneNode(true)
            this.create();
        }
        catch(err) {
            if (err instanceof ChartError) {
                this.errormessage(err.message)
            }
            else {
                this.template.getElementById('charterrorname').innerHTML = err.name
                this.template.getElementById('charterrormessage').innerHTML = err.message
                this.template.getElementById('charterrorstack').innerHTML = err.stack
                this.template.getElementById('chart').style.display = 'none'
            }
        }
        finally {
            const shadow = this.attachShadow({mode: "open"})
            shadow.appendChild(this.template)
            shadow.addEventListener('slotchange', (event) => slotChanged(event, this.style))
        }
    }

    create() {
        this.configobject = {
            xsize: 1,
            ysize: 1,
            xdelta: 1,
            ydelta: 1,
            xsubdelta: 0.2,
            ysubdelta: 0.2,
            xmin: 0,
            xmax: 10,
            ymin: 0,
            ymax: 10,
            xhidegrid: false,
            yhidegrid: false,
            xhidesubgrid: false,
            yhidesubgrid: false,
            xhideaxis: false,
            yhideaxis: false,
            xhidescale: false,
            yhidescale: false,
            legendposition: 'tl',
            xlegendpadding: '2mm',
            ylegendpadding: '2mm',
        }
        this.emptygraph = {
            values: null,
            expr: null,
            start: null,
            end: null,
            step: null,
            symbol: 'line',
            symbolsize: 1,
            nolegend: false,
            name: null
        }
        this.graphorder = 0

        this.gridkeys = Object.keys(this.configobject)
        this.graphkeys = Object.keys(this.emptygraph)

        this.graphs = {}
        for (let attr of this.attributes) {
            if (attr.name.startsWith('graph-')) {
                this.parseGraphAttribute(attr)
            }
            else if (attr.name.startsWith('grid-')) {
                this.parseGridAttribute(attr)
            }
        }

        this.config = new ChartConfig(this.configobject)

        this.setCSSVariables()
        const chartcontainer = new ChartContainer(this.config, this.template, (msg) => this.errormessage(msg))
        chartcontainer.appendGraphPaths(this.graphs)
    }

    setCSSVariables() {
        this.style.setProperty('--breite', `${this.config.totalwidth}cm`)
        this.style.setProperty('--hoehe', `${this.config.totalheight}cm`)
    }

    parseGridAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length < 2)
            throw new ChartError(`${attr.name}: Falsches Format. grid-[eigenschaft] gefordert.`)

        if (attrinfo[1] == '')
            throw new ChartError(`${attr.name}: Falsches Format. Eigenschaft fehlt.`)
        
        const gridprop = attrinfo[1]
        if (! this.gridkeys.includes(gridprop))
            throw new ChartError(`${attr.name}: ${gridprop} unbekannt. Erlaubte Eigenschaften: ${this.gridkeys.join(", ")}.`)

        this.configobject[gridprop] = attr.value
    }

    parseGraphAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length != 3)
            throw new ChartError(`${attr.name}: Falsches Format. graph-[eigenschaft]-[id] gefordert.`)

        if (attrinfo[1] == '')
            throw new ChartError(`${attr.name}: Falsches Format. graph-[eigenschaft]-[id] ist gefordert.`)
        
        if (attrinfo[2] == '')
            throw new ChartError(`${attr.name}: Falsches Format. id nicht angegeben.`)

        const graphid = attrinfo[2]
        const graphprop = attrinfo[1]
        if (! this.graphkeys.includes(graphprop))
            throw new ChartError(`${attr.name}: ${graphprop} unbekannt. Erlaubt sind nur ${this.graphkeys.join(', ')}`)

        if (!(graphid in this.graphs))
            this.graphs[graphid] = {...this.emptygraph, id: graphid, order: this.graphorder++ }

        this.graphs[graphid][graphprop] = attr.value
    }

    errormessage(msg) {
        this.innerHTML += `<div slot="error">${msg}</div>`
    }
}

customElements.define('xy-graphs', XYGraphs);
