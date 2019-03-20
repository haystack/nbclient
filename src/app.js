// TODO: Follow the JS doc style
import Vue from 'vue'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import { getTextBoundingBoxes } from './overlay-util.js'

/////////////// Pane implmentation starts here.

/* Helper function for eventsProxyMouse */
function clone(e) {
    var opts = Object.assign({}, e, {bubbles: false});
    try {
        return new MouseEvent(e.type, opts);
    } catch(err) { // compat: webkit
        var copy = document.createEvent('MouseEvents');
        copy.initMouseEvent(e.type, false, opts.cancelable, opts.view,
                            opts.detail, opts.screenX, opts.screenY,
                            opts.clientX, opts.clientY, opts.ctrlKey,
                            opts.altKey, opts.shiftKey, opts.metaKey,
                            opts.button, opts.relatedTarget);
        return copy;
    }
}

/* Helper function for eventsProxyMouse */
function contains(item, x, y) {
    function rectContains(r, x, y) {
        var bottom = r.top + r.height;
        var right = r.left + r.width;
        return (r.top <= y && r.left <= x && bottom > y && right > x);
    }

    // Check overall bounding box first
    var rect = item.getBoundingClientRect();
    if (!rectContains(rect, x, y)) {
        return false;
    }

    // Then continue to check each child rect
    var rects = item.getClientRects();
    for (var i = 0, len = rects.length; i < len; i++) {
        if (rectContains(rects[i], x, y)) {
            return true;
        }
    }
    return false;
}

/* Helper function for Pane.constructor */
function eventsProxyMouse(target, tracked) {
    function dispatch(e) {
        // We walk through the set of tracked elements in reverse order so that
        // events are sent to those most recently added first.
        //
        // This is the least surprising behaviour as it simulates the way the
        // browser would work if items added later were drawn "on top of"
        // earlier ones.
        for (var i = tracked.length - 1; i >= 0; i--) {
            var t = tracked[i];

            if (!contains(t, e.clientX, e.clientY)) {
                continue;
            }

            // The event targets this highlight, so dispatch a cloned event:
            t.dispatchEvent(clone(e));
            // We only dispatch the cloned event to the first matching highlight.
            break;
        }
    }

    //TODO: add hover event
    for (var ev of ['mouseup', 'mousedown', 'click']) {
        target.addEventListener(ev, (e) => dispatch(e), false);
    }
}

/* Helper function for Pane.render */
function coords(el) {
    var rect = el.getBoundingClientRect();
    return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft,
        height: rect.height,
        width: rect.width
    };
}

/* Helper function for Pane.render */
function setCoords(el, coords) {
    el.style.top = `${coords.top}px`;
    el.style.left = `${coords.left}px`;
    el.style.height = `${coords.height}px`;
    el.style.width = `${coords.width}px`;
}

/* Helper function for Pane and Highlight */
function svgCreateElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}


class Highlight {
  constructor(nbRange, annotationID) {
    this.element = null
    this.range = nbRange
    this.annotationID = annotationID // undefined for draft
    // let sr = this.range.serialize()
    // console.log(sr)
    // let dr = deserializeNbRange(sr)
    // console.log(dr)
  }

  bind(element) {
    this.element = element
    this.element.classList.add('nb-highlight')
    if (this.annotationID) {
      this.element.setAttribute('annotation_id', this.annotationID)
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


class Pane {
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

  addHighlight(highlight) {
    let g = svgCreateElement('g')
    this.element.appendChild(g)
    highlight.bind(g)

    this.highlights.push(highlight)

    highlight.render();
    return highlight
  }

  removeHighlight(highlight) {
    let idx = this.highlights.indexOf(highlight)
    if (idx === -1) {
        return;
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

/////////////// Pane implmentation ends here.

var el = document.querySelector('#document-pane')
var pane = new Pane(el)
var selecting = false
let draftHighlight = null
let replyToAnnotation = null

/* Helper function for checkForSelection */
function makeHighlight(range) {
  let nbRange = createNbRange(range)
  draftHighlight = pane.addHighlight(new Highlight(nbRange))
}

function redrawHighlights() {
    pane.render()
}

function checkForSelection(event) {
    var selection = window.getSelection();

    if (!selection.isCollapsed) {
        // Set global state to reflect the fact we're making a selection.
        // Used to stop click events from showing contents of older highlights
        // when the click event is the result of a selection.
        selecting = true;
        //TODO: the whole selcting logic seems a bit off, e.g. shouldn't line 258 check if draftHighlight

        let range = selection.getRangeAt(0)

        // Check if range is inside #document-pane
        if (el.contains(range.commonAncestorContainer)) {
          if (selecting) {
            // Reset the draft (i.e. cancel the previous draft)
            quill.setContents([])
            pane.removeHighlight(draftHighlight)
            draftHighlight = null
          }

          // Cannot reply and create at the same time.
          replyToAnnotation = null

          makeHighlight(range)

          // Display the editor pane
          editorPane.style.display = 'block'

          // Commented out for now b/c NB does not do this, but maybe it's a good idea.
          // We could highlight the draft with different highlight color.
          // Clear the selection
          // selection.removeAllRanges()
        }

    } else if (selecting && el.contains(event.target)) {
        // If clicked on document outside of previous selection, cancel the draft.
        // TODO: Is this a good design choice?
        cancelDraft()
    }
}

document.addEventListener("mouseup", checkForSelection, false)
window.addEventListener("resize", redrawHighlights, false)

/////////////// Annotation implmentation starts here.

class Annotation {
  constructor(id, range, parent, timestamp, content, author) {
    this.id = id
    this.range = range // null if this is a reply

    this.parent = parent // null if this is a head annotation
    this.children = []

    this.timestamp = timestamp
    this.content = content
    this.author = author

    let temp = document.createElement('div')
    temp.innerHTML = content
    this.excerpt = temp.textContent // TODO: equations break
    // TODO: do we need more fields? e.g. visibility
  }

  addChild(child) {
    this.children.push(child)
  }
}

/////////////// Annotation implmentation ends here.

/////////////// Text editor + annotation stuff starts here.

let threadPane = document.querySelector('#thread-pane')
let editorPane = document.querySelector('#editor-pane')
editorPane.style.display = 'none' // Hidden by default.

let quill = new Quill('#text-editor', {
  modules: {
    toolbar: [
      // TODO: Which options should we include?
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [ 'bold', 'italic', 'underline', 'strike' ],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [ 'blockquote', 'code-block', 'link', 'formula' ],
      [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      [ 'clean' ]
    ]
  },
  theme: 'snow'
})

let headAnnotations = {} // {id: Annotation()}

let listPane = new Vue({
  el: '#list-pane',
  data: {
    threadHeads: []
  },
  computed: {
    sorted: function () {
      return this.threadHeads.sort(compareAnnotations)
    }
  },
  methods: {
    select: function(id) {
      selectAnnotation(id)
    }
  }
})

function submitDraft() {
  let now = Date.now()
  let annotation = new Annotation(
    now, //TODO: id
    draftHighlight.range, //range
    replyToAnnotation, //parent, null if this is head annotation
    now, //timestamp
    quill.root.innerHTML, //content (TODO: sanitize?)
    'alisa' //TODO: author
  )

  editorPane.style.display = 'none'
  quill.setContents([])

  if (replyToAnnotation) {
    replyToAnnotation.children.push(annotation)
    renderThreadPane(replyToAnnotation)

    replyToAnnotation = null
  } else {
    draftHighlight.setAnnotationID(now)
    headAnnotations[now] = annotation
    listPane.threadHeads.push(annotation)

    draftHighlight = null
    selecting = false
  }
}

function cancelDraft() {
  editorPane.style.display = 'none'
  quill.setContents([])

  if (draftHighlight) {
    pane.removeHighlight(draftHighlight)
    window.getSelection().removeAllRanges() // TODO: might not need this.

    draftHighlight = null
    selecting = false
  }
}

function selectAnnotation(annotationID) {
  let highlight = document.getElementsByClassName('nb-highlight selected')[0]
  if (highlight) {
    highlight.classList.remove('selected')
  }
  let row = document.getElementsByClassName('list-row selected')[0]
  if (row) {
    row.classList.remove('selected')
  }
  document.querySelector(`.list-row[annotation_id='${annotationID}']`).classList.add('selected')
  document.querySelector(`.nb-highlight[annotation_id='${annotationID}']`).classList.add('selected')

  renderThreadPane(headAnnotations[annotationID])
}

// Render thread pane for the thread containing 'annotation'
function renderThreadPane(annotation) {
  while (threadPane.firstChild) {
    threadPane.removeChild(threadPane.firstChild)
  }

  let headAnnotation = annotation
  while (headAnnotation.parent) {
    headAnnotation = headAnnotation.parent
  }

  renderThread(headAnnotation)
}

function renderThread(thread, parent = threadPane, depth = 0) {
  let row = document.createElement('div')
  row.className = 'thread-row'
  row.innerHTML = thread.content
  row.style.paddingLeft = `${depth * 20}px`

  row.addEventListener('click', function() {
    replyToAnnotation = thread
    editorPane.style.display = 'block'
  })

  parent.appendChild(row)

  if (thread.children.length > 0) {
    let childRows = document.createElement('div')
    for (let child of thread.children) {
        renderThread(child, childRows, depth + 1)
    }

    parent.appendChild(childRows)
  }
}

function compareAnnotations(a, b) {
  if (a.range.start.isSameNode(b.range.start)) {
    // a and b have the same start
    if (a.range.end.isSameNode(b.range.end)) {
      // a and b have the same range
      return 0
    } else if (a.range.end.compareDocumentPosition(b.range.end)
        & Node.DOCUMENT_POSITION_FOLLOWING) {
      // a ends before b
      return -1
    } else {
      // b ends before a
      return 1
    }
  } else if (a.range.start.compareDocumentPosition(b.range.start)
      & Node.DOCUMENT_POSITION_FOLLOWING) {
    // a starts before b
    return -1
  } else {
    // b starts before a
    return 1
  }
}

document.querySelector('#submit-draft').addEventListener("click", submitDraft, false)
document.querySelector('#cancel-draft').addEventListener("click", cancelDraft, false)

/////////////// Text editor + annotation stuff ends here.
