<template>
  <g
      class="nb-highlight"
      v-if="visible"
      :style="style"
      @click="$emit('select-thread',thread)"
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
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    range: Object,
    showHighlights: {
      type: Boolean,
      default: true
    }
  },
  created: function() {
    const commentsBlock = document.createElement("div")
    const newDiv = document.createElement("div")
    newDiv.innerText=(`${this.thread.text} - ${this.thread.authorName}`)
    const commonAncestor = this.thread.range.commonAncestor
    const parent = commonAncestor.parentNode
    const wrapperDiv = document.createElement("div")
    parent.replaceChild(wrapperDiv, commonAncestor)
    wrapperDiv.appendChild(commentsBlock)
    wrapperDiv.appendChild(commonAncestor)
    wrapperDiv.style.display="flex"
    // wrapperDiv.className = "wrapperDiv"
    // wrapperDiv.style.position="relative";
    commentsBlock.style.display="block";
    commonAncestor.style.display="inline"
    commonAncestor.style.position="relative"
    
    console.log(this.thread.range.commonAncestor.parentNode);

    // wrapperDiv.append(commonAncestor)

    // this.thread.range.commonAncestor.insertAdjacentElement('afterend', newDiv)
    // beforebegin
    // console.log("created FUNCTION"); 
    // console.log(this.thread);
    // console.log(this.thread.text);
    // console.log(this.thread.authorName);
    //console.log(this.thread.range.commonAncestor);
    // console.log(this.thread.range.commonAncestor.nextElementSibling);
    // document.body.insertBefore(newDiv, this.thread.range.commonAncestor)
    // console.log(this.thread);
   
     },
  watch: {
    /**
     * When the currently selected thread changes, check if the highlight is
     * in the view. If not, scroll down/up the window to center the highlight.
     */
    threadSelected: function (val) {
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
        return 'fill: rgb(231, 76, 60); opacity: 0.3;'
      }
      if (this.thread === this.threadSelected) {
        return 'fill: rgb(1, 99, 255); opacity: 0.3;'
      }
      if (this.threadsHovered.includes(this.thread)) {
        return 'fill: rgb(1, 99, 255); opacity: 0.12;'
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
    }
  }
}
</script>
