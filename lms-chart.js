var lmsChartTemplate = document.createElement('template')
lmsChartTemplate.innerHTML = `<style>
    :host {
        --breite: 15cm;
        --hoehe: 10cm;
        --ylabelbreite: 20px;
    }
    #lms-chart {
        display: inline-grid;
        grid-template-columns: auto auto auto;
        grid-template-areas:
            ". . title"
            "ylabel yscale chart"
            ". . xscale"
            ". . xlabel";
        position: relative;
    }
    .no-scaling-stroke {
        vector-effect: non-scaling-stroke;
    }
    #lms-chart-grid, #lms-chart-subgrid {
        fill: none;
        stroke: grey;
        stroke-width: 0.9pt;
    }
    #lms-chart-subgrid {
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
    .axis {
        fill: none;
        stroke: black;
        stroke-width: 1pt;
    }
    .label {
        text-align: center;
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
    #lms-chart-error {
        background-color: red;
        color: white;
        font-family: 'Courier New', Courier, monospace;
    }
    #lms-chart-legend {
        --xpad: 2mm;
        --ypad: 2mm;
        width: calc(var(--breite) - 2 * var(--xpad));
        height: calc(var(--hoehe) - 2 * var(--ypad));
        padding: var(--ypad) var(--xpad);
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
    }
    #lms-chart-legend-container {
        background-color: white;
        padding: 1mm;
        border: 0.5pt solid gray;
        border-radius: 2mm;
    }
    #lms-chart-svg {
        border: 1px solid grey;
        overflow: visible;
        grid-area: chart;
    }
    #lms-chart-title {
        grid-area: title;
    }
    #lms-chart-xlabel {
        grid-area: xlabel;
    }
    #lms-chart-ylabel {
        grid-area: ylabel;
        align-self: center;
        width: var(--hoehe);
        rotate: 270deg;
        margin-left: calc(0.5*var(--ylabelbreite) - 0.5*var(--hoehe));
        margin-right: calc(0.5*var(--ylabelbreite) - 0.5*var(--hoehe));
    }
    ::slotted([slot=ylabel]) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    #chart-mit-overlay {
        grid-area: chart;
    }
    #lms-chart-x-scale {
        grid-area: xscale;
    }
    #lms-chart-y-scale {
        grid-area: yscale;
        padding: 0 0.5em;
    }
    .yscalehidden, .xscalehidden {
        visibility: hidden;
    }
    .xscale {
        width:100%;
        text-align: center;
        top: 0;
    }
    .yscale {
        line-height: var(--hoehe);
        vertical-align: middle;
    }
    .symbol {
        vector-effect: non-scaling-stroke;
        transform-origin: center;
    }
</style>
<div style="font-family: Courier">
    <div id="charterrorname" style="background-color: rgba(255, 0, 0, 0.747); color: white"></div>
    <div id="charterrormessage"></div>
    <pre id="charterrorstack"></pre>
</div>
<div id="lms-chart">
    <div id="lms-chart-title"><slot name="title" class="label breite"></slot></div>
    <div id="lms-chart-xlabel"><slot name="xlabel" class="label breite"></slot></div>
    <div id="lms-chart-ylabel"><slot name="ylabel" class="label"></slot></div>
    <div id="lms-chart-y-scale" class="relative"></div>
    <div id="lms-chart-x-scale" class="relative"></div>
    <div id="chart-mit-overlay" class="relative breite hoehe">
        <svg id="lms-chart-svg" class="absolute breite hoehe">
            <defs>
                <marker id="lmsarrow" preserveAspectRatio="none" viewBox="-10 -2 10 4"
                     refX="-10" refY="0" markerWidth="10" markerHeight="4" orient="auto">
                    <path style="stroke: none;" d="M0 0 L -10 2 L -10 -2 z"></path>
                </marker>
                <clipPath id="clipgraph">
                    <rect id="clipgraphrect"></rect>
                </clipPath>
                <path class="symbol" id="lms-symbol-square" d="m-0.7071067 -0.7071067 h1.414213562373 v1.414213562373 h-1.414213562373 z"/>
                <path class="symbol" id="lms-symbol-circle" d="m-1 0 a1 1 180 0 0 2 0 a1 1 180 0 0 -2 0 z" />
                <path class="symbol" id="lms-symbol-cross" d="m-1 -1 l2 2 m-2 0 l2 -2" />
                <path class="symbol" id="lms-symbol-diamond" d="m-1 0 l1 1 l1 -1 l-1 -1 z" />
                <path class="symbol" id="lms-symbol-triangle" d="m0 -0.75 l0.86602540378 1.5 l-1.732050808 0 z" />
                <path class="symbol" id="lms-symbol-line" d="m-1 0 l2 0" />
            </defs>
            <path class="no-scaling-stroke" id="lms-chart-grid"></path>
            <path class="no-scaling-stroke" id="lms-chart-subgrid"></path>
            <line id="lms-chart-x-axis" class="axis no-scaling-stroke" marker-end="url(#lmsarrow)"></line>
            <line id="lms-chart-y-axis" class="axis no-scaling-stroke" marker-end="url(#lmsarrow)"></line>
        </svg>
        <div id="lms-chart-legend" class="absolute"><div id="lms-chart-legend-container"><slot name="legend-before"></slot><div id="lms-chart-legend-list"></div><slot name="legend-after"></slot></div></div>
        <div id="standardslot" class="absolute breite"><slot></slot></div>
        <div id="lms-chart-error" class="absolute breite"><slot name="error"></slot></div>
    </div>
</div>`


class ChartError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

class LmsChartContainer {
    constructor(parent) {
        this.parent = parent
        this.config = parent.config
        this.element = parent.template

        this.lmschartsvg = new LmsChartSvg(this)

        if (! this.config.xhidescale)
            this.configureXscale()
        if (! this.config.yhidescale)
            this.configureYscale()

        this.positionLegend()
    }

    appendGraphPaths(graphs) {
        for (let id in graphs ) {
            try {
                if (! graphs[id]['nolegend'])
                    this.lmschartsvg.appendLegendItem(id, graphs[id])
                this.lmschartsvg.appendGraph(id, graphs[id])
            }
            catch(err) {
                if (err instanceof ChartError)
                    this.parent.errormessage(err)
                else
                    throw err
            }
        }
    }

    configureXscale() {
        const xskala = this.element.getElementById("lms-chart-x-scale")
        for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
            if (i != 0)
                xskala.innerHTML += `<div class="xscale absolute" style="left: ${i*this.config.xscale-0.5*this.config.totalwidth-this.config.totalxmin}cm;">${i.toLocaleString('de-DE')}</div>`
        }
        xskala.innerHTML += `<div class="xscalehidden">Mg</div>`
    }

    configureYscale() {
        const yskala = this.element.getElementById("lms-chart-y-scale")
        for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
            if (i != 0) {
                yskala.innerHTML += `<div class="yscale absolute" style="right: 0.5em; top: ${this.config.totalymax-i*this.config.yscale-0.5*this.config.totalheight}cm;">${i.toLocaleString('de-DE')}</div>`
                yskala.innerHTML += `<div class="yscalehidden">${i.toLocaleString('de-DE')}</div>`
            }
        }
    }

    positionLegend() {
        const legend = this.element.getElementById("lms-chart-legend")
        legend.style.setProperty('--xpad', this.config.xlegendpadding)
        legend.style.setProperty('--ypad', this.config.ylegendpadding)
        switch (this.config.legendposition) {
            case 't':
                legend.style['justify-content'] = 'center'
                legend.style['align-items'] = 'flex-start'
                break
            case 'l':
                legend.style['justify-content'] = 'flex-start'
                legend.style['align-items'] = 'center'
                break
            case 'b':
                legend.style['justify-content'] = 'center'
                legend.style['align-items'] = 'flex-end'
                break
            case 'r':
                legend.style['justify-content'] = 'flex-end'
                legend.style['align-items'] = 'center'
                break
            case 'tl':
            case 'lt':
                legend.style['justify-content'] = 'flex-start'
                legend.style['align-items'] = 'flex-start'
                break
            case 'tr':
            case 'rt':
                legend.style['justify-content'] = 'flex-end'
                legend.style['align-items'] = 'flex-start'
                break
            case 'lb':
            case 'bl':
                legend.style['justify-content'] = 'flex-start'
                legend.style['align-items'] = 'flex-end'
                break
            case 'rb':
            case 'br':
                legend.style['justify-content'] = 'flex-end'
                legend.style['align-items'] = 'flex-end'
                break
            case 'none':
                legend.style['display'] = 'none'
                break
            default:
                legend.style['justify-content'] = 'flex-start'
                legend.style['align-items'] = 'flex-start'
                break
        }
    }
}

class LmsChartSvg {
    constructor(parent) {
        this.config = parent.config
        this.legendcontainer = parent.element.getElementById("lms-chart-legend-list")
        this.svg = parent.element.getElementById("lms-chart-svg")

        this.svg.setAttribute("preserveAspectRatio", 'none')
        this.svg.setAttribute("viewBox", `${this.config.totalxmin} ${-this.config.totalymax} ${this.config.totalwidth} ${this.config.totalheight}`)
        this.svg.setAttribute("width", `${this.config.totalwidth}cm`)
        this.svg.setAttribute("height", `${this.config.totalheight}cm`)

        this.linienbreite = 0.0352777778 // 1pt in cm

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
        let y = parseFloat(tupel[1])
        x = x*this.config.xscale
        y = - y*this.config.yscale
        if (isNaN(x))
            throw new ChartError(`${tupel[0]} ist keine Zahl.`)
        if (isNaN(y))
            throw new ChartError(`${tupel[1]} ist keine Zahl.`)
        return {x: x, y: y}
    }

    appendGraph(id, graphinfo) {
        const elements = []
        if (graphinfo['values'] !== null)
            elements[0] = this.createGraphElement(graphinfo.values, graphinfo.symbol, graphinfo.symbolsize)
        if (graphinfo['expr'] !== null) {
            const values = this.createValuesFromFunction(id, graphinfo)
            elements[1] = this.createGraphElement(values, graphinfo.symbol, graphinfo.symbolsize)
        }

        for (let element of elements) {
            if (! element)
                continue
            
            element.classList.add('graphpath')
            element.style['stroke'] = graphinfo.strokecolor
            element.style['fill'] = graphinfo.fillcolor
            element.style['stroke-width'] = graphinfo.linewidth
            element.style['clip-path'] = 'url(#clipgraph)'
            this.svg.appendChild(element)
        }
    }

    createGraphElement(values, symbol, size) {
        if (symbol == 'line')
            return this.createPathElement(values)
        else {
            return this.createSymbolGroup(values, symbol, size)
        }
    }

    createSymbolGroup(values, symbol, size) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
        for (let i=0; i<values.length; i++) {
            const point = this.tupelToPoint(values[i])
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use")
            use.setAttribute('href',`#lms-symbol-${symbol}`)
            use.setAttribute('x', point.x)
            use.setAttribute('y', point.y)
            use.setAttribute('transform-origin', `${point.x} ${point.y}`)
            use.style['transform'] = `scale(${size})`
            group.appendChild(use)
        }
        return group
    }

    createPathElement(values) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        let point = this.tupelToPoint(values[0])
        let dpath = `M${point.x} ${point.y}`
        for (let i=1; i<values.length; i++) {
            point = this.tupelToPoint(values[i])
            dpath += ` L${point.x} ${point.y}`
        }
        path.setAttribute("d", dpath)
        return path
    }

    createValuesFromFunction(id, graphinfo) {
        if (graphinfo['expr'] === null)
            return []
        
        let tupel = []
        if (graphinfo.start === null)
            graphinfo.start = this.config.xmin
        if (isNaN(graphinfo.start))
            throw new ChartError(`function (id=${id}): start ${graphinfo.start} ist keine Zahl.`)
        if (graphinfo.end === null)
            graphinfo.end = this.config.xmax
        if (isNaN(graphinfo.end))
            throw new ChartError(`function (id=${id}): end ${graphinfo.end} ist keine Zahl.`)
        if (graphinfo.step === null)
            graphinfo.step = this.config.xsubdelta
        if (isNaN(graphinfo.step))
            throw new ChartError(`function (id=${id}): end ${graphinfo.step} ist keine Zahl.`)
        if (graphinfo.step == 0)
            throw new ChartError(`function (id=${id}): step darf nicht null sein.`)
        if (graphinfo.step > 0 && graphinfo.start > graphinfo.end)
            throw new ChartError(`function (id=${id}): step > 0 aber end < start.`)
        if (graphinfo.step < 0 && graphinfo.start < graphinfo.end)
            throw new ChartError(`function (id=${id}): step < 0 aber end > start.`)


        const values = []
        for (let i = graphinfo.start; i < graphinfo.end && graphinfo.start < graphinfo.end || i > graphinfo.end && graphinfo.start > graphinfo.end; i += graphinfo.step) {
            try {
                tupel = [i, math.evaluate(graphinfo.expr, { 'x': i })]
                if (tupel[1] == Infinity)
                    throw new ChartError(`function (id=${id}): Bis zur Unendlichkeit und noch viel weiter...`)
                values.push(tupel)
            }
            catch(err) {
                throw new ChartError(err.message)
            }
        }

        return values
    }

    appendLegendItem(id, info) {
        const div = document.createElement('div')
        this.legendcontainer.appendChild(div)
        div.classList.add('legenditem')
        const symbolsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        symbolsvg.setAttribute('width', '5mm')
        symbolsvg.setAttribute('height', '5mm')
        symbolsvg.setAttribute('viewBox','-1.5 -1.25 3 2.5')
        div.appendChild(symbolsvg)
        const element = this.createSymbolGroup([[0,0]], info.symbol)
        symbolsvg.appendChild(element)
        element.classList.add('graphpath')
        element.style['stroke'] = info.strokecolor
        element.style['fill'] = info.fillcolor
        element.style['stroke-width'] = info.linewidth
        div.innerHTML += `<div>${info.name ? info.name : id}</div>`
    }

    drawXaxis() {
        const element = this.svg.getElementById("lms-chart-x-axis")
        element.setAttribute("x1", this.config.totalxmin)
        element.setAttribute("y1", 0)
        element.setAttribute("x2", this.config.totalxmax-10*this.linienbreite)
        element.setAttribute("y2", 0)
    }

    drawYaxis() {
        const element = this.svg.getElementById("lms-chart-y-axis")
        element.setAttribute("x1", 0)
        element.setAttribute("y1", -this.config.totalymin)
        element.setAttribute("x2", 0)
        element.setAttribute("y2", -this.config.totalymax + 10*this.linienbreite)
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
        
        const element = this.svg.getElementById("lms-chart-grid")
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

        const element = this.svg.getElementById("lms-chart-subgrid")
        element.setAttribute("d", dsubgrid)
    }
}

class LmsChartConfig {
    constructor(configobject) {
        Object.assign(this, configobject)

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

class LmsChart extends HTMLElement {

    connectedCallback() {
        try {
            this.template = lmsChartTemplate.content.cloneNode(true)
            this.create();
        }
        catch(err) {
            this.template.getElementById('charterrorname').innerHTML = err.name
            this.template.getElementById('charterrormessage').innerHTML = err.message
            this.template.getElementById('charterrorstack').innerHTML = err.stack
            this.template.getElementById('lms-chart').style.display = 'none'
        }
        finally {
            const schatten = this.attachShadow({mode: "open"})
            schatten.appendChild(this.template)

            const tmpele = this.querySelector("[slot=ylabel]")
            if (! tmpele) {
                this.style.setProperty('--ylabelbreite', '0px')
            }
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
            fillcolor: null,
            strokecolor: 'blue',
            symbol: 'line',
            linewidth: '1.3pt',
            symbolsize: 0.15,
            nolegend: false,
            name: null
        }

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

        try {
            this.config = new LmsChartConfig(this.configobject)
            this.setCSSVariables()
            const lmschartcontainer = new LmsChartContainer(this)
            lmschartcontainer.appendGraphPaths(this.graphs)
        }
        catch(err) {
            if (err instanceof ChartError) {
                this.errormessage(err.message)
            }
            else {
                throw err
            }
        }
    }

    setCSSVariables() {
        this.style.setProperty('--breite', `${this.config.totalwidth}cm`)
        this.style.setProperty('--hoehe', `${this.config.totalheight}cm`)
    }

    parseGridAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length < 2) {
            this.errormessage(`${attr.name}: Falsches Format. grid-[eigenschaft] gefordert.`)
            return
        }
        if (attrinfo[1] == '') {
            this.errormessage(`${attr.name}: Falsches Format. Eigenschaft fehlt.`)
            return
        }
        
        const gridprop = attrinfo[1]
        if (! this.gridkeys.includes(gridprop)) {
            this.errormessage(`${attr.name}: Erlaubte Eigenschaften: ${this.gridkeys.join(", ")}.`)
            return
        }
        switch(gridprop) {
            case 'xsize':
            case 'ysize':
            case 'xsize':
            case 'ysize':
            case 'xdelta':
            case 'ydelta':
            case 'xsubdelta':
            case 'ysubdelta':
            case 'xmin':
            case 'xmax':
            case 'ymin':
            case 'ymax':
                const number = Number(attr.value)
                if (isNaN(number)) return
                this.configobject[gridprop] = number
                break;
            case 'xhidegrid':
            case 'yhidegrid':
            case 'xhidesubgrid':
            case 'yhidesubgrid':
            case 'xhideaxis':
            case 'yhideaxis':
            case 'xhidescale':
            case 'yhidescale':
                this.configobject[gridprop] = ! ["0", "false"].includes(attr.value)
                break;
            default:
                this.configobject[gridprop] = attr.value
        }
    }

    parseGraphAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length != 3) {
            this.errormessage(`${attr.name}: Falsches Format. xy-[typ]-[id] gefordert.`)
            return
        }
        if (attrinfo[2] == '') {
            this.errormessage(`${attr.name}: Falsches Format. id fehlt`)
            return
        }

        const graphid = attrinfo[2]
        const graphprop = attrinfo[1]
        if (! this.graphkeys.includes(graphprop)) {
            this.errormessage(`${attr.name}: Erlaubt sind nur ${this.graphkeys.join(', ')}`)
            return
        }

        if (!(graphid in this.graphs))
            this.graphs[graphid] = {...this.emptygraph}

        switch(graphprop) {
            case 'values':
                try {
                    this.graphs[graphid][graphprop] = JSON.parse(attr.value)
                }
                catch(err) {
                    this.errormessage(err)
                }
                break;
            case 'start':
            case 'end':
            case 'step':
            case 'symbolsize':
                const number = Number(attr.value)
                this.graphs[graphid][graphprop] = number
                break;
            case 'nolegend':
                this.graphs[graphid][graphprop] = ! ["0", "false"].includes(attr.value)
                break;
            default:
                this.graphs[graphid][graphprop] = attr.value
        }
    }

    errormessage(msg) {
        this.innerHTML += `<div slot="error">${msg}</div>`
    }
}

customElements.define('lms-chart', LmsChart);
