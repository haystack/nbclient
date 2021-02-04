<template>
  <g
      class="nb-circle"
    >
    <circle
        :cx="locationX"
        :cy="locationY"
        fill="yellow"
        opacity="0.3"
        r="20">
    </circle>
  </g>
</template>

<script>
// import { getTextBoundingBoxes } from '../../utils/overlay-util.js'

/**
 * Component for individual highlight overlay corresponding to each thread.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {?NbComment} thread - thread for this highlight,
 *   null if this is a draft
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=[] - currently hovered threads
 * @vue-prop {NbRange} range - text range for this higlight
 * @vue-prop {Boolean} showHighlights=true - true if highlights are overlayed
 *   on text, false if collapsed to the side
 *
 * @vue-computed {String} style - additional CSS for highlight color
 *   in case this is a draft, selected, or hovered
 * @vue-computed {Object} bounds - bounds of highlight
 * @vue-computed {Array<Rect>} bounds.boxes - bouding box rectangles of the
 *   text range, calculated by {@link getTextBoundingBoxes}
 * @vue-computed {Number} bounds.offsetX - x coordinate offset of highlight
 * @vue-computed {Number} bounds.offsetY - y coordinate offset of highlight
 * @vue-computed {Boolan} visible - true if this highlight should be overlayed
 *   on text (i.e. showHighlights is true or this thread is selected)
 *
 * @vue-event {NbComment} select-thread - Emit this thread when user clicks on
 *   this highlight
 * @vue-event {NbComment} hover-thread - Emit this thread when user starts
 *   hovering over this highlight
 * @vue-event {NbComment} unhover-thread - Emit this thread when user stops
 *   hovering over this highlight
 */
export default {
  name: 'nb-circle',
  props: {
    location: {
      type: Array,
      default: () => []
    },
  },
  computed: {
    locationX: function() {
      // let offsetX = window.pageXOffset ||
      //   document.documentElement.scrollLeft ||
      //   document.body.scrollLeft || 0
      
      return this.location[0]
    },
    locationY: function() {
      // let offsetY = window.pageYOffset ||
      //   document.documentElement.scrollTop ||
      //   document.body.scrollTop || 0
      // console.log(offsetY)
      return this.location[1] 
    }
  },
  watch: {
    /**
     * When the currently selected thread changes, check if the highlight is
     * in the view. If not, scroll down/up the window to center the highlight.
     */
  },

}
</script>
