<template>
  <g class="nb-highlight" :style="style" @click="onClick">
    <rect
        v-for="box in boundingBoxes"
        :x="box.left"
        :y="box.top"
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
      boundingBoxes: function() {
        if (this.thread) {
          return getTextBoundingBoxes(this.thread.range.toRange())
        }
        return getTextBoundingBoxes(this.range.toRange())
      }
    },
    methods: {
      onClick: function() {
        if (this.thread) $emit('select-thread', this.thread)
      }
    }
    // TODO: offset?
    // :x="box.left - offset.left"
    // :y="box.top - offset.top"
    //
    // TODO: this.element = '<g>'
    // dispatchEvent(e) {
    //   if (!this.element) return
    //   this.element.dispatchEvent(e)
    // }
    //
    // getBoundingClientRect() {
    //   return this.element.getBoundingClientRect()
    // }
    //
    // getClientRects() {
    //   let rects = []
    //   let el = this.element.firstChild
    //   while (el) {
    //     rects.push(el.getBoundingClientRect())
    //     el = el.nextSibling
    //   }
    //   return rects
    // }
  }
</script>

<style scoped>
  .nb-highlight {
    fill: rgb(255, 204, 1);
    opacity: 0.2;
  }
</style>
