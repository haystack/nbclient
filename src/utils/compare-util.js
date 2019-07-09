/**
 * Helper function for sorting array items.
 *
 * @param {String} key - key for attribute to be sorted
 * @param {String} type - type of attribute to be sorted ('key' or 'func')
 * @param {Boolean} ascending - sort order (ascending if true, descending otherwise)
 * @return {Function} Sorting function to be passed in to
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort Array.prototype.sort()}
 */
function compare (key, type = 'key', ascending = true) {
  return function (a, b) {
    let valueA = (type === 'func') ? a[key]() : a[key]
    let valueB = (type === 'func') ? b[key]() : b[key]
    if (valueA < valueB) {
      return ascending ? -1 : 1
    }
    if (valueA > valueB) {
      return ascending ? 1 : -1
    }
    return 0
  }
}

/**
 * Compare positions of ranges in document. This function can be passed in to
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort Array.prototype.sort()}
 *
 * @param {HTMLElement} a
 * @param {HTMLElement} b
 * @return {Number} -1 if a starts before b, 1 if b starts before a;
 * When a and b have the same start, -1 if a ends before b, 1 if b ends before a;
 * 0 if the ranges are the same
 */
function compareDomPosition (a, b) {
  if (a.range.start.isSameNode(b.range.start)) {
    // a and b have the same start
    if (a.range.end.isSameNode(b.range.end)) {
      // a and b have the same range
      return 0
    } else if (
      a.range.end.compareDocumentPosition(b.range.end) &
      Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      // a ends before b
      return -1
    } else {
      // b ends before a
      return 1
    }
  } else if (
    a.range.start.compareDocumentPosition(b.range.start) &
    Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    // a starts before b
    return -1
  } else {
    // b starts before a
    return 1
  }
}

export {
  compare,
  compareDomPosition
}
