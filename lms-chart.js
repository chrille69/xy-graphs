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
        this.templatecontent = template.content.cloneNode(true)
        const root = this.attachShadow({mode: "open"})
        root.appendChild(this.templatecontent)
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
            yhidescale: false
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
            symbolsize: 0.15
        }
        this.emptyxy = {
            values: null,
            fillcolor: null,
            strokecolor: 'red',
            style: 'line',
            linewidth: '1.3pt',
            symbolsize: 0.15
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
            const lmschartcontainer = new LmsChartContainer(this)
            lmschartcontainer.appendDataPaths(this.xys)
            lmschartcontainer.appendFunctionPaths(this.functions)
            this.sizeSlots()
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

    sizeSlots() {
        this.shadowRoot.querySelectorAll('.toberesized').forEach(element => {
            element.setAttribute('width', `${this.gridconfig.totalwidth}cm`)
            element.setAttribute('height', `${this.gridconfig.totalheight}cm`)
        });
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
                this.functions[funcname][functyp] = number
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

        this.svg = content.getElementById("lms-chart")
        const alles = content.getElementById('lms-alles')
        this.lmschartgrid = new LmsChartGrid(this.gridconfig, content)
        const lmschartachsen = new LmsChartAchsen(this.gridconfig, content)

        this.svg.setAttribute("preserveAspectRatio", 'none')
        this.xlabeltextele = content.getElementById("lms-chart-xlabel")
        this.ylabeltextele = content.getElementById("lms-chart-ylabel")
        this.titletextele = content.getElementById("lms-chart-title")

        this.resizexlabel()
        this.resizeylabel()
        this.resizetitle()
        // Um die Achsenbeschriftung korrekt positionieren zu können, muss ich für einen
        // Augenblick die Kontrolle an den Browser zurückgeben, damit er ein erstes Mal rendern kann.
        // Dazu wird setTimeout mit einem Timeout von 0 aufgerufen. Das bewirkt, dass die folgende
        // Funktion an das Ende der Queue gesetzt wird. Nun kann ich mit getBBox() alle Größen und
        // Positionen auslesen. 
        setTimeout(() => {
            // Positioniere die Achsenbeschriftung
            const gap = 3
            const rect = lmschartachsen.svgelement.getBBox()
            const xlabelslot = content.host.querySelector("*[slot=xlabel]")
            const ylabelslot = content.host.querySelector("*[slot=ylabel]")
            const titleslot = content.host.querySelector("*[slot=title]")
            const xdivrect = xlabelslot ? titleslot.getBoundingClientRect() : new DOMRect()
            const ydivrect = ylabelslot ? ylabelslot.getBoundingClientRect() : new DOMRect()
            const titlerect = titleslot ? titleslot.getBoundingClientRect() : new DOMRect()
            this.xlabeltextele.style.transform = `translate(0, ${rect.height+rect.y}px)`
            this.ylabeltextele.style.transform = `translate(${rect.x-ydivrect.width-gap}px, ${this.gridconfig.height*this.gridconfig.yscale}cm) rotate(-90deg)`
            this.titletextele.style.transform = `translate(0, -${titlerect.height-rect.y}px)`

            // Berechne die gesamte benötigte Höhe und Breite
            const breite = ydivrect.width + rect.width + gap
            const hoehe = xdivrect.height + rect.height + titlerect.height
            this.svg.setAttribute("width", `${breite}px`)
            this.svg.setAttribute("height", `${hoehe}px`)
            alles.style.transform = `translate(${ydivrect.width-rect.x+gap}px, ${-rect.y+titlerect.height}px)`
        }, 0)
    }

    appendDataPaths(xys) {
        for (let bezeichnung in xys ) {
            try {
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

    resizexlabel() {
        this.xlabeltextele.style.width = `${this.gridconfig.width*this.gridconfig.xscale}cm`
    }

    resizeylabel() {
        this.ylabeltextele.style.width = `${this.gridconfig.height*this.gridconfig.yscale}cm`
        this.ylabeltextele.style.transform = 'rotate(-90deg)'
    }

    resizetitle() {
        this.titletextele.style.width = `${this.gridconfig.width*this.gridconfig.xscale}cm`
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

        this.svgelement = this.content.getElementById("lms-chart-axis")

        this.configureFrame()
        if (! this.config.xhideaxis)
            this.configureXaxis()
        if (! this.config.yhideaxis)
            this.configureYaxis()
        if (! this.config.xhidescale)
            this.configureXscale()
        if (! this.config.yhidescale)
            this.configureYscale()
    }

    configureFrame() {
        const frame = this.content.getElementById("lms-chart-frame")
        frame.setAttribute("width", `${this.config.totalwidth}cm`)
        frame.setAttribute("height", `${this.config.totalheight}cm`)
    }

    configureXscale() {
        const xskala = this.content.getElementById("lms-chart-x-scale")
        for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
            if (i != 0)
                xskala.appendChild(this.scaletext(
                    i.toLocaleString('de-DE'),
                    `${i*this.config.xscale-this.config.totalxmin}cm`,
                    `${this.config.totalheight}cm`,
                    'text-before-edge',
                    'middle'
                ))
        }
    }

    configureYscale() {
        const yskala = this.content.getElementById("lms-chart-y-scale")
        for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
            if (i != 0)
                yskala.appendChild(this.scaletext(
                    i.toLocaleString('de-DE'),
                    this.yskalagap,
                    `${this.config.totalymax-i*this.config.yscale}cm`,
                    'central',
                    'end'
                ))
        }
        this.svgelement.appendChild(yskala)
    }

    scaletext(txt, x, y, baseline, anchor) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", "text")
        element.setAttribute("x", x)
        element.setAttribute("y", y)
        element.style['dominant-baseline'] = baseline
        element.style['text-anchor'] = anchor
        element.innerHTML = txt
        return element
    }

    configureXaxis() {
        const element = this.content.getElementById("lms-chart-x-axis")
        element.setAttribute("x1", 0)
        element.setAttribute("y1", `${this.config.totalymax}cm`)
        element.setAttribute("x2", `${this.config.totalwidth-10*this.linienbreite}cm`)
        element.setAttribute("y2", `${this.config.totalymax}cm`)
    }

    configureYaxis() {
        const element = this.content.getElementById("lms-chart-y-axis")
        element.setAttribute("x1", `${-this.config.totalxmin}cm`)
        element.setAttribute("y1",  `${this.config.totalheight}cm`)
        element.setAttribute("x2", `${-this.config.totalxmin}cm`)
        element.setAttribute("y2", `${10*this.linienbreite}cm`)
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

        this.appendSubgrid()
        this.appendGrid()
   }

    appendDataPath(id, xyinfo) {
        if (!xyinfo.values)
            throw new ChartError(`xy (id=${id}): Keine Werte vorhanden.`)
        if (! Array.isArray(xyinfo.values))
            throw new ChartError(`xy (id=${id}): values muss ein zweidimensionales Array sein.`)
        let dpath = `M${this.tupelToPoints(xyinfo.values[0])}`
        for (let i=1; i<xyinfo.values.length; i++) {
            const tupel = xyinfo.values[i]
            dpath += this.tupelToPoints(tupel, xyinfo.style, xyinfo.symbolsize)
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
        dpath = `M${this.tupelToPoints(tupel)}`

        for (let i = funcinfo.start; i < funcinfo.end && funcinfo.start < funcinfo.end || i > funcinfo.end && funcinfo.start > funcinfo.end; i += funcinfo.step) {
            try {
                tupel = [i, math.evaluate(funcinfo.expr, { 'x': i })]
            }
            catch(err) {
                throw new ChartError(err.message)
            }
            if (tupel[1] == Infinity)
                throw new ChartError(`function (id=${id}): Bis zur Unendlichkeit und noch viel weiter...`)
            dpath += this.tupelToPoints(tupel, funcinfo.style, funcinfo.symbolsize)
        }
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path")
        element.classList.add('functionpath')
        element.style['stroke'] = funcinfo.strokecolor
        element.style['fill'] = funcinfo.fillcolor
        element.style['stroke-width'] = funcinfo.linewidth
        element.setAttribute("d", dpath)
        this.svgelement.appendChild(element)
    }

    tupelToPoints(tupel, style, symbolsize) {
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

    appendGrid() {
        let dgrid = ""

        if (! this.config.xhidegrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xdelta) {
                dgrid += ` M${this.tupelToPoints([i,this.config.ymin])} L${this.tupelToPoints([i,this.config.ymax])}`
            }
        }
        
        if (! this.config.yhidegrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ydelta) {
                dgrid += ` M${this.tupelToPoints([this.config.xmin,i])} L${this.tupelToPoints([this.config.xmax,i])}`
            }
        }

        if (! dgrid)
            return
        
        const element = this.content.getElementById("lms-chart-grid")
        element.setAttribute("d", dgrid)
    }

    appendSubgrid() {
        let dsubgrid = ''

        if (! this.config.xhidesubgrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xsubdelta) {
                dsubgrid += ` M${this.tupelToPoints([i,this.config.ymin])} L${this.tupelToPoints([i,this.config.ymax])}`
            }
        }

        if (! this.config.yhidesubgrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ysubdelta) {
                dsubgrid += ` M${this.tupelToPoints([this.config.xmin,i])} L${this.tupelToPoints([this.config.xmax,i])}`
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
