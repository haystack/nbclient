<template>
  <g class="nb-highlight" :style="style" @click="$emit('select-thread',thread)">
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
  import { getTextBoundingBoxes } from './overlay-util.js'

  export default {
    name: 'nb-highlight',
    props: {
      thread: Object,
      threadSelected: Object,
      range: Object,
      selecting: Boolean // TODO: is this necessary? should we just check for window.selection? maybe high level?
    },
    computed: {
      style: function() {
        if (!this.thread) {
          return 'fill: rgb(231, 76, 60); opacity: 0.3;'
        }
        if (this.threadSelected && this.threadSelected.id === this.thread.id) {
          return 'fill: rgb(1, 99, 255); opacity: 0.3;'
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
    }
  }
</script>

<style scoped>
  .nb-highlight {
    fill: rgb(255, 204, 1);
    opacity: 0.2;
  }
</style>
