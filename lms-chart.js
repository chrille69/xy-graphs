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
            this.shadowRoot.innerHTML=`<div style="font-family: Courier"><div style="background-color: red; color: white">${err.name}</div><div>${err.message}</div><pre>${err.stack}</pre</div>`
        }
    }

    create() {
        const xsize = this.getAttribute("x-size")
        const ysize = this.getAttribute("y-size")
        const xgrid = this.getAttribute("x-grid")
        const ygrid = this.getAttribute("y-grid")
        const xsubgrid = this.getAttribute("x-subgrid")
        const ysubgrid = this.getAttribute("y-subgrid")
        const xmin = this.getAttribute("x-min")
        const xmax = this.getAttribute("x-max")
        const ymin = this.getAttribute("y-min")
        const ymax = this.getAttribute("y-max")
        const xhidegrid = this.getAttribute("x-hidegrid")
        const yhidegrid = this.getAttribute("y-hidegrid")
        const xhidesubgrid = this.getAttribute("x-hidesubgrid")
        const yhidesubgrid = this.getAttribute("y-hidesubgrid")
        const xhideaxis = this.getAttribute("x-hideaxis")
        const yhideaxis = this.getAttribute("y-hideaxis")
        const xhidescale = this.getAttribute("x-hidescale")
        const yhidescale = this.getAttribute("y-hidescale")
        this.gridconfig = new LmsChartGridConfig(xsize, ysize,
            xgrid, ygrid, xsubgrid, ysubgrid,
            xmin, xmax, ymin, ymax,
            xhidegrid, yhidegrid, xhidesubgrid, yhidesubgrid,
            xhideaxis, yhideaxis, xhidescale, yhidescale)

        const lmschartcontainer = new LmsChartContainer(this.xys, this.functions, this.gridconfig, this)

        this.functions = {}
        this.xys = {}
        for (let attr of this.attributes) {
            if (attr.name.startsWith('function-')) {
                this.parseFunctionAttribute(attr)
            }
            else if (attr.name.startsWith('xy-')) {
                this.parseXYAttribute(attr)
            }
        }
        lmschartcontainer.appendDataPaths(this.xys)
        lmschartcontainer.appendFunctionPaths(this.functions)
        this.sizeSlots()
    }

    sizeSlots() {
        this.shadowRoot.querySelectorAll('.toberesized').forEach(element => {
            element.setAttribute('width', `${this.gridconfig.totalwidth}cm`)
            element.setAttribute('height', `${this.gridconfig.totalheight}cm`)
        });
    }

    parseFunctionAttribute(attr) {
        const emptyfunction = {
            expr: null,
            start: 0,
            end: 10,
            step: 0.1,
            color: 'red'
        }

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
        const keys = Object.keys(emptyfunction)
        if (! keys.includes(functyp)) {
            this.errormessage(`${attr.name}: Erlaubt sind nur ${keys}`)
            return
        }

        if (!(funcname in this.functions))
            this.functions[funcname] = {...emptyfunction}

        switch(functyp) {
            case 'start':
            case 'end':
            case 'step':
                const number = Number(attr.value)
                if (isNaN(number)) return
                this.functions[funcname][functyp] = number
                break;
            case 'expr':
                this.functions[funcname][functyp] = attr.value
                break;
            case 'color':
                this.functions[funcname][functyp] = attr.value
                break;
        }
    }

    parseXYAttribute(attr) {
        const emptyxy = {
            values: null,
            color: 'red'
        }

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
        const keys = Object.keys(emptyxy)
        if (! keys.includes(xytyp)) {
            this.errormessage(`${attr.name}: Falscher typ. Erlaubt sind nur ${keys}`)
            return
        }

        if (!(xyname in this.xys))
            this.xys[xyname] = {...emptyxy}

        switch(xytyp) {
            case 'values':
                try {
                    this.xys[xyname][xytyp] = JSON.parse(attr.value)
                }
                catch(err) {
                    this.errormessage(err)
                }
                break;
            case 'color':
                this.xys[xyname][xytyp] = attr.value
                break;
        }
    }

    errormessage(msg) {
        this.innerHTML += `<div slot="error">${msg}</div>`
    }
}

customElements.define('lms-chart', LmsChart);

class LmsChartContainer {
    constructor(d, f, g, parent) {
        // Defaultwerte
        this.gridconfig = g
        this.xys = d
        this.functions = f
        this.parent = parent

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
            this.xlabeltextele.style['transform'] = `translate(0, ${rect.height+rect.y}px)`
            this.ylabeltextele.style['transform'] = `translate(${rect.x-ydivrect.width-gap}px, ${this.gridconfig.height*this.gridconfig.yscale}cm) rotate(-90deg)`
            this.titletextele.style['transform'] = `translate(0, -${titlerect.height-rect.y}px)`

            // Berechne die gesamte benötigte Höhe und Breite
            const breite = ydivrect.width + rect.width + gap
            const hoehe = xdivrect.height + rect.height + titlerect.height
            this.svg.setAttribute("width", `${breite}px`)
            this.svg.setAttribute("height", `${hoehe}px`)
            alles.style['transform'] = `translate(${ydivrect.width-rect.x+gap}px, ${-rect.y+titlerect.height}px)`
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
        this.xlabeltextele.style["width"] = `${this.gridconfig.width*this.gridconfig.xscale}cm`
    }

    resizeylabel() {
        this.ylabeltextele.style["width"] = `${this.gridconfig.height*this.gridconfig.yscale}cm`
        this.ylabeltextele.style['transform'] = 'rotate(-90deg)'
    }

    resizetitle() {
        this.titletextele.style["width"] = `${this.gridconfig.width*this.gridconfig.xscale}cm`
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
        for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xgrid) {
            if (i != 0)
                xskala.appendChild(this.scaletext(i.toLocaleString('de-DE'), `${i*this.config.xscale-this.config.totalxmin}cm`, `${this.config.totalheight}cm`, 'text-before-edge', 'middle'))
        }
    }

    configureYscale() {
        const yskala = this.content.getElementById("lms-chart-y-scale")
        for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ygrid) {
            if (i != 0)
                yskala.appendChild(this.scaletext(i.toLocaleString('de-DE'), this.yskalagap, `${this.config.totalymax-i*this.config.yscale}cm`, 'central', 'end'))
        }
        this.svgelement.appendChild(yskala)
    }

    scaletext(txt, x, y, baseline, anchor) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", "text")
        element.setAttribute("x", x)
        element.setAttribute("y", y)
        element.setAttribute("style", `dominant-baseline: ${baseline}; text-anchor: ${anchor};`)
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
            dpath += ` L${this.tupelToPoints(tupel)}`
        }
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path")
        element.classList.add('datapath')
        element.style['stroke'] = xyinfo.color
        element.setAttribute("d", dpath)
        //element.setAttribute("marker-mid", "url(#lmsbullet)")
        this.svgelement.appendChild(element)
    }

    tupelToPoints(tupel) {
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
        return `${x} ${y}`
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
        
        let command = 'M'
        for (let i = funcinfo.start; i <= funcinfo.end; i += funcinfo.step) {
            try {
                tupel = [i, math.evaluate(funcinfo.expr, { 'x': i })]
            }
            catch(err) {
                throw new ChartError(err.message)
            }
            if (tupel[1] == Infinity)
                throw new ChartError(`function (id=${id}): Bis zur Unendlichkeit und noch viel weiter...`)
            dpath += ` ${command}${this.tupelToPoints(tupel)}`
            command = 'L'
        }
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path")
        element.classList.add('functionpath')
        element.style['stroke'] = funcinfo.color
        element.setAttribute("d", dpath)
        this.svgelement.appendChild(element)
    }

    appendGrid() {
        let dgrid = ""

        if (! this.config.xhidegrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xgrid) {
                dgrid += ` M${this.tupelToPoints([i,this.config.ymin])} L${this.tupelToPoints([i,this.config.ymax])}`
            }
        }
        
        if (! this.config.yhidegrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ygrid) {
                dgrid += ` M${this.tupelToPoints([this.config.xmin,i])} L${this.tupelToPoints([this.config.xmax,i])}`
            }
        }

        if (! dgrid)
            return
        
        const element = this.content.getElementById("lms-chart-grid")
        element.setAttribute("d",dgrid)
    }

    appendSubgrid() {
        let dsubgrid = ''

        if (! this.config.xhidesubgrid) {
            for (let i = this.config.xmin; i <= this.config.xmax; i += this.config.xsubgrid) {
                dsubgrid += ` M${this.tupelToPoints([i,this.config.ymin])} L${this.tupelToPoints([i,this.config.ymax])}`
            }
        }

        if (! this.config.yhidesubgrid) {
            for (let i = this.config.ymin; i <= this.config.ymax; i += this.config.ysubgrid) {
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
    constructor(xsize, ysize,
        xgrid, ygrid, xsubgrid, ysubgrid,
        xmin, xmax, ymin, ymax,
        xhidegrid, yhidegrid, xhidesubgrid, yhidesubgrid,
        xhideaxis, yhideaxis, xhidescale, yhidescale) {
        this.xsize = parseFloat(xsize) || 1 // Die Größe eines Gridkästchens in cm
        this.ysize = parseFloat(ysize) || 1
        this.xgrid = parseFloat(xgrid) || 1       // Hauptskalierungsschritt an den Achsen
        this.ygrid = parseFloat(ygrid) || 1
        this.xsubgrid = parseFloat(xsubgrid) || 0.2     // Unterskalierungsschritt an den Achsen
        this.ysubgrid = parseFloat(ysubgrid) || 0.2
        this.xmin = parseFloat(xmin) || 0
        this.xmax = parseFloat(xmax) || 10
        this.ymin = parseFloat(ymin) || 0
        this.ymax = parseFloat(ymax) || 10
        this.xhidegrid = xhidegrid && xhidegrid != 0
        this.yhidegrid = yhidegrid && yhidegrid != 0
        this.xhidesubgrid = xhidesubgrid && xhidesubgrid != 0
        this.yhidesubgrid = yhidesubgrid && yhidesubgrid != 0
        this.xhideaxis = xhideaxis && xhideaxis != 0
        this.yhideaxis = yhideaxis && yhideaxis != 0
        this.xhidescale = xhidescale && xhidescale != 0
        this.yhidescale = yhidescale && yhidescale != 0

        this.xscale = this.xsize/this.xgrid
        this.yscale = this.ysize/this.ygrid
        this.width = this.xmax - this.xmin
        this.height = this.ymax - this.ymin

        this.totalwidth = this.width*this.xscale
        this.totalheight = this.height*this.yscale
        this.totalxmin = this.xmin*this.xscale
        this.totalymin = this.ymin*this.yscale
        this.totalxmax = this.xmax*this.xscale
        this.totalymax = this.ymax*this.yscale
    }
}
