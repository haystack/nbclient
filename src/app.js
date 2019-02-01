// TODO: Follow the JS doc style

/////////////// NbRange implmentation starts here.

/*
  Determine the first text node in or after the given node.
  Helper function for normalizeRange().
*/
function getFirstTextNodeNotBefore(n) {
  switch (n.nodeType) {
    case Node.TEXT_NODE:
      return n // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (n.firstChild) { // Does it have children at all?
        let result = getFirstTextNodeNotBefore(n.firstChild)
        if (result) {
          return result
        }
      }
    default:
      // Not a text or an element node.
  }

  // Could not find a text node in current node, go forward
  n = n.nextSibling
  return n ? getFirstTextNodeNotBefore(n) : null
}

/*
  Determine the last text node inside or before the given node.
  Helper function for normalizeRange().
*/
function getLastTextNodeUpTo(n) {
  switch (n.nodeType) {
    case Node.TEXT_NODE:
      return n // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (n.lastChild) { // Does it have children at all?
        let result = getLastTextNodeUpTo(n.lastChild)
        if (result) {
          return result
        }
      }
    default:
      // Not a text node, and not an element node.
  }

  // Could not find a text node in current node, go backwards
  n = n.previousSibling
  return n ? getLastTextNodeUpTo(n) : null
}

/*
  Flatten a nested array structure
  Returns an array
  Helper function for getTextNodes()
*/
function flatten(array) {
  let flat = []
  for (let el of array) {
    if (el && $.isArray(el)) {
      flat = flat.concat(flatten(el))
    } else {
      flat = flat.concat(el)
    }
  }
  return flat
}

/*
  Finds all text nodes within the elements in the current collection.
  Returns a new jQuery collection of text nodes.
  Helper function for deserializeRange().
*/
function getTextNodes(jq) {
  let getThisTextNodes = (node) => { // TODO: Change back name
    if (node && node.nodeType !== Node.TEXT_NODE) {
      let nodes = []

      // If not a comment then traverse children collecting text nodes.
      // We traverse the child nodes manually rather than using the .childNodes
      // property because IE9 does not update the .childNodes property after
      // .splitText() is called on a child text node.
      if (node.nodeType !== Node.COMMENT_NODE) {
        // Start at the last child and walk backwards through siblings.
        node = node.lastChild
        while (node) {
          nodes.push(getTextNodes(node))
          node = node.previousSibling
        }
      }
      // Finally reverse the array so that nodes are in the correct order.
      return nodes.reverse()
    } else {
      return node
    }
  }

  console.log(jq)

  jq.map(function() {
    return flatten(getThisTextNodes(this))
  })
}

// /* Helper function for getXpathFromNode */
// function simpleXPathJQuery(el, relativeRoot) {
//   // TODO?
// }
//
// /* Helper function for getXpathFromNode */
// function simpleXPathPure(el, relativeRoot) {
//   // TODO?
// }

function getXpathFromNode(element, relativeRoot) {
  if (!element || element === relativeRoot) {
    return ''
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return getXpathFromNode(element.parentNode, relativeRoot)
  }

  let index = 0
  let prevSibling = element.previousElementSibling

  while (prevSibling) {
    prevSibling = prevSibling.previousElementSibling
    index++
  }
  return `${getXpathFromNode(element.parentNode, relativeRoot)}/${element.nodeName}[${index + 1}]`
}

// function getXpathFromNode(el, relativeRoot) {
  // let result
  // try {
  //   result = simpleXPathJQuery(el, relativeRoot)
  // } catch (e) {
  //   console.warn('jQuery-based XPath construction failed! Falling back to manual.')
  //   result = simpleXPathPure(el, relativeRoot)
  // }
  // return result
// }

/*
  Get the node name for use in generating an xpath expression.
  Helper function for findChild()
*/
function getNodeName(node) {
  let nodeName = node.nodeName.toLowerCase()
  switch (nodeName) {
    case "#text":
      return "text()"
    case "#comment":
      return "comment()"
    case "#cdata-section":
      return "cdata-section()"
    default:
      return nodeName
  }
}

/* Helper function for getNodeFromXPath() */
function findChild(node, type, index) {
  if (!node.hasChildNodes()) {
    console.error('XPath error: node has no children!')
  }
  let children = node.childNodes
  let found = 0
  for (let child of children) {
    let name = getNodeName(child)
    if (name === type) {
      found += 1
      if (found === index) {
        return child
      }
    }
  }
  console.error('XPath error: wanted child not found.')
}

/* Helper function for deserializeRange() */
function getNodeFromXPath(xp, root = document) {
  let steps = xp.substring(1).split("/")
  let node = root
  for (let step of steps) {
    let s = step.split("[") // [name, idx]
    let idx = s[1] ? parseInt(idx.split("]"))[0] : 1
    node = findChild(node, s[0].toLowerCase(), idx)
  }
  return node
}

/*
  Takes in start node and offset, end node and offset, and common ancestor.
  Normalizes and returns start node, end node, and common ancestor.
  Implementations from BrowserRange.normalize() in h/client.
*/
function normalizeRange(start, startOffset, end, endOffset, commonAncestor) {
  let r = {}

  // Look at the start
  if (start.nodeType === Node.ELEMENT_NODE) {
    // We are dealing with element nodes
    if (startOffset < start.childNodes.length) {
      r.start = getFirstTextNodeNotBefore(start.childNodes[startOffset])
    } else {
      r.start = getFirstTextNodeNotBefore(start)
    }
    r.startOffset = 0
  } else {
    // We are dealing with simple text nodes
    r.start = start
    r.startOffset = startOffset
  }

  // Look at the end
  if (end.nodeType === Node.ELEMENT_NODE) {
    // Get specified node.
    let node = end.childNodes[endOffset]

    if (node) { // Does that node exist?
      // Look for a text node either at the immediate beginning of node
      let n = node
      while (n && n.nodeType !== Node.TEXT_NODE) {
        n = n.firstChild
      }
      if (n) { // Did we find a text node at the start of this element?
        r.end = n
        r.endOffset = 0
      }
    }

    if (!r.end) {
      // We need to find a text node in the previous sibling of the node at the
      // given offset, if one exists, or in the previous sibling of its container.
      if (endOffset) {
        node = end.childNodes[endOffset - 1]
      } else {
        node = end.previousSibling
      }
      r.end = getLastTextNodeUpTo(node)
      r.endOffset = r.end.nodeValue.length
    }
  } else {
    // We are dealing with simple text nodes
    r.end = end
    r.endOffset = endOffset
  }

  // We have collected the initial data.
  // Now let's start to slice & dice the text elements!
  let nr = {}

  if (r.startOffset > 0) {
    // Do we really have to cut?
    if (!r.start.nextSibling || r.start.nodeValue.length > r.startOffset) {
      // Yes. Cut.
      nr.start = r.start.splitText(r.startOffset)
    } else {
      // Avoid splitting off zero-length pieces.
      nr.start = r.start.nextSibling
    }
  } else {
    nr.start = r.start
  }

  // is the whole selection inside one text element ?
  if (r.start === r.end) {
    if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
      nr.start.splitText(r.endOffset - r.startOffset)
    }
    nr.end = nr.start
  } else { // no, the end of the selection is in a separate text element
    // does the end need to be cut?
    if (r.end.nodeValue.length > r.endOffset) {
      r.end.splitText(r.endOffset)
    }
    nr.end = r.end
  }

  // Make sure the common ancestor is an element node.
  nr.commonAncestor = commonAncestor
  while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
    nr.commonAncestor = nr.commonAncestor.parentNode
  }

  return nr
}

/*
  Takes in a JSON object of start and end xpaths + offsets.
  Returns normalized start node, end node, and common ancestor.
  Implementation from SerializedRange.normalize.
*/
function deserializeRange(range, root) {
  let r = {}

  for (let p of ['start', 'end']) {
    let node
    try {
      node = getNodeFromXPath(range[p], root)
    } catch (e) {
      console.error(`Error while finding ${p} node: ${range[p]}: ${e}`)
    }
    if (!node) {
      console.error(`Couldn't find ${p} node: ${range[p]}`)
    }

    // Unfortunately, we *can't* guarantee only one textNode per
    // elementNode, so we have to walk along the element's textNodes until
    // the combined length of the textNodes to that point exceeds or
    // matches the value of the offset.
    let length = 0
    let targetOffset = range[`${p}Offset`]

    // Range excludes its endpoint because it describes the boundary position.
    // Target the string index of the last character inside the range.
    if (p === 'end') {
      targetOffset--
    }

    for (let tn of getTextNodes($(node))) { // TODO: is there a way to do this withou jquery?
      if ((length + tn.nodeValue.length) > targetOffset) {
        r[`${p}Container`] = tn
        r[`${p}Offset`] = range[`${p}Offset`] - length
        break
      } else {
        length += tn.nodeValue.length
      }
    }

    // If we fall off the end of the for loop without having set
    // 'startOffset'/'endOffset', the element has shorter content than when
    // we annotated, so throw an error:
    if (!range[`${p}Container`]) {
      console.error(`Couldn't find offset ${range[p+'Offset']} in element ${range[p]}`)
    }
  }

  // Here's an elegant next step...
  //
  //   range.commonAncestorContainer = $(range.startContainer).parents().has(range.endContainer)[0]
  //
  // ...but unfortunately Node.contains() is broken in Safari 5.1.5 (7534.55.3)
  // and presumably other earlier versions of WebKit. In particular, in a
  // document like
  //
  //   <p>Hello</p>
  //
  // the code
  //
  //   p = document.getElementsByTagName('p')[0]
  //   p.contains(p.firstChild)
  //
  // returns `false`. Yay.
  //
  // So instead, we step through the parents from the bottom up and use
  // Node.compareDocumentPosition() to decide when to set the
  // commonAncestorContainer and bail out.

  let thisContains // TODO: Change name back to contains
  if (!document.compareDocumentPosition) {
    // IE
    thisContains = (a, b) => { return a.contains(b) }
  } else {
    // Everyone else
    thisContains = (a, b) => { return a.compareDocumentPosition(b) & 16 }
  }

  $(r.startContainer).parents().forEach(function() { // TODO: Do without jquery?
    if (thisContains(this, r.endContainer)) {
      r.commonAncestorContainer = this
      return false
    }
  })

  return normalizeRange(
    r.startContainer,
    r.startOffset,
    r.endContainer,
    r.endOffset,
    r.commonAncestorContainer
  )
}

class NbRange {
  constructor(range) { // takes in browser native range object
    let nr = normalizeRange(
              range.startContainer,
              range.startOffset,
              range.endContainer,
              range.endOffset,
              range.commonAncestorContainer)
    this.start = nr.start
    this.end = nr.end
    this.commonAncestor = nr.commonAncestor
    // console.log(nr)
  }

  /*
    Returns this range as browser native range object.
    Implementation from NormalizedRange.toRange in h/client.
  */
  toNativeRange() { //
    let nativeRange = new Range()
    nativeRange.setStartBefore(this.start)
    nativeRange.setEndAfter(this.end)
    return nativeRange
  }

  /*
    Returns this range as a JSON object of start and end xpaths + offsets.
    implmentation from NormalizedRange.serialize in h/client.
  */
  serialize(root, ignoreSelector) {
    let serialization = (node, isEnd) => {
      let origParent
      if (ignoreSelector) {
        origParent = $(node).parents(":not(#{ignoreSelector})").eq(0) // TODO: Do this without jquery?
      } else {
        origParent = $(node).parent()
      }
      let xpath = getXpathFromNode(origParent, root)[0]
      let textNodes = getTextNodes(origParent)

      // Calculate real offset as the combined length of all the
      // preceding textNode siblings. We include the length of the
      // node if it's the end node.
      let nodes = textNodes.slice(0, textNodes.index(node))
      let offset = 0
      for (let n of nodes) {
        offset += n.nodeValue.length
      }

      if (isEnd) {
        return [xpath, offset + node.nodeValue.length]
      } else {
        return [xpath, offset]
      }
    }

    let start = serialization(this.start)
    let end = serialization(this.end, true)

    return {
      // XPath strings
      'start': start[0],
      'end': end[0],
      // Character offsets (integer)
      'startOffset': start[1],
      'endOffset': end[1]
    }
  }
}

/////////////// NbRange implmentation ends here.


/////////////// getTextBoundingBoxes (helper for Highlight.render) starts here.

/**
 * Returns true if `node` lies within a range.
 *
 * This is a simplified version of `Range.isPointInRange()` for compatibility
 * with IE.
 *
 * @param {Range} range
 * @param {Node} node
 */
function isNodeInRange(range, node) {
  if (node === range.startContainer || node === range.endContainer) {
    return true;
  }

  const nodeRange = node.ownerDocument.createRange();
  nodeRange.selectNode(node);
  const isAtOrBeforeStart =
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
  const isAtOrAfterEnd =
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
  nodeRange.detach();
  return isAtOrBeforeStart && isAtOrAfterEnd;
}

/**
 * Iterate over all Node(s) in `range` in document order and invoke `callback`
 * for each of them.
 *
 * @param {Range} range
 * @param {Function} callback
 */
function forEachNodeInRange(range, callback) {
  const root = range.commonAncestorContainer;

  // The `whatToShow`, `filter` and `expandEntityReferences` arguments are
  // mandatory in IE although optional according to the spec.
  const nodeIter = root.ownerDocument.createNodeIterator(root,
    NodeFilter.SHOW_ALL, null /* filter */, false /* expandEntityReferences */);

  let currentNode;
  while (currentNode = nodeIter.nextNode()) { // eslint-disable-line no-cond-assign
    if (isNodeInRange(range, currentNode)) {
      callback(currentNode);
    }
  }
}

/**
 * Returns the bounding rectangles of non-whitespace text nodes in `range`.
 *
 * @param {Range} range
 * @return {Array<Rect>} Array of bounding rects in viewport coordinates.
 */
function getTextBoundingBoxes(range) {
  const whitespaceOnly = /^\s*$/;
  const textNodes = [];
  forEachNodeInRange(range, function (node) {
    if (node.nodeType === Node.TEXT_NODE &&
        !node.textContent.match(whitespaceOnly)) {
      textNodes.push(node);
    }
  });

  let rects = [];
  textNodes.forEach(function (node) {
    const nodeRange = node.ownerDocument.createRange();
    nodeRange.selectNodeContents(node);
    if (node === range.startContainer) {
      nodeRange.setStart(node, range.startOffset);
    }
    if (node === range.endContainer) {
      nodeRange.setEnd(node, range.endOffset);
    }
    if (nodeRange.collapsed) {
      // If the range ends at the start of this text node or starts at the end
      // of this node then do not include it.
      return;
    }

    // Measure the range and translate from viewport to document coordinates
    const viewportRects = Array.from(nodeRange.getClientRects());
    nodeRange.detach();
    rects = rects.concat(viewportRects);
  });
  return rects;
}

/////////////// getTextBoundingBoxes (helper for Highlight.render) ends here.

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
  constructor(range) {
    this.element = null
    this.range = new NbRange(range)
    // let sr = this.range.serialize(document, null)
    // console.log(sr)
    // let dr = deserializeRange(sr, document)
    // console.log(dr)
  }

  bind(element) {
    this.element = element
    this.element.setAttribute('fill', 'rgb(255, 10, 10)')
    this.element.setAttribute('fill-opacity', '0.3')
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

    let rects = getTextBoundingBoxes(this.range.toNativeRange())
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


/* Helper function for checkForSelection */
function makeHighlight(range) {
    var h = pane.addHighlight(new Highlight(range));
    h.element.addEventListener("click", function () {
        if (!selecting) { pane.removeHighlight(h); }
    }, false)
}

function redrawHighlights() {
    pane.render()
}

function checkForSelection() {
    var selection = window.getSelection();

    if (!selection.isCollapsed) {
        // Set global state to reflect the fact we're making a selection.
        // Used to stop click events from deleting older highlights when
        // the click event is the result of a selection.
        selecting = true;

        makeHighlight(selection.getRangeAt(0));

        // Clear the selection
        selection.removeAllRanges();

        // Reset the selecting state in the next tick.
        setTimeout(function () { selecting = false; }, 0);
    }
}

document.addEventListener("mouseup", checkForSelection, false)
window.addEventListener("resize", redrawHighlights, false)

var el = document.querySelector('#document-pane')
var pane = new Pane(el)
var selecting = false
