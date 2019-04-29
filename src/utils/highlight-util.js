import { isNodePartOf } from './dom-util.js'

/* Helper function for eventsProxyMouse */
function clone(e, type) {
  let opts = Object.assign({}, e, {bubbles: false})
  try {
    return new MouseEvent(type, opts)
  } catch(err) { // compat: webkit
    let copy = document.createEvent('MouseEvents')
    copy.initMouseEvent(type, false, opts.cancelable, opts.view,
                        opts.detail, opts.screenX, opts.screenY,
                        opts.clientX, opts.clientY, opts.ctrlKey,
                        opts.altKey, opts.shiftKey, opts.metaKey,
                        opts.button, opts.relatedTarget)
    return copy
  }
}

/* Helper function for eventsProxyMouse */
function contains(item, x, y) {
  function rectContains(r, x, y) {
    let bottom = r.top + r.height
    let right = r.left + r.width
    return (r.top <= y && r.left <= x && bottom > y && right > x)
  }

  function getClientRects(item) {
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

/* Helper function for Highlights.constructor */
function eventsProxyMouse(src, target) {
  src.addEventListener('click', function(e) {
    if (!window.getSelection().isCollapsed) { return } // selection, not click
    // ignore mouse click on the side bar
    if (
      isNodePartOf(e.target, document.querySelector('#nb-app'))
      || e.target.classList.contains('nb-comment-tooltip')
    ) { return }

    for (let child of target.childNodes) {
      if (
        child.classList
        && child.classList.contains('nb-highlight')
        && contains(child, e.clientX, e.clientY)
      ) {
        // We only dispatch the click event to the first matching highlight
        child.dispatchEvent(clone(e, e.type))
        return
      }
    }
    // clicked outside of highlights, unselect all threads
    target.dispatchEvent(new CustomEvent('unselect-thread'))
  })

  src.addEventListener('mousemove', function(e) {
    // ignore mouse hover on the side bar
    if (isNodePartOf(e.target, document.querySelector('#nb-app'))) { return }

    for (let child of target.childNodes) {
      if (
        child.classList
        && child.classList.contains('nb-highlight')
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
