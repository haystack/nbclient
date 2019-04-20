/* Helper function for eventsProxyMouse */
function clone(e) {
  let opts = Object.assign({}, e, {bubbles: false})
  try {
    return new MouseEvent(e.type, opts)
  } catch(err) { // compat: webkit
    let copy = document.createEvent('MouseEvents')
    copy.initMouseEvent(e.type, false, opts.cancelable, opts.view,
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

  // Check overall bounding box first
  let rect = item.getBoundingClientRect()
  if (!rectContains(rect, x, y)) {
    return false
  }

  // Then continue to check each child rect
  let rects = item.getClientRects()
  for (let i = 0, len = rects.length; i < len; i++) {
    if (rectContains(rects[i], x, y)) {
      return true
    }
  }
  return false
}

/* Helper function for Highlights.constructor */
function eventsProxyMouse(target, tracked) {
  function dispatch(e) {
    // We walk through the set of tracked elements in reverse order so that
    // events are sent to those most recently added first.
    //
    // This is the least surprising behaviour as it simulates the way the
    // browser would work if items added later were drawn "on top of"
    // earlier ones.
    for (let i = tracked.length - 1; i >= 0; i--) {
      let t = tracked[i]

      if (!contains(t, e.clientX, e.clientY)) {
          continue
      }

      // The event targets this highlight, so dispatch a cloned event:
      t.dispatchEvent(clone(e))
      // We only dispatch the cloned event to the first matching highlight.
      break
    }
  }

  //TODO: add hover event
  for (let ev of ['mouseup', 'mousedown', 'click']) {
    target.addEventListener(ev, (e) => dispatch(e), false)
  }
}

/* Helper function for Highlights.render */
function coords(el) {
  let rect = el.getBoundingClientRect()
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft,
    height: rect.height,
    width: rect.width
  }
}

/* Helper function for Highlights.render */
function setCoords(el, coords) {
  el.style.top = `${coords.top}px`
  el.style.left = `${coords.left}px`
  el.style.height = `${coords.height}px`
  el.style.width = `${coords.width}px`
}
