import * as DomUtil from '../utils/dom-util.js'
 
/**
* The browser native representation for range (selection) of text.
* @external Range
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range}
*/
 
/**
* Serialization of a text range (selection) given a root element,
* represented by the start (first) and end (last) characters.
*
* The start xpath points to the node containing the start character,
* where the start offset specifies the character count to the start character
* within the start node. Similarly, the end xpath and offset are the end node
* and character count to the end character within it.
*
* The range is inclusive, meaning the start and end character themselves are
* both part of the range.
*
* @typedef {Object} SerializedRange
* @property {String} start - xpath to the start node
* @property {String} end - xpath to the end node
* @property {Number} startOffset - offset within the start node
* @property {Number} endOffset - offset within the end node
*/
 
/**
* Normalization of a text range (selection), represented by the first and last characters.
*
* The start node points to the text node starting with the first character.
* The end node points to the text node ending with the last character.
* The range is inclusive, meaning the first and last character themselves are
* both part of the range.
*
* See {@link normalizeRange} for the implmentation details.
*
* @typedef {Object} NormalizedRange
* @property {HTMLElement} start - start node
* @property {HTMLElement} end - end node
* @property {HTMLElement} commonAncestor - common ancestor of the start and end nodes
*/
 
/** Class representing a range (selection) of text in NB. */
class NbRange {
 /**
  * Create a range of text in NB.
  * See {@link NormalizedRange} for how the start node, end node, and common ancestor define a range.
  *
  * @param {HTMLElement} start - start node, sets {@link NbRange#start}
  * @param {HTMLElement} end - end node, sets {@link NbRange#end}
  * @param {HTMLElement} commonAncestor - common ancestor of the start and end nodes, sets {@link NbRange#commonAncestor}
  */
 constructor (start, end, commonAncestor) {
   /**
    * Start (first) node of this range.
    * @name NbRange#start
    * @type HTMLElement
    */
   this.start = start
 
   /**
    * End (last) node of this range.
    * @name NbRange#end
    * @type HTMLElement
    */
   this.end = end
 
   /**
    * Common ancestor of the start and end nodes of this range.
    * @name NbRange#commonAncestor
    * @type HTMLElement
    */
   this.commonAncestor = commonAncestor
 }
 
 /**
  * Create a new browser native range from this range. Implementation from
  * {@link https://github.com/hypothesis/client/blob/734e3a25318364819a8c38ef881e4788a2b06365/src/annotator/anchoring/range.coffee#L369 NormalizedRange.toRange in hypothesis/client}.
  *
  * @return {Range} New browser native range converted from this range.
  */
 toRange () {
   let range = new Range()
   range.setStartBefore(this.start)
   range.setEndBefore(this.end)
   return range
 }
 
 /**
  * Create a serialization of this range. Implementation from
  * {@link https://github.com/hypothesis/client/blob/734e3a25318364819a8c38ef881e4788a2b06365/src/annotator/anchoring/range.coffee#L307 NormalizedRange.serialize in hypothesis/client}.
  *
  * @return {SerializedRange} New SerializedRange created from this range.
  */
 serialize (root = document) {
   let start = DomUtil.serializeTextNode(root, this.start)
   let end = DomUtil.serializeTextNode(root, this.end)
 
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
 
/**
* Create a new {@link NbRange} object by normalizing the browser native range.
*
* @param {Range} range - browser native range
* @return {NbRange} New NbRange created from the browser range
*/
function createNbRange (range) {
 let nr = normalizeRange(
   range.startContainer,
   range.startOffset,
   range.endContainer,
   range.endOffset,
   range.commonAncestorContainer)
 return new NbRange(nr.start, nr.end, nr.commonAncestor)
}
 
/**
* Create a new {@link NBRange} by deserializing a {@link SerializedRange},
* then normalizing the deserialized range.
*
* @param {SerializedRange} json - serialized range
* @param {HTMLElement} root - root element for the serialized range
* @return {NbRange} New NbRange created from the serialized range
*/
function deserializeNbRange (json, root = document) {
 let r = {}
 
 for (let p of ['start', 'end']) {
   let node
   try {
     node = DomUtil.getNodeFromXpath(json[p], root)
   } catch (e) {
     console.error(`Error while finding ${p} node: ${json[p]}: ${e}`)
   }
 
   if (!node) {
       console.warn('---- can not find node, will try another way');
       node = DomUtil.getNodeFromRelativeXpath(DomUtil.decreaseXpathAccuracy(json[p]), root)
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
     console.error(`Couldn't find offset ${json[p + 'Offset']} in element ${json[p]}`)
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
 
/**
* Normalize a range of text defined. Implementation from
* {@link https://github.com/hypothesis/client/blob/734e3a25318364819a8c38ef881e4788a2b06365/src/annotator/anchoring/range.coffee#L154 BrowserRange.normalize in hypothesis/client}.
*
* The range is passed in by the start node,
* start offset, end node, end offset (as defined in {@link SerializedRange})
* as well as the common ancestor of the start and end nodes.
*
* Helper function for {@link createNbRange} and {@link deserializeNbRange}.
*
* @params {HTMLElement} start - the start node
* @params {Number} startOffset - offset within the start node
* @params {HTMLElement} end - the end node
* @params {Number} endOffset - offset within the end node
* @params {HTMLElement} commonAncestor - common ancestor of the start and end nodes
* @return {NormalizedRange} New NormalizedRange created by normalizing the range
*/
function normalizeRange (start, startOffset, end, endOffset, commonAncestor) {
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
   nr.end = nr.start.splitText(
     Math.min(nr.start.nodeValue.length, r.endOffset - r.startOffset))
 } else { // no, the end of the selection is in a separate text element
   // does the end need to be cut?
   nr.end = r.end.splitText(Math.min(r.end.nodeValue.length, r.endOffset))
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
 

