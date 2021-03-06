/**
 * Returns true if `node` lies within a range.
 *
 * This is a simplified version of `Range.isPointInRange()` for compatibility
 * with IE.
 *
 * @param {Range} range
 * @param {Node} node
 */
function isNodeInRange (range, node) {
  if (node === range.startContainer || node === range.endContainer) {
    return true
  }

  const nodeRange = node.ownerDocument.createRange()
  nodeRange.selectNode(node)
  const isAtOrBeforeStart =
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0
  const isAtOrAfterEnd =
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0
  nodeRange.detach()
  return isAtOrBeforeStart && isAtOrAfterEnd
}

/**
 * Iterate over all Node(s) in `range` in document order and invoke `callback`
 * for each of them.
 *
 * @param {Range} range
 * @param {Function} callback
 */
function forEachNodeInRange (range, callback) {
  const root = range.commonAncestorContainer

  // The `whatToShow`, `filter` and `expandEntityReferences` arguments are
  // mandatory in IE although optional according to the spec.
  const nodeIter = root.ownerDocument.createNodeIterator(root,
    NodeFilter.SHOW_ALL, null /* filter */, false /* expandEntityReferences */)

  let currentNode
  while (currentNode = nodeIter.nextNode()) { // eslint-disable-line no-cond-assign
    if (isNodeInRange(range, currentNode)) {
      callback(currentNode)
    }
  }
}

/**
 * Returns the bounding rectangles of non-whitespace text nodes in `range`.
 *
 * @param {Range} range
 * @return {Array<Rect>} Array of bounding rects in viewport coordinates.
 */
function getTextBoundingBoxes (range) {
  const whitespaceOnly = /^\s*$/
  const textNodes = []
  forEachNodeInRange(range, node => {
    if (node.nodeType === Node.TEXT_NODE &&
        !node.textContent.match(whitespaceOnly)) {
      textNodes.push(node)
    }
  })

  let rects = []
  textNodes.forEach(node => {
    const nodeRange = node.ownerDocument.createRange()
    nodeRange.selectNodeContents(node)
    if (node === range.startContainer) {
      nodeRange.setStart(node, range.startOffset)
    }
    if (node === range.endContainer) {
      nodeRange.setEnd(node, range.endOffset)
    }
    if (nodeRange.collapsed) {
      // If the range ends at the start of this text node or starts at the end
      // of this node then do not include it.
      return
    }

    // Measure the range and translate from viewport to document coordinates
    const viewportRects = Array.from(nodeRange.getClientRects())
    nodeRange.detach()
    rects = rects.concat(viewportRects)
  })
  return rects
}

export {
  getTextBoundingBoxes
}
