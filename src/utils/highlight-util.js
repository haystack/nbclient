import { isNodePartOf } from './dom-util.js'

/**
 * The built-in interface for mouse events.
 * @external MouseEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent}
 */

/**
 * Clone a mouse event. Helper function for {@link eventsProxyMouse}.
 *
 * @param {MouseEvent} e - original mouse event
 * @param {String} type - mouse event type
 * @return {MouseEvent} New mouse event cloned from the original event
 */
function clone (e, type) {
  let opts = Object.assign({}, e, { bubbles: false })
  try {
    return new MouseEvent(type, opts)
  } catch (err) { // compat: webkit
    let copy = document.createEvent('MouseEvents')
    copy.initMouseEvent(type, false, opts.cancelable, opts.view,
      opts.detail, opts.screenX, opts.screenY,
      opts.clientX, opts.clientY, opts.ctrlKey,
      opts.altKey, opts.shiftKey, opts.metaKey,
      opts.button, opts.relatedTarget)
    return copy
  }
}

/**
 * Check if the item's bouding rectangles contains the screen coordinate.
 * Helper function for {@link eventsProxyMouse}.
 *
 * @param {HTMLElement} item
 * @param {Number} x - screen x coordinate
 * @param {Number} y - screen y coordinate
 * @return {Boolean} True if the item's bouding rectangles contain the screen coordinate.
 */
function contains (item, x, y) {
  function rectContains (r, x, y) {
    let bottom = r.top + r.height
    let right = r.left + r.width
    return (r.top <= y && r.left <= x && bottom > y && right > x)
  }

  function getClientRects (item) {
    let rects = []
    let el = item.firstChild
    while (el) {
      rects.push(el.getBoundingClientRect())
      el = el.nextSibling
    }
    return rects
  }

  // Check overall bounding box first
  let rect = item.getBoundingClientRect()
  if (!rectContains(rect, x, y)) {
    return false
  }

  // Then continue to check each child rect
  let rects = getClientRects(item)
  for (let rect of rects) {
    if (rectContains(rect, x, y)) return true
  }
  return false
}

/**
 * Set up proxy for click and/or hover mouse events on highlight overlays.
 * When click is detected on the source (body of text), event will be passed
 * on to the target (highlight overlays) if the click was not a selection
 * and the mouse coordinate is inside some higlight overlays.
 * Similarly, hover detected on the source will be passed on to the target
 * if inside some highlight overlays.
 *
 * Helper function for {@link module:NbHighlights}.
 * This is neccessary because mouse events on highlight overlays are ignored
 * by default to allow click-and-drag selections over the body of text.
 *
 * @param {HTMLElement} src - the souce (body of text)
 * @param {HTMLElement} target - the target (highlight overlays)
 */
function eventsProxyMouse (src, target) {
  src.addEventListener('click', e => {
    // ignore mouse click or selection on the side bar
    if (isNodePartOf(e.target, document.querySelector('#nb-app-wrapper'))) {
      return
    }

    if (!window.getSelection().isCollapsed) { // selection, not click
      // Can remove selection here if selection was to annotate document
      // because 'mouseup' on document.body is triggered first before 'click'
      window.getSelection().removeAllRanges()
      return
    }

    // Iterate in reverse order, so when clicked on overlapping highlights,
    // we select the highlight that starts closest to the mouse click coords.
    for (let i = target.childNodes.length - 1; i >= 0; i--) {
      let child = target.childNodes[i]
      if (
        child.classList &&
        child.classList.contains('nb-highlight') &&
        contains(child, e.clientX, e.clientY)
      ) {
        // We only dispatch the click event to the first matching highlight
        child.dispatchEvent(clone(e, e.type))
        return
      }
    }
    // clicked outside of highlights, unselect all threads
    target.dispatchEvent(new CustomEvent('unselect-thread'))
  })

  src.addEventListener('mousemove', e => {
    // ignore mouse hover on the side bar
    if (isNodePartOf(e.target, document.querySelector('#nb-app-wrapper'))) {
      return
    }

    for (let child of target.childNodes) {
      if (
        child.classList &&
        child.classList.contains('nb-highlight')
      ) {
        let type = contains(child, e.clientX, e.clientY)
          ? 'mouseenter'
          : 'mouseleave'
        child.dispatchEvent(clone(e, type))
      }
    }
  })
}

export {
  eventsProxyMouse
}
