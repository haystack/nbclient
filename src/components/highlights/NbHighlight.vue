<template>
  <g
      class="nb-highlight"
      v-if="visible"
      :style="style"
      @click="onClick()"
      @mouseenter="onHover(true)"
      @mouseleave="onHover(false)">
    <rect
        v-for="(box, index) in bounds.boxes"
        :key="index"
        :x="box.left + bounds.offsetX"
        :y="box.top + bounds.offsetY"
        :height="box.height"
        :width="box.width">
    </rect>
  </g>
  <g
      class="nb-highlight"
      v-else
      :style="style"
      @click="$emit('select-thread',thread)"
      @mouseenter="onHover(true)"
      @mouseleave="onHover(false)">
    <rect
        v-for="(box, index) in bounds.boxes"
        :key="index"
        :x="bounds.offsetX"
        :y="box.top + bounds.offsetY"
        :height="box.height"
        width="10">
    </rect>
  </g>
</template>

<script>
import { getTextBoundingBoxes } from '../../utils/overlay-util.js'
import axios from 'axios'

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
  name: 'nb-highlight',
  props: {
    thread: Object,
    user: Object,
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    range: Object,
    showHighlights: {
      type: Boolean,
      default: true
    },
    activeClass: {
      type: Object,
      default: () => {}
    },
  },
  watch: {
    /**
     * When the currently selected thread changes, check if the highlight is
     * in the view. If not, scroll down/up the window to center the highlight.
     */
    threadSelected: function (val) {
      //console.log('threadSelected nbH')
      if (this.thread !== val) { return }
      let rect = this.$el.getBoundingClientRect()
      let elTop = rect.top
      let elHeight = rect.height
      let viewHeight = window.innerHeight
      if (elTop < 0 || (elTop + elHeight) > viewHeight) {
        let viewTop = window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop || 0
        let center = viewTop + elTop + (elHeight / 2) - (viewHeight / 2)
        window.scrollTo({
          top: center,
          left: 0,
          behavior: 'smooth'
        })
      }
    }
  },
  computed: {
    style: function () {
      if (!this.thread) {
        return 'fill: rgb(231, 76, 60); fill-opacity: 0.3;'
      }
      if (this.thread === this.threadSelected) {
        return 'fill: rgb(1, 99, 255); fill-opacity: 0.3;'
      }
      if (this.threadsHovered.includes(this.thread)) {
        return 'fill: rgb(1, 99, 255); fill-opacity: 0.12;'
      }
      if (this.thread.spotlight && this.thread.spotlight.type === 'EM') {
        return 'stroke: lime; fill: lime; fill-opacity: 0.3; stroke-opacity: 0.9; stroke-dasharray: 1,1; stroke-width: 2px;'
      }
      return null
    },
    bounds: function () {
      let bounds = {}
      if (this.thread) {
        bounds.boxes = getTextBoundingBoxes(this.thread.range.toRange())
      } else {
        bounds.boxes = getTextBoundingBoxes(this.range.toRange())
      }
      bounds.offsetX = window.pageXOffset ||
        document.documentElement.scrollLeft ||
        document.body.scrollLeft || 0
      bounds.offsetY = window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop || 0
      return bounds
    },
    visible: function () {
      return this.showHighlights || (this.thread === this.threadSelected)
    }
  },
  methods: {
    onHover: function (state) {
      this.$emit(state ? 'hover-thread' : 'unhover-thread', this.thread)
    },
    onClick: function () {
      if (this.thread.spotlight && this.thread.spotlight.type === 'EM') {
        const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
        const token = localStorage.getItem("nb.user");
        const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
        axios.post(`/api/spotlights/log`, {
          spotlight_id: this.thread.spotlight.id,
          action: 'CLICK', 
          type: this.thread.spotlight.type.toUpperCase(), 
          annotation_id: this.thread.id, 
          class_id: this.activeClass.id,
          role: this.user.role.toUpperCase() 
        }, config)
      }
      this.$emit('select-thread', this.thread)
    }
  }
}
</script>
