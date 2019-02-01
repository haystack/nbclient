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

/* Helper function for NbRange.serialize() */
function serializeTextNode(root, node, isEnd) {
  let parent = $(node).parent() // TODO: no jquery?
  let xpath = getXpathFromNode(parent, root)[0]
  let textNodes = getTextNodes(parent)

  // Calculate real offset as the combined length of all the
  // preceding textNode siblings. We include the length of the
  // node if it's the end node.
  let nodes = textNodes.slice(0, textNodes.index(node))
  let offset = 0
  for (let n of nodes) {
    offset += n.nodeValue.length
  }

  if (isEnd) {
    offset += node.nodeValue.length
  }
  return [xpath, offset]
}

export {
  getFirstTextNodeNotBefore,
  getLastTextNodeUpTo,
  serializeTextNode
}
