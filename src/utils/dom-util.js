/*
  Determine if node is part of container.
  Inclusive i.e. the node can be the container itself.
*/
function isNodePartOf(node, container) {
  return (node === container) ? true : container.contains(node)
}

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
  Flatten a nested array structure and returns an array.
  Helper function for getTextNodes().
*/
function flatten(array) {
  let flat = []
  for (let el of array) {
    flat = flat.concat(Array.isArray(el) ? flatten(el) : el)
  }
  return flat
}

/*
  Finds all text nodes within the elements in the current collection.
  Returns a new jQuery collection of text nodes.
  Helper function for serializeTextNode() and deserializeNbRange().
*/
function getTextNodes(node) {
  let findTextNodes = (node) => {
    if (node && node.nodeType !== Node.TEXT_NODE) {
      let nodes = []

      // If not a comment then traverse children collecting text nodes.
      // We traverse the child nodes manually rather than using the .childNodes
      // property because IE9 does not update the .childNodes property after
      // .splitText() is called on a child text node.
      if (node.nodeType !== Node.COMMENT_NODE) {
        // Start at the last child and walk backwards through siblings.
        let child = node.lastChild
        while (child) {
          nodes.push(findTextNodes(child))
          child = child.previousSibling
        }
      }
      // Finally reverse the array so that nodes are in the correct order.
      return nodes.reverse()
    } else {
      return node
    }
  }

  let textNodes = findTextNodes(node)
  return flatten(textNodes)
}

// Implementation from the other nb demo I made.
function getXpathFromNode(element, root) {
  if (!element || element === root) {
    return ''
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return getXpathFromNode(element.parentNode, root)
  }

  let index = 1 // xpath index starts with 1 (not 0-indexed).
  let prevSibling = element.previousElementSibling

  while (prevSibling) {
    if (prevSibling.nodeName === element.nodeName) {
      index++
    }
    prevSibling = prevSibling.previousElementSibling
  }

  let nodeName = element.nodeName.toLowerCase()
  return `${getXpathFromNode(element.parentNode, root)}/${nodeName}[${index}]`
}

// Implementation from the other nb demo I made.
function getNodeFromXpath(xpath, root) {
  var nodes = [], result, item

  try {
    result = document.evaluate(xpath, root, null, XPathResult.ANY_TYPE, null);
    for (item = result.iterateNext(); item; item = result.iterateNext()) {
    nodes.push(item);}

    if (nodes.length === 0) {
      //try a hack to handle namespace defaults in xhtml documents
      xpath = xpath.replace(/\/([a-z])/ig, '/my:$1');
      result = document.evaluate(xpath, root, function () {
        return document.body.namespaceURI;
      }, XPathResult.ANY_TYPE, null);
      for (item = result.iterateNext(); item; item = result.iterateNext()) {
      nodes.push(item);}
    }
  }
  catch (exc) {
    // Invalid xpath expressions make their way here sometimes.  If that happens,
    // we still want to return an empty set without an exception.
  }

  return nodes[0]
}

/* Helper function for NbRange.serialize() */
function serializeTextNode(root, node) {
  let xpath = getXpathFromNode(node.parentNode, root)
  let textNodes = getTextNodes(node.parentNode)

  // Calculate real offset as the combined length of all the
  // preceding textNode siblings. We include the length of the
  // node if it's the end node.
  let nodes = textNodes.slice(0, textNodes.indexOf(node))
  let offset = 0
  for (let n of nodes) {
    offset += n.nodeValue.length
  }

  return [xpath, offset]
}

export {
  isNodePartOf,
  getTextNodes,
  getFirstTextNodeNotBefore,
  getLastTextNodeUpTo,
  serializeTextNode,
  getNodeFromXpath
}
