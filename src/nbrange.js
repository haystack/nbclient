import * as DomUtil from './dom-util.js'

class NbRange {
  constructor(start, end, commonAncestor) {
    this.start = start
    this.end = end
    this.commonAncestor = commonAncestor
  }

  /*
    Returns this range as browser native range object.
    Implementation from NormalizedRange.toRange in h/client.
  */
  toRange() {
    let range = new Range()
    range.setStartBefore(this.start)
    range.setEndAfter(this.end)
    return range
  }

  /*
    Returns nbRange as a JSON object of start and end xpaths + offsets.
    implmentation from NormalizedRange.serialize in h/client.
  */
  serialize(root = document) {
    let start = DomUtil.serializeTextNode(root, this.start)
    let end = DomUtil.serializeTextNode(root, this.end, true)

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

function createNbRange(range) {
  let nr = normalizeRange(
            range.startContainer,
            range.startOffset,
            range.endContainer,
            range.endOffset,
            range.commonAncestorContainer)
  return new NbRange(nr.start, nr.end, nr.commonAncestor)
}

/*
  Takes in a JSON object of start and end xpaths + offsets.
  Returns normalized start node, end node, and common ancestor.
  Implementation from SerializedRange.normalize.
*/
function deserializeNbRange(json, root = document) {
  let r = {}

  for (let p of ['start', 'end']) {
    let node
    try {
      node = DomUtil.getNodeFromXpath(json[p], root)
    } catch (e) {
      console.error(`Error while finding ${p} node: ${json[p]}: ${e}`)
    }
    if (!node) {
      console.error(`Couldn't find ${p} node: ${json[p]}`)
    }

    // Unfortunately, we *can't* guarantee only one textNode per
    // elementNode, so we have to walk along the element's textNodes until
    // the combined length of the textNodes to that point exceeds or
    // matches the value of the offset.
    let length = 0
    let targetOffset = json[`${p}Offset`]

    // Range excludes its endpoint because it describes the boundary position.
    // Target the string index of the last character inside the range.
    if (p === 'end') {
      targetOffset--
    }

    for (let tn of DomUtil.getTextNodes(node)) {
      if ((length + tn.nodeValue.length) > targetOffset) {
        r[`${p}Container`] = tn
        r[`${p}Offset`] = json[`${p}Offset`] - length
        break
      } else {
        length += tn.nodeValue.length
      }
    }

    // If we fall off the end of the for loop without having set
    // 'startOffset'/'endOffset', the element has shorter content than when
    // we annotated, so throw an error:
    if (!r[`${p}Container`]) {
      console.error(`Couldn't find offset ${json[p+'Offset']} in element ${json[p]}`)
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

  let contains
  if (!document.compareDocumentPosition) {
    // IE
    contains = (a, b) => { return a.contains(b) }
  } else {
    // Everyone else
    contains = (a, b) => { return a.compareDocumentPosition(b) & 16 }
  }

  let parent = r.startContainer.parentNode
  while (parent) {
    if (contains(parent, r.endContainer)) {
      r.commonAncestorContainer = parent
      break
    }
    parent = parent.parentNode
  }

  let nr = normalizeRange(
    r.startContainer,
    r.startOffset,
    r.endContainer,
    r.endOffset,
    r.commonAncestorContainer
  )

  return new NbRange(nr.start, nr.end, nr.commonAncestor)
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
      r.start = DomUtil.getFirstTextNodeNotBefore(start.childNodes[startOffset])
    } else {
      r.start = DomUtil.getFirstTextNodeNotBefore(start)
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
      r.end = DomUtil.getLastTextNodeUpTo(node)
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

export {
  createNbRange,
  deserializeNbRange
}
