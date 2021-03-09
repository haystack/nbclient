/**
* The built-in interface for HTML (DOM) elements.
* @external HTMLElement
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement}
*/
 
/**
* Determine if the node is part of the container.
* Inclusive i.e. the node can be the container itself.
*
* @param {HTMLElement} node
* @param {HTMLElement} container
* @return {Boolean} True if the node is part of the container
*/
function isNodePartOf (node, container) {
    return (node === container) ? true : container.contains(node)
   }
    
   /**
   * Determine the first text node in or after the given node.
   * Helper function for {@link normalizeRange}.
   *
   * @param {HTMLElement} n - given node
   * @return {?HTMLElement} First text node in or after the given node, if exists
   */
   function getFirstTextNodeNotBefore (n) {
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
        break
      default:
        // Not a text or an element node.
    }
    
    // Could not find a text node in current node, go forward
    n = n.nextSibling
    return n ? getFirstTextNodeNotBefore(n) : null
   }
    
   /**
   * Determine the last text node inside or before the given node.
   * Helper function for {@link normalizeRange}.
   *
   * @param {HTMLElement} n - given node
   * @return {?HTMLElement} Last text node inside or before the given node, if exists
   */
   function getLastTextNodeUpTo (n) {
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
        break
      default:
        // Not a text node, and not an element node.
    }
    
    // Could not find a text node in current node, go backwards
    n = n.previousSibling
    return n ? getLastTextNodeUpTo(n) : null
   }
    
   /**
   * Flatten a nested array structure and returns an array.
   * Helper function for {@link getTextNodes}.
   *
   * @param {Array} array - nested array
   * @return {Array} Flattened array
   */
   function flatten (array) {
    let flat = []
    for (let el of array) {
      flat = flat.concat(Array.isArray(el) ? flatten(el) : el)
    }
    return flat
   }
    
   /**
   * Get all text nodes (recursive) within the given node.
   * Helper function for {@link serializeTextNode} and {@link deserializeNbRange}.
   *
   * @param {HTMLElement} node - given node
   * @return {Array<HTMLElement>} List of all text nodes
   */
   function getTextNodes (node) {
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
    
   /**
   * Get the xpath from the root element to the given element.
   *
   * @param {HTMLElement} element - given element
   * @param {HTMLElement} root - root element
   * @return {String} Xpath from the root element to the given element
   */
   function getXpathFromNode (element, root) {
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
    
   /**
   * Get the node described by the xpath and root element.
   *
   * @param {String} xpath - xpath to the node
   * @param {HTMLElement} root - root element
   * @return {HTMLElement} Node described by the xpath and root
   */
   function getNodeFromXpath (xpath, root) {
    let nodes = []
    let result
    let item
    
    try {
      result = document.evaluate(xpath, root, null, XPathResult.ANY_TYPE, null)
      for (item = result.iterateNext(); item; item = result.iterateNext()) {
        nodes.push(item)
      }
    
      if (nodes.length === 0) {
        // try a hack to handle namespace defaults in xhtml documents
        xpath = xpath.replace(/\/([a-z])/ig, '/my:$1')
        result = document.evaluate(xpath, root, _ => {
          return document.body.namespaceURI
        }, XPathResult.ANY_TYPE, null)
        for (item = result.iterateNext(); item; item = result.iterateNext()) {
          nodes.push(item)
        }
      }
    } catch (exc) {
      // Invalid xpath expressions make their way here sometimes.  If that happens,
      // we still want to return an empty set without an exception.
    }
    
    return nodes[0]
   }
   
   /**
    * Decrease the accuracy by removing the highest available index of 
    * the xpath to find the node in case there are changes in the DOM
    * e.g.: /html[1]/body[1]/main[1]/p[1] --> /html/body[1]/main[1]/p[1] 
    * 
    * @param {String} xpath - xpath to the node
    * @return {String} xpath with reduced accuracy 
    */
   function decreaseXpathAccuracy(xpath) {
      let start
      let end
      const separatorPos = xpath.indexOf('[');
    
      if (separatorPos !== -1) {
          start = xpath.slice(0, separatorPos);
          end = xpath.slice(xpath.indexOf(']') + 1, xpath.length);
          return `${start}${end}`   
      }
    
      return null
   }
    
   /**
    * Recursively evaluate the less accurate xpath from decreaseXpathAccuracy(xpath).
    * If the node is found, return that HTMLElement, if not recurse again with a less accurate path 
    * 
    * @param {String} xpath - xpath to the node
    * @param {HTMLElement} root - root element
    * @return {HTMLElement} Node described by the xpath and root
    */
   function getNodeFromRelativeXpath(xpath, root) {
      console.log(xpath);
    
      if (!xpath) {
          return null
      }
    
      return document.evaluate(`/${xpath}`, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue
          || getNodeFromRelativeXpath(decreaseXpathAccuracy(xpath), root)
   }
    
   /**
   * Serialization of a text node given a root element.
   * The xpath points to an element containing the text node,
   * where the offset specifies the start offset of the text node.
   *
   * @typedef {Array} SerializedTextNode
   * @property {String} 0 - xpath
   * @property {Number} 1 - offset
   */
    
   /**
   * Serialize the text node given the root element.
   * Helper function for {@link NbRange#serialize}.
   *
   * @param {HTMLElement} root - root element
   * @param {HTMLElement} node - text node
   * @return {SerializedTextNode} Serialization of the text node given the root element
   */
   function serializeTextNode (root, node) {
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
    getNodeFromXpath,
    getNodeFromRelativeXpath,
    decreaseXpathAccuracy
   }
    
   
   