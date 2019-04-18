import { getTextBoundingBoxes } from './overlay-util.js'

class Highlights {
  constructor(target, container = document.body) {
    this.target = target
    this.element = svgCreateElement('svg')
    this.highlights = []

    // Match the coordinates of the target element
    this.element.style.position = 'absolute'
    // Disable pointer events
    this.element.setAttribute('pointer-events', 'none')

    // // Set up mouse event proxying between the target element and the highlights
    eventsProxyMouse(this.target, this.highlights)

    container.appendChild(this.element)

    this.render()
  }

  createHighlight(nbRange) {
    let highlight = new Highlight(nbRange)
    let g = svgCreateElement('g')
    this.element.appendChild(g)
    highlight.bind(g)

    this.highlights.push(highlight)

    highlight.render()
    return highlight
  }

  removeHighlight(highlight) {
    let idx = this.highlights.indexOf(highlight)
    if (idx === -1) {
      return
    }
    let el = highlight.unbind()
    this.element.removeChild(el)
    this.highlights.splice(idx, 1)
  }

  render() {
    setCoords(this.element, coords(this.target))
    for (let m of this.highlights) {
      m.render()
    }
  }
}

class Highlight {
  constructor(nbRange, annotationID) {
    this.element = null
    this.range = nbRange
    this.annotationID = annotationID // undefined for draft
    // to serialize: sr = this.range.serialize()
    // to deserialize: dsr = deserializeNbRange(sr)
  }

  bind(element) {
    this.element = element
    this.element.classList.add('nb-highlight')
    if (this.annotationID) {
      this.element.setAttribute('annotation_id', this.annotationID)
    } else {
      this.element.classList.add('draft')
    }
    this.element.addEventListener("click", function () {
      let annotationID = this.getAttribute('annotation_id')
      if (annotationID && !selecting) {
        selectAnnotation(annotationID)
      }
    }, false)
  }

  unbind() {
    let el = this.element
    this.element = null
    return el
  }

  render() {
    // Empty element
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }

    let rects = getTextBoundingBoxes(this.range.toRange())
    let offset = this.element.getBoundingClientRect()

    for (let i = 0, len = rects.length; i < len; i++) {
      let r = rects[i]
      let el = svgCreateElement('rect')
      el.setAttribute('x', r.left - offset.left)
      el.setAttribute('y', r.top - offset.top)
      el.setAttribute('height', r.height)
      el.setAttribute('width', r.width)
      this.element.appendChild(el)
    }
  }

  setAnnotationID(annotationID) {
    this.annotationID = annotationID
    this.element.setAttribute('annotation_id', annotationID)
    this.element.classList.remove('draft')
  }

  dispatchEvent(e) {
    if (!this.element) return
    this.element.dispatchEvent(e)
  }

  getBoundingClientRect() {
    return this.element.getBoundingClientRect()
  }

  getClientRects() {
    let rects = []
    let el = this.element.firstChild
    while (el) {
      rects.push(el.getBoundingClientRect())
      el = el.nextSibling
    }
    return rects
  }
}

/* Helper function for eventsProxyMouse */
function clone(e) {
  let opts = Object.assign({}, e, {bubbles: false})
  try {
    return new MouseEvent(e.type, opts)
  } catch(err) { // compat: webkit
    let copy = document.createEvent('MouseEvents')
    copy.initMouseEvent(e.type, false, opts.cancelable, opts.view,
                        opts.detail, opts.screenX, opts.screenY,
                        opts.clientX, opts.clientY, opts.ctrlKey,
                        opts.altKey, opts.shiftKey, opts.metaKey,
                        opts.button, opts.relatedTarget)
    return copy
  }
}

/* Helper function for eventsProxyMouse */
function contains(item, x, y) {
  function rectContains(r, x, y) {
    let bottom = r.top + r.height
    let right = r.left + r.width
    return (r.top <= y && r.left <= x && bottom > y && right > x)
  }

  // Check overall bounding box first
  let rect = item.getBoundingClientRect()
  if (!rectContains(rect, x, y)) {
    return false
  }

  // Then continue to check each child rect
  let rects = item.getClientRects()
  for (let i = 0, len = rects.length; i < len; i++) {
    if (rectContains(rects[i], x, y)) {
      return true
    }
  }
  return false
}

/* Helper function for Highlights.constructor */
function eventsProxyMouse(target, tracked) {
  function dispatch(e) {
    // We walk through the set of tracked elements in reverse order so that
    // events are sent to those most recently added first.
    //
    // This is the least surprising behaviour as it simulates the way the
    // browser would work if items added later were drawn "on top of"
    // earlier ones.
    for (let i = tracked.length - 1; i >= 0; i--) {
      let t = tracked[i]

      if (!contains(t, e.clientX, e.clientY)) {
          continue
      }

      // The event targets this highlight, so dispatch a cloned event:
      t.dispatchEvent(clone(e))
      // We only dispatch the cloned event to the first matching highlight.
      break
    }
  }

  //TODO: add hover event
  for (let ev of ['mouseup', 'mousedown', 'click']) {
    target.addEventListener(ev, (e) => dispatch(e), false)
  }
}

/* Helper function for Highlights.render */
function coords(el) {
  let rect = el.getBoundingClientRect()
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft,
    height: rect.height,
    width: rect.width
  }
}

/* Helper function for Highlights.render */
function setCoords(el, coords) {
  el.style.top = `${coords.top}px`
  el.style.left = `${coords.left}px`
  el.style.height = `${coords.height}px`
  el.style.width = `${coords.width}px`
}

/* Helper function for Highlights and Highlight */
function svgCreateElement(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name)
}

export default Highlights
