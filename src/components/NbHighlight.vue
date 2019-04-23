<template>
  <g
      class="nb-highlight"
      :style="style"
      @click="$emit('select-thread',thread)"
      @mouseenter="onHover(true)"
      @mouseleave="onHover(false)">
    <rect
        v-for="box in bounds.boxes"
        :x="box.left + bounds.offsetX"
        :y="box.top + bounds.offsetY"
        :height="box.height"
        :width="box.width">
    </rect>
  </g>
</template>

<script>
  import { getTextBoundingBoxes } from '../utils/overlay-util.js'

  export default {
    name: 'nb-highlight',
    props: {
      thread: Object,
      threadSelected: Object,
      threadsHovered: {
        type: Array,
        default: []
      },
      range: Object
    },
    computed: {
      style: function() {
        if (!this.thread) {
          return 'fill: rgb(231, 76, 60); opacity: 0.3;'
        }
        if (this.thread === this.threadSelected) {
          return 'fill: rgb(1, 99, 255); opacity: 0.3;'
        }
        if (this.threadsHovered.includes(this.thread)) {
          return 'fill: rgb(1, 99, 255); opacity: 0.12;'
        }
      },
      bounds: function() {
        let bounds = {}
        if (this.thread) {
          bounds.boxes = getTextBoundingBoxes(this.thread.range.toRange())
        } else {
          bounds.boxes = getTextBoundingBoxes(this.range.toRange())
        }
        bounds.offsetX = window.pageXOffset
            || document.documentElement.scrollLeft
            || document.body.scrollLeft
            || 0
        bounds.offsetY = window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0
        return bounds
      }
    },
    methods: {
      onHover: function(state) {
        this.$emit(state ? 'hover-thread' : 'unhover-thread', this.thread)
      }
    }
  }
</script>

<style scoped>
  .nb-highlight {
    fill: rgb(255, 204, 1);
    opacity: 0.2;
  }
</style>
