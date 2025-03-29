var xyChartTemplate = document.createElement('template')
xyChartTemplate.innerHTML = `<style>
    :host {
        display: block;
        width: fit-content;
        --grid-ticklinelengthin: .2;
        --grid-ticklinelengthout: .2;
        --grid-tickgaplinenumber: .1;
        --breite: 15;
        --hoehe: 10;
        --yaxispos: 0;
        --xaxispos: 0;
        --pt: 0.0352777778px;
        --legendvisibility: visible;
        --path: path('m-0.15 -0.15 l0.3 0.3 m-0.3 0 l0.3 -0.3');
    }
    #chart {
        display: grid;
        grid-template-columns: auto auto auto;
        grid-template-areas:
            ".      title"
            "ylabel chart"
            ".      xlabel";
    }
    #charterrorname, #charterrormessage, #charterrorstack {
        font-family: Courier;
    }
    #charterrorname {
        background-color: red;
        color: white;
    }
    #error {
        grid-area: error;
        position: absolute;
        background-color: red;
        color: white;
        font-family: 'Courier New', Courier, monospace;
    }
    #overlaycontainer {
        position: relative;
        grid-area: chart;
        width: calc(var(--breite) * 1cm);
        height: calc(var(--hoehe) * 1cm);
    }
    #legend {
        position: absolute;
        width: fit-content;
        display: flex;
        background-color: white;
        padding: 1mm;
        border: 0.5pt solid gray;
        border-radius: 2mm;
        visibility: var(--legendvisibility);
    }
    #svg {
        grid-area: chart;
        overflow: visible;
        position: absolute;
    }
    #title {
        grid-area: title;
        width: var(--breite)cm;
        text-align: center;
    }
    #xlabel {
        grid-area: xlabel;
        width: var(--breite)cm;
        text-align: center;
    }
    #ylabel {
        grid-area: ylabel;
        writing-mode: vertical-rl;
        rotate: 180deg;
        height: calc(var(--hoehe) * 1cm);
        text-align: center;
    }
    #xaxislabel {
        position: absolute;
        text-align: right;
        line-height: 1;
        width: calc(var(--breite) * 1cm);
        top: calc(min(var(--xaxispos) * 1cm, var(--hoehe) * 1cm) + var(--grid-ticklinelengthout) * 1cm + var(--grid-tickgaplinenumber) * 1cm );
    }
    #yaxislabel {
        position: absolute;
        text-align: right;
        right: calc( min(var(--breite)* 1cm - var(--yaxispos) * 1cm, var(--breite) * 1cm) + var(--grid-ticklinelengthout) * 1cm + var(--grid-tickgaplinenumber) * 1cm);
    }
    #standardslot {
        position: absolute;
    }
    #xaxisline, #yaxisline {
        fill: none;
        stroke: black;
        stroke-width: 1pt;
    }
    #xnumbers {
        font-size: calc(var(--tick-font-size-pt, 12) * var(--pt));
        text-anchor: middle;
        dominant-baseline: text-before-edge;
        transform: translate(0, calc(var(--grid-ticklinelengthout) * 1px + var(--grid-tickgaplinenumber) * 1px));
    }
    #ynumbers {
        font-size: calc(var(--tick-font-size-pt, 12) * var(--pt));
        text-anchor: end;
        dominant-baseline: central;
        transform: translate(calc(var(--grid-tickgaplinenumber) * -1px), 0);
    }
    #symbol-custompath {
        d: var(--path);
        transform: var(--transform);
    }
    .no-scaling-stroke {
        vector-effect: non-scaling-stroke;
    }
    .grid, .subgrid {
        fill: none;
        stroke: grey;
        stroke-width: 0.9pt;
        stroke-linecap: square;
    }
    .subgrid {
        stroke-width: 0.3pt;
    }
    .legenditem {
        display: flex;
        align-items: center;
    }
    .ticklines {
        stroke-width: 1pt;
        stroke: black;
    }
    .symbol {
        vector-effect: non-scaling-stroke;
        transform-origin: center;
        transform-box: fill-box;
    }
</style>
<div>
    <div id="charterrorname"></div>
    <div id="charterrormessage"></div>
    <div id="charterrorstack" style="margin: 0;"></div>
</div>
<div id="chart" part="chart">
    <div id="title"><slot name="title"></slot></div>
    <div id="xlabel"><slot name="xlabel"></slot></div>
    <div id="ylabel"><slot name="ylabel"></slot></div>
    <div id="overlaycontainer">
        <div style="position: absolute"><slot name="under"></slot></div>
        <svg id="svg">
            <defs>
                <marker id="fancyarrow" preserveAspectRatio="none" viewBox="-10 -2 10 4"
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
                <path class="symbol" id="symbol-custompath" />
            </defs>
            <g id="grids" class="grids">
                <path id="grid" part="grid" class="no-scaling-stroke grid"></path>
                <path id="subgrid" part="subgrid" class="no-scaling-stroke subgrid"></path>
            </g>
            <g id="xaxis" class="xaxis">
                <line id="xaxisline" part="xaxisline" class="no-scaling-stroke" marker-end="url(#fancyarrow)"></line>
                <path id="xticklines" part="xticklines" class="ticklines no-scaling-stroke" />
                <g id="xnumbers" class="xnumbers"/>
            </g>
            <g id="yaxis" class="yaxis">
                <line id="yaxisline" part="yaxisline" class="no-scaling-stroke" marker-end="url(#fancyarrow)"></line>
                <path id="yticklines" part="yticklines" class="ticklines no-scaling-stroke" />
                <g id="ynumbers" class="ynumbers" />
            </g>
            <g id="graphs" clip-path="url(#clipgraph)"></g>
        </svg>
        <div id="legend" part="legend">
            <slot name="legend-before" id="legend-before"></slot>
            <div id="legend-list"></div>
            <slot name="legend-after" id="legend-after"></slot>
        </div>
        <div id="xaxislabel"><slot name="xaxislabel"></slot></div>
        <div id="yaxislabel"><slot name="yaxislabel"></slot></div>
        <slot></slot>
        <div id="error"></div>
    </div>
</div>`


class ChartError extends Error {}

class ChartSvg {
    constructor(config, element) {
        this.config = config
        this.element = element
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

        this.drawXaxis()
        this.drawYaxis()

        this.drawXTicks()
        this.drawYTicks()

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
            use.setAttribute('href', `#symbol-${graphinfo.symbol}`)
            use.setAttribute('x', point.x)
            use.setAttribute('y', point.y)
            use.setAttribute('part', `graph${graphinfo.id}`)
            group.appendChild(use)
        }
        group.style['stroke'] = graphinfo.strokecolor
        group.style['stroke-width'] = '1.3pt'
        group.style['fill'] = "none"

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
        path.style['stroke'] = `var(--graph${graphinfo.id}-stroke, ${graphinfo.strokecolor})`
        path.style['stroke-width'] = `var(--${graphinfo.id}-width, 1.3pt)`
        path.style['fill'] = `var(--${graphinfo.id}-fill, none)`
        path.style['vector-effect'] = "non-scaling-stroke"
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

        if (start == end)
            throw new ChartError(`start = end ist unsinnig.`)
        
        const values = []
        for (let i = start; i < end && start <= end || i > end && start >= end; i += step) {
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

        // Der obere Wert wird aufgrund möglicher Fließkommazahlenfehlern extra berechnet
        tupel = [end, math.evaluate(graphinfo.expr, { 'x': end })]
        if (tupel[1] == Infinity)
            throw new ChartError(`Bis zur Unendlichkeit und noch viel weiter...`)
        values.push(tupel)
        
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
        symbolsvg.setAttribute('viewBox', `-0.25 -0.25 .5 .5`)
        div.appendChild(symbolsvg)
        const element = this.createSymbolGroup([[0,0]], info)
        symbolsvg.appendChild(element)
        div.innerHTML += `<div>${info.name ? info.name : (info.expr ? info.expr : info.id)}</div>`
    }

    hasEmptyLegendList() {
        return this.legendlist.childElementCount == 0
    }

    drawXaxis() {
        let y = 0;
        if (this.config.ymin > 0) {
            y = -this.config.totalymin
        }
        const element = this.svg.getElementById("xaxisline")
        element.setAttribute("x1", this.config.totalxmin)
        element.setAttribute("y1", y)
        element.setAttribute("x2", this.config.totalxmax-10*this.linewidth)
        element.setAttribute("y2", y)
        if (this.config.xhideaxis)
            element.style.display = 'none'
    }

    drawYaxis() {
        let x = 0;
        if (this.config.xmin > 0) {
            x = this.config.totalxmin
        }
        const element = this.svg.getElementById("yaxisline")
        element.setAttribute("x1", x)
        element.setAttribute("y1", -this.config.totalymin)
        element.setAttribute("x2", x)
        element.setAttribute("y2", -this.config.totalymax + 10*this.linewidth)
        if (this.config.yhideaxis)
            element.style.display = 'none'
    }

    drawXTicks() {
        const numbergroup = this.svg.getElementById("xnumbers")
        const container = this.element.getElementById("overlaycontainer")
        const observer = new ResizeObserver(this.setSpaceBottom.bind(this, numbergroup, container))
        observer.observe(numbergroup)
        let path=""
        for (let i = this.config.xmin; i < this.config.xmax; i += this.config.xdelta) {
            if (i == 0) continue
            let pos = i*this.config.xscale
            path += `M${pos}, ${this.config.ticklinelengthout} L${pos}, -${this.config.ticklinelengthin}`
            this.addNumber(numbergroup, i, pos, 0)
        }
        if (this.config.ticklinelengthout != 0 || this.config.ticklinelengthin != 0) {
            const element = this.svg.getElementById("xticklines")
            element.setAttribute("d", path)
        }
        if (this.config.xhideticknumbers) 
            numbergroup.style.display = "none"
    }

    drawYTicks() {
        const numbergroup = this.svg.getElementById("ynumbers")
        const container = this.element.getElementById("overlaycontainer")
        const observer = new ResizeObserver(this.setSpaceLeft.bind(this, numbergroup, container, this.element.getElementById("yaxislabel")))
        observer.observe(numbergroup)
        let path = ""
        for (let i = this.config.ymin; i < this.config.ymax; i += this.config.ydelta) {
            if (i == 0) continue
            let pos = -i*this.config.yscale
            path += `M-${this.config.ticklinelengthout},${pos} L${this.config.ticklinelengthin},${pos}`
            this.addNumber(numbergroup, i, -this.config.ticklinelengthout, pos)
        }
        if (this.config.ticklinelengthout != 0 || this.config.ticklinelengthin != 0) {
            const element = this.svg.getElementById("yticklines")
            element.setAttribute("d", path)
        }
        if (this.config.yhideticknumbers) 
            numbergroup.style.display = "none"
    }

    addNumber(element, number, x, y) {
        element.innerHTML += `<text x="${x}" y="${y}" >${number}</text>`
    }

    setSpaceBottom(numbergroup, container) {
        let rect = numbergroup.getBoundingClientRect()
        let svgrect = this.svg.getBoundingClientRect()
        container.style['margin-bottom'] = `max(${rect.bottom-svgrect.bottom}px, 0px)`
    }

    setSpaceLeft(numbergroup, container, label) {
        let rect = numbergroup.getBoundingClientRect()
        let svgrect = this.svg.getBoundingClientRect()
        let labelrect = label.getBoundingClientRect()
        container.style['margin-left'] = `max(${svgrect.left-rect.left}px, ${svgrect.left-labelrect.left}px, 0px)`
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
    }

    positionLegend() {
        const legend = this.element.getElementById("legend")
        switch (this.config.legendposition) {
            case 't':
                legend.style['margin-left'] = '50%'
                legend.style['transform'] = 'translate(-50%, 0)'
                legend.style['top'] = this.config.ylegendpadding
                break
            case 'l':
                legend.style['margin-top'] = '50%'
                legend.style['transform'] = 'translate(0, -50%)'
                legend.style['left'] = this.config.xlegendpadding
                break
            case 'b':
                legend.style['margin-left'] = '50%'
                legend.style['transform'] = 'translate(-50%, 0)'
                legend.style['bottom'] = this.config.ylegendpadding
                break
            case 'r':
                legend.style['margin-top'] = '50%'
                legend.style['transform'] = 'translate(0, -50%)'
                legend.style['right'] = this.config.xlegendpadding
                break
            case 'tl':
            case 'lt':
                legend.style['top'] = this.config.ylegendpadding
                legend.style['left'] = this.config.xlegendpadding
                break
            case 'tr':
            case 'rt':
                legend.style['top'] = this.config.ylegendpadding
                legend.style['right'] = this.config.xlegendpadding
                break
            case 'lb':
            case 'bl':
                legend.style['bottom'] = this.config.ylegendpadding
                legend.style['left'] = this.config.xlegendpadding
                break
            case 'rb':
            case 'br':
                legend.style['bottom'] = this.config.ylegendpadding
                legend.style['right'] = this.config.xlegendpadding
                break
            case 'none':
                legend.style['display'] = 'none'
                break
            default:
                legend.style['top'] = this.config.ylegendpadding
                legend.style['right'] = this.config.xlegendpadding
                break
        }
    }
}

class ChartConfig {
    constructor(configobject) {
        Object.assign(this, configobject)

        let arr = this.size.trim().split(/[ \t]+/)
        this.xsize = arr[0] || 1
        this.ysize = arr[1] || arr[0] || 1

        arr = this.range.trim().split(/[ \t]+/)
        switch(arr.length) {
            case 1:
                this.xmin = 0
                this.ymin = 0
                this.xmax = arr[0]
                this.ymax = arr[0]
                break
            case 2:
                this.xmin = 0
                this.ymin = 0
                this.xmax = arr[0]
                this.ymax = arr[1]
                break
            case 4:
                this.xmin = arr[0]
                this.ymin = arr[1]
                this.xmax = arr[2]
                this.ymax = arr[3]
                break
            default:
                throw new ChartError(`grid-range muss ein, zwei oder vier durch Whitespace grtrennte Zahlen besitzen: 'max', 'min max' oder 'xmin ymin xmax ymax'.`)
        }

        arr = this.delta.trim().split(/[ \t]+/)
        switch(arr.length) {
            case 2:
                this.xdelta = arr[0]
                this.ydelta = arr[0]
                this.xsubdelta = arr[1]
                this.ysubdelta = arr[1]
                break
            case 4:
                this.xdelta = arr[0]
                this.ydelta = arr[1]
                this.xsubdelta = arr[2]
                this.ysubdelta = arr[3]
                break
            default:
                throw new ChartError(`grid-delta muss zwei oder vier durch Whitespace grtrennte Zahlen besitzen. 'delta subdelta' oder 'xdelta ydelta xsubdelta ysubdelta'`)
        }

        arr = this.hidegrid.trim().split(/[ \t]+/)
        switch(arr.length) {
            case 1:
                this.xhidegrid = arr[0]
                this.yhidegrid = arr[0]
                this.xhidesubgrid = arr[0]
                this.yhidesubgrid = arr[0]
                break
            case 2:
                this.xhidegrid = arr[0]
                this.yhidegrid = arr[0]
                this.xhidesubgrid = arr[1]
                this.yhidesubgrid = arr[1]
                break
            case 4:
                this.xhidegrid = arr[0]
                this.yhidegrid = arr[1]
                this.xhidesubgrid = arr[2]
                this.yhidesubgrid = arr[3]
                break
            default:
                throw new ChartError(`grid-hide muss ein, zwei oder vier durch Whitespace grtrennte Zahlen besitzen. 'hideall', 'hide hidesub' oder 'xhide yhide xhidesub yhidesub'`)
        }

        arr = this.hideaxis.trim().split(/[ \t]+/)
        this.xhideaxis = arr[0] || 0
        this.yhideaxis = arr[1] || arr[0] || 0

        arr = this.hideticknumbers.trim().split(/[ \t]+/)
        this.xhideticknumbers = arr[0] || 0
        this.yhideticknumbers = arr[1] || arr[0] || 0

        arr = this.ticklinelength.trim().split(/[ \t]+/)
        this.ticklinelengthin = arr[0] || 0.2
        this.ticklinelengthout = arr[1] || arr[0] || 0.2

        arr = this.legendpadding.trim().split(/[ \t]+/)
        this.xlegendpadding = arr[0] || '2mm'
        this.ylegendpadding = arr[1] || arr[0] || '2mm'

        for (let prop of ['xsize','ysize','xdelta','ydelta','xsubdelta','ysubdelta']) {
            this[prop] = parseFloat(this[prop])
            if (isNaN(this[prop]) || this[prop] <= 0)
                throw new ChartError(`${prop} muss eine positive Zahl größer 0 sein.`)
        }

        for (let prop of ['xmax','xmin','ymax','ymin','tickgaplinenumber','ticklinelengthin','ticklinelengthout']) {
            this[prop] = parseFloat(this[prop])
            if (isNaN(this[prop]))
                throw new ChartError(`${prop} muss eine Zahl sein.`)
        }

        for (let prop of ['xhidegrid','yhidegrid','xhidesubgrid','yhidesubgrid','xhideaxis','yhideaxis','xhideticknumbers','yhideticknumbers']) {
            this[prop] = ! ["0", "false", false].includes(this[prop])
        }

        this.xscale = this.xsize/this.xdelta
        this.yscale = this.ysize/this.ydelta
        this.width = this.xmax - this.xmin
        if (this.width <= 0) throw new ChartError('xmin >= xmax')
        this.height = this.ymax - this.ymin
        if (this.height <= 0) throw new ChartError('ymin >= ymax')

        this.totalwidth = this.width*this.xscale
        this.totalheight = this.height*this.yscale
        this.totalxmin = this.xmin*this.xscale
        this.totalymin = this.ymin*this.yscale
        this.totalxmax = this.xmax*this.xscale
        this.totalymax = this.ymax*this.yscale
    }
}


function slotChanged(event, element) {
    const tmpele = event.target.attributes["name"]
    if (!tmpele)
        return
    switch(tmpele.value) {
        case("legend-before"):
        case("legend-after"):
            element.chartelement.style.setProperty('--legendvisibility', "visible")
            break
    }
}

class XYGraphs extends HTMLElement {

    connectedCallback() {
        try {
            this.template = xyChartTemplate.content.cloneNode(true)
            this.errorelement = this.template.getElementById('error')
            this.chartelement = this.template.getElementById('chart')
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
                this.chartelement.style.display = 'none'
            }
        }
        finally {
            const shadow = this.attachShadow({mode: "open"})
            shadow.appendChild(this.template)
            shadow.addEventListener('slotchange', (event) => slotChanged(event, this))
        }
    }

    create() {
        this.configobject = {
            range: this.getCSSVariable('--grid-range') || '0 0 10 10',
            size: this.getCSSVariable('--grid-size') || '1 1',
            delta: this.getCSSVariable('--grid-delta') || '1 1 0.2 0.2',
            hidegrid: this.getCSSVariable('--grid-hidegrid') || '0 0 0 0',
            hideaxis: this.getCSSVariable('--grid-hideaxis') || '0 0',
            hideticknumbers: this.getCSSVariable('--grid-hideticknumbers') || '0 0',
            ticklinelength: this.getCSSVariable('--grid-ticklinelength') || '0.2 0.2',
            tickgaplinenumber: this.getCSSVariable('--grid-tickgaplinenumber') || 0.1,
            legendpadding: this.getCSSVariable('--grid-legendpadding') || '2mm 2mm',
            legendposition: this.getCSSVariable('--grid-legendposition') || 'tl',
        }
        this.emptygraph = {
            values: null,
            expr: null,
            start: null,
            end: null,
            step: null,
            symbol: 'line',
            nolegend: false,
            name: null
        }
        this.graphorder = 0
        this.symbols = [
            "square",
            "circle",
            "cross",
            "diamond",
            "triangle",
            "line",
            "custompath"
        ]

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
        if (chartcontainer.chartsvg.hasEmptyLegendList()) {
            this.chartelement.style.setProperty('--legendvisibility', 'collapse')
        }
    }

    getCSSVariable(name) {
        return getComputedStyle(this).getPropertyValue(name)
    }

    setCSSVariables() {
        this.style.setProperty('--breite', `${this.config.totalwidth}`)
        this.style.setProperty('--hoehe', `${this.config.totalheight}`)
        this.style.setProperty('--xaxispos', `${this.config.ymax*this.config.yscale}`)
        this.style.setProperty('--yaxispos', `${-this.config.xmin*this.config.xscale}`)
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

        if (graphprop == 'symbol' && ! this.symbols.includes(attr.value))
            throw new ChartError(`${attr.name}: ${attr.value} unbekannt. Erlaubt sind nur ${this.symbols.join(', ')}`)

        if (!(graphid in this.graphs))
            this.graphs[graphid] = {...this.emptygraph, id: graphid, order: this.graphorder++ }

        this.graphs[graphid][graphprop] = attr.value
    }

    errormessage(msg) {
        this.errorelement.innerHTML += `<div slot="error">${msg}</div>`
    }
}

customElements.define('xy-graphs', XYGraphs);
