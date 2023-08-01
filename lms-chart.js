class ChartError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

class LmsChart extends HTMLElement {
    constructor() {
        super();
        let template = document.getElementById("lms-chart-template")
        this.content = template.content.cloneNode(true)
        const schatten = this.attachShadow({mode: "open"})
        schatten.appendChild(this.content)
        try {
            this.create();
        }
        catch(err) {
            this.shadowRoot.getElementById('charterrorname').innerHTML = err.name
            this.shadowRoot.getElementById('charterrormessage').innerHTML = err.message
            this.shadowRoot.getElementById('charterrorstack').innerHTML = err.stack
            this.shadowRoot.getElementById('lms-chart').style.display = 'none'
        }
    }

    create() {
        this.gridobject = {
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

        this.gridkeys = Object.keys(this.gridobject)
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
            this.gridconfig = new LmsChartGridConfig(this.gridobject)
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
        this.style.setProperty('--breite', `${this.gridconfig.totalwidth}cm`)
        this.style.setProperty('--hoehe', `${this.gridconfig.totalheight}cm`)
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
                this.gridobject[gridprop] = number
                break;
            case 'xhidegrid':
            case 'yhidegrid':
            case 'xhidesubgrid':
            case 'yhidesubgrid':
            case 'xhideaxis':
            case 'yhideaxis':
            case 'xhidescale':
            case 'yhidescale':
                this.gridobject[gridprop] = ! ["0", "false"].includes(attr.value)
                break;
            default:
                this.gridobject[gridprop] = attr.value
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

class LmsChartContainer {
    constructor(parent) {
        this.parent = parent
        this.gridconfig = parent.gridconfig
        const content = parent.shadowRoot

        this.lmschartgrid = new LmsChartGrid(this.gridconfig, content)
        const lmschartachsen = new LmsChartAchsen(this.gridconfig, content)

//        // Um die Achsenbeschriftung korrekt positionieren zu können, muss ich für einen
//        // Augenblick die Kontrolle an den Browser zurückgeben, damit er ein erstes Mal rendern kann.
//        // Dazu wird setTimeout mit einem Timeout von 0 aufgerufen. Das bewirkt, dass die folgende
//        // Funktion an das Ende der Queue gesetzt wird. Nun kann ich mit getBBox() alle Größen und
//        // Positionen auslesen. 
        setTimeout(() => {
            const ele = content.getElementById("lms-chart-ylabel")
            const ylabelbreite = ele.getBoundingClientRect().width
            this.parent.style.setProperty('--ylabelbreite', `${ylabelbreite}px`)
        }, 1000)
    }

    appendDataPaths(xys) {
        for (let bezeichnung in xys ) {
            try {
                this.lmschartgrid.appendLegend(bezeichnung, xys[bezeichnung])
                this.lmschartgrid.appendDataPath(bezeichnung, xys[bezeichnung])
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
                this.lmschartgrid.appendLegend(bezeichnung, functions[bezeichnung])
                this.lmschartgrid.appendFunctionPath(bezeichnung, functions[bezeichnung])
            }
            catch(err) {
                if (err instanceof ChartError)
                    this.parent.errormessage(err)
                else
                    throw err
            }
        }
    }
}

class LmsChartAchsen {
    constructor(c, content) {
        if(! c instanceof LmsChartGridConfig)
            throw new Error('LmsChartGrid muss mit LmsChartGridConfig erzeugt werden.')

        this.config = c
        this.content = content
        this.yskalagap = '-0.2cm'
        this.linienbreite = 0.0352777778 // 1pt in cm

        if (! this.config.xhideaxis)
            this.configureXaxis()
        if (! this.config.yhideaxis)
            this.configureYaxis()
        if (! this.config.xhidescale)
            this.configureXscale()
        if (! this.config.yhidescale)
            this.configureYscale()
    }

    configureXscale() {
        const xskala = this.content.getElementById("lms-chart-x-scale")
        for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
            if (i != 0)
                xskala.innerHTML += `<div class="xscale absolute" style="left: ${i*this.config.xscale-0.5*this.config.totalwidth-this.config.totalxmin}cm;">${i.toLocaleString('de-DE')}</div>`
        }
        xskala.innerHTML += `<div class="xscalehidden">Mg</div>`
    }

    configureYscale() {
        const yskala = this.content.getElementById("lms-chart-y-scale")
        for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
            if (i != 0) {
                yskala.innerHTML += `<div class="yscale absolute" style="right: 0.5em; top: ${this.config.totalymax-i*this.config.yscale-0.5*this.config.totalheight}cm;">${i.toLocaleString('de-DE')}</div>`
                yskala.innerHTML += `<div class="yscalehidden">${i.toLocaleString('de-DE')}</div>`
            }
        }
    }

    scaletext(txt, x, y) {
        const element = document.createElement("div")
        element.classList.add("absolute")
        element.style.left = x
        element.style.top = y
        element.innerHTML = txt
        return element
    }

    configureXaxis() {
        const element = this.content.getElementById("lms-chart-x-axis")
        element.setAttribute("x1", this.config.totalxmin)
        element.setAttribute("y1", this.config.totalymax)
        element.setAttribute("x2", this.config.totalxmax-10*this.linienbreite)
        element.setAttribute("y2", this.config.totalymax)
    }

    configureYaxis() {
        const element = this.content.getElementById("lms-chart-y-axis")
        element.setAttribute("x1", 0)
        element.setAttribute("y1",  this.config.totalheight)
        element.setAttribute("x2", 0)
        element.setAttribute("y2", 10*this.linienbreite)
    }
}

class LmsChartGrid {
    constructor(c, content) {
        if(! c instanceof LmsChartGridConfig)
            throw new Error('LmsChartGrid muss mit LmsChartGridConfig erzeugt werden.')

        this.cos30 = 0.8660254037844387
        this.sin30 = 0.5
    
        this.config = c
        this.content = content

        this.svgelement = this.content.getElementById("lms-chart-graph")
        this.svgelement.setAttribute("preserveAspectRatio", 'none')
        this.svgelement.setAttribute("viewBox", `${this.config.totalxmin} 0 ${this.config.totalwidth} ${this.config.totalheight}`)
        this.svgelement.setAttribute("width", `${this.config.totalwidth}cm`)
        this.svgelement.setAttribute("height", `${this.config.totalheight}cm`)
        this.frameelement = this.content.getElementById("lms-chart-frame")
        this.frameelement.setAttribute("preserveAspectRatio", 'none')
        this.frameelement.setAttribute("viewBox", `${this.config.totalxmin} 0 ${this.config.totalwidth} ${this.config.totalheight}`)
        this.frameelement.setAttribute("width", `${this.config.totalwidth}cm`)
        this.frameelement.setAttribute("height", `${this.config.totalheight}cm`)

        this.appendSubgrid()
        this.appendGrid()
   }

    appendDataPath(id, xyinfo) {
        let point = []
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
        element.setAttribute("d", dpath)
        this.svgelement.appendChild(element)
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
        element.setAttribute("d", dpath)
        this.svgelement.appendChild(element)
    }

    appendLegend(id, info) {
        const symbolsize = info.symbolsize
        const container = this.content.getElementById("lms-chart-legend-container")
        const div = document.createElement('div')
        container.appendChild(div)
        div.classList.add('legenditem')
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute('width',`${5*symbolsize}cm`)
        svg.setAttribute('height',`${3*symbolsize}cm`)
        svg.setAttribute('viewBox',`${-2.5*symbolsize} ${-1.5*symbolsize} ${5*symbolsize} ${3*symbolsize}`)
        div.appendChild(svg)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        svg.appendChild(path)
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

        const legend = this.content.getElementById("lms-chart-legend")
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

    tupelToPoint(tupel) {
        if (! Array.isArray(tupel) || tupel.length < 2)
            throw new ChartError(`${tupel} muss ein Array mit einer Länge von mindestens 2 sein.`)
        let x = parseFloat(tupel[0])
        let y = parseFloat(tupel[1])
        x = x*this.config.xscale
        y = (this.config.ymax - y)*this.config.yscale
        if (isNaN(x))
            throw new ChartError(`${tupel[0]} ist keine Zahl.`)
        if (isNaN(y))
            throw new ChartError(`${tupel[1]} ist keine Zahl.`)
        return {x: x, y: y}
    }

    appendGrid() {
        let dgrid = ""
        let point1
        let point2

        if (! this.config.xhidegrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
                point1 = this.tupelToPoint([i,this.config.ymin])
                point2 = this.tupelToPoint([i,this.config.ymax])
                dgrid += ` M${this.drawSegment(point1)} L${this.drawSegment(point2)}`
            }
        }
        
        if (! this.config.yhidegrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
                point1 = this.tupelToPoint([this.config.xmin,i])
                point2 = this.tupelToPoint([this.config.xmax,i])
                dgrid += ` M${this.drawSegment(point1)} L${this.drawSegment(point2)}`
            }
        }

        if (! dgrid)
            return
        
        const element = this.content.getElementById("lms-chart-grid")
        element.setAttribute("d", dgrid)
    }

    appendSubgrid() {
        let dsubgrid = ''
        let point1
        let point2

        if (! this.config.xhidesubgrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xsubdelta) {
                point1 = this.tupelToPoint([i,this.config.ymin])
                point2 = this.tupelToPoint([i,this.config.ymax])
                dsubgrid += ` M${this.drawSegment(point1)} L${this.drawSegment(point2)}`
            }
        }

        if (! this.config.yhidesubgrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ysubdelta) {
                point1 = this.tupelToPoint([this.config.xmin,i])
                point2 = this.tupelToPoint([this.config.xmax,i])
                dsubgrid += ` M${this.drawSegment(point1)} L${this.drawSegment(point2)}`
            }
        }

        if (! dsubgrid)
            return

        const element = this.content.getElementById("lms-chart-subgrid")
        element.setAttribute("d", dsubgrid)
    }
}

class LmsChartGridConfig {
    constructor(gridconfigobject) {
        Object.assign(this, gridconfigobject)

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
