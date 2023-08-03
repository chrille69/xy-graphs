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

    appendDataPaths(xys) {
        for (let bezeichnung in xys ) {
            try {
                this.lmschartsvg.appendLegendItem(bezeichnung, xys[bezeichnung])
                this.lmschartsvg.appendDataPath(bezeichnung, xys[bezeichnung])
            }
            catch(err) {
                if (err instanceof ChartError)
                    this.parent.errormessage(err)
                else
                    throw err
            }
        }
    }

    appendFunctionPaths(functions) {
        for (let bezeichnung in functions ) {
            try {
                this.lmschartsvg.appendLegendItem(bezeichnung, functions[bezeichnung])
                this.lmschartsvg.appendFunctionPath(bezeichnung, functions[bezeichnung])
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
        this.legendcontainer = parent.element.getElementById("lms-chart-legend-container")
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

    drawSegment(point, style, symbolsize) {
        const x = point.x
        const y = point.y

        if (!style)
            return `${x} ${y}`
        
        switch (style) {
            case 'line':
                return ` L${x} ${y}`
            case 'circle':
                return ` M${x-symbolsize} ${y} a${symbolsize} ${symbolsize} 180 0 0 ${2*symbolsize} 0 a${symbolsize} ${symbolsize} 180 0 0 ${-2*symbolsize} 0 z`
            case 'cross':
                return ` M${x-symbolsize} ${y-symbolsize} l${2*symbolsize} ${2*symbolsize} m${-2*symbolsize} 0 l${2*symbolsize} ${-2*symbolsize}`
            case 'square':
                return ` M${x-symbolsize} ${y-symbolsize} l${2*symbolsize} 0 l0 ${2*symbolsize} l${-2*symbolsize} 0 z`
            case 'diamond':
                return ` M${x-symbolsize} ${y} l${symbolsize} ${symbolsize} l${symbolsize} ${-symbolsize} l${-symbolsize} ${-symbolsize} z`
            case 'triangle':
                return ` M${x} ${y-symbolsize} l ${this.cos30*symbolsize} ${(1+this.sin30)*symbolsize} l${-2*this.cos30*symbolsize} 0 z`
            default:
                return ` L${x} ${y}`
        }
    }

    appendDataPath(id, xyinfo) {
        let point
        if (!xyinfo.values)
            throw new ChartError(`xy (id=${id}): Keine Werte vorhanden.`)
        if (! Array.isArray(xyinfo.values))
            throw new ChartError(`xy (id=${id}): values muss ein zweidimensionales Array sein.`)
        point = this.tupelToPoint(xyinfo.values[0])
        let dpath = `M${this.drawSegment(point)}`
        for (let i=1; i<xyinfo.values.length; i++) {
            point = this.tupelToPoint(xyinfo.values[i])
            dpath += this.drawSegment(point, xyinfo.style, xyinfo.symbolsize)
        }
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path")
        element.classList.add('datapath')
        element.style['stroke'] = xyinfo.strokecolor
        element.style['fill'] = xyinfo.fillcolor
        element.style['stroke-width'] = xyinfo.linewidth
        element.style['clip-path'] = 'url("#clipgraph")'
        element.setAttribute("d", dpath)
        this.svg.appendChild(element)
    }

    appendFunctionPath(id, funcinfo) {
        let tupel = []
        let dpath = ''
        let point
        if (isNaN(funcinfo.start))
            throw new ChartError(`function (id=${id}): start ${funcinfo.start} ist keine Zahl.`)
        if (isNaN(funcinfo.end))
            throw new ChartError(`function (id=${id}): end ${funcinfo.end} ist keine Zahl.`)
        if (isNaN(funcinfo.step))
            throw new ChartError(`function (id=${id}): end ${funcinfo.step} ist keine Zahl.`)
        if (funcinfo.step == 0)
            throw new ChartError(`function (id=${id}): step darf nicht null sein.`)
        if (funcinfo.step > 0 && funcinfo.start > funcinfo.end)
            throw new ChartError(`function (id=${id}): step > 0 aber end < start.`)
        if (funcinfo.step < 0 && funcinfo.start < funcinfo.end)
            throw new ChartError(`function (id=${id}): step < 0 aber end > start.`)

        try {
            tupel = [funcinfo.start, math.evaluate(funcinfo.expr, { 'x': funcinfo.start })]
        }
        catch(err) {
            throw new ChartError(err.message)
        }
        if (tupel[1] == Infinity)
            throw new ChartError(`function (id=${id}): Bis zur Unendlichkeit und noch viel weiter...`)
        point = this.tupelToPoint(tupel)
        dpath = `M${this.drawSegment(point)}`

        for (let i = funcinfo.start; i < funcinfo.end && funcinfo.start < funcinfo.end || i > funcinfo.end && funcinfo.start > funcinfo.end; i += funcinfo.step) {
            try {
                tupel = [i, math.evaluate(funcinfo.expr, { 'x': i })]
            }
            catch(err) {
                throw new ChartError(err.message)
            }
            if (tupel[1] == Infinity)
                throw new ChartError(`function (id=${id}): Bis zur Unendlichkeit und noch viel weiter...`)
            point = this.tupelToPoint(tupel)
            dpath += this.drawSegment(point, funcinfo.style, funcinfo.symbolsize)
        }
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path")
        element.classList.add('functionpath')
        element.style['stroke'] = funcinfo.strokecolor
        element.style['fill'] = funcinfo.fillcolor
        element.style['stroke-width'] = funcinfo.linewidth
        element.style['clip-path'] = 'url(#clipgraph)'
        element.setAttribute("d", dpath)
        this.svg.appendChild(element)
    }

    appendLegendItem(id, info) {
        const symbolsize = info.symbolsize
        const div = document.createElement('div')
        this.legendcontainer.appendChild(div)
        div.classList.add('legenditem')
        const symbolsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        symbolsvg.setAttribute('width',`${5*symbolsize}cm`)
        symbolsvg.setAttribute('height',`${3*symbolsize}cm`)
        symbolsvg.setAttribute('viewBox',`${-2.5*symbolsize} ${-1.5*symbolsize} ${5*symbolsize} ${3*symbolsize}`)
        div.appendChild(symbolsvg)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        symbolsvg.appendChild(path)
        let d
        if (info.style == 'line') {
            d = `M${this.drawSegment({x: -2*symbolsize, y: 0})}`
            d += this.drawSegment({x: 2*symbolsize, y: 0}, info.style, symbolsize)
        }
        else {
            d = `M${this.drawSegment({x: 0, y: 0})}`
            d += this.drawSegment({x: 0, y: 0}, info.style, symbolsize)
        }
        path.classList.add('datapath')
        path.setAttribute('d', d)
        path.style['stroke'] = info.strokecolor
        path.style['fill'] = info.fillcolor
        path.style['stroke-width'] = info.linewidth
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
            let template = document.getElementById("lms-chart-template")
            this.template = template.content.cloneNode(true)
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
        this.emptyfunction = {
            expr: null,
            start: 0,
            end: 10,
            step: 0.1,
            fillcolor: null,
            strokecolor: 'blue',
            style: 'line',
            linewidth: '1.3pt',
            symbolsize: 0.15,
            name: null
        }
        this.emptyxy = {
            values: null,
            fillcolor: null,
            strokecolor: 'red',
            style: 'line',
            linewidth: '1.3pt',
            symbolsize: 0.15,
            name: null
        }

        this.gridkeys = Object.keys(this.configobject)
        this.functionkeys = Object.keys(this.emptyfunction)
        this.xykeys = Object.keys(this.emptyxy)

        this.functions = {}
        this.xys = {}
        for (let attr of this.attributes) {
            if (attr.name.startsWith('function-')) {
                this.parseFunctionAttribute(attr)
            }
            else if (attr.name.startsWith('xy-')) {
                this.parseXYAttribute(attr)
            }
            else if (attr.name.startsWith('grid-')) {
                this.parseGridAttribute(attr)
            }
        }

        try {
            this.config = new LmsChartConfig(this.configobject)
            this.setCSSVariables()
            const lmschartcontainer = new LmsChartContainer(this)
            lmschartcontainer.appendDataPaths(this.xys)
            lmschartcontainer.appendFunctionPaths(this.functions)
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

    parseFunctionAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length != 3) {
            this.errormessage(`${attr.name}: Falsches Format. xy-[typ]-[id] gefordert.`)
            return
        }
        if (attrinfo[2] == '') {
            this.errormessage(`${attr.name}: Falsches Format. id fehlt`)
            return
        }

        const funcname = attrinfo[2]
        const functyp = attrinfo[1]
        if (! this.functionkeys.includes(functyp)) {
            this.errormessage(`${attr.name}: Erlaubt sind nur ${this.functionkeys.join(', ')}`)
            return
        }

        if (!(funcname in this.functions))
            this.functions[funcname] = {...this.emptyfunction}

        switch(functyp) {
            case 'start':
            case 'end':
            case 'step':
            case 'symbolsize':
                const number = Number(attr.value)
                if (isNaN(number)) return
                this.functions[funcname][functyp] = number
                break;
            default:
                this.functions[funcname][functyp] = attr.value
        }
    }

    parseXYAttribute(attr) {
        const attrinfo = attr.name.split('-')
        if (attrinfo.length != 3) {
            this.errormessage(`${attr.name}: Falsches Format. xy-[typ]-[id] gefordert.`)
            return
        }
        if (attrinfo[2] == '') {
            this.errormessage(`${attr.name}: Falsches Format. id fehlt`)
            return
        }

        const xyname = attrinfo[2]
        const xytyp = attrinfo[1]
        if (! this.xykeys.includes(xytyp)) {
            this.errormessage(`${attr.name}: Falscher typ. Erlaubt sind nur ${this.xykeys.join(', ')}`)
            return
        }

        if (!(xyname in this.xys))
            this.xys[xyname] = {...this.emptyxy}

        switch(xytyp) {
            case 'values':
                try {
                    this.xys[xyname][xytyp] = JSON.parse(attr.value)
                }
                catch(err) {
                    this.errormessage(err)
                }
                break;
            case 'symbolsize':
                const number = Number(attr.value)
                if (isNaN(number)) return
                this.xys[xyname][xytyp] = number
                break;
            default:
                this.xys[xyname][xytyp] = attr.value
        }
    }

    errormessage(msg) {
        this.innerHTML += `<div slot="error">${msg}</div>`
    }
}

customElements.define('lms-chart', LmsChart);
