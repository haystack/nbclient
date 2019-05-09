<template>
  <div
      class="list-row"
      :style="rowStyle"
      :key="thread.id"
      @mouseenter="$emit('hover-thread', thread)"
      @mouseleave="$emit('unhover-thread', thread)"
      @click="$emit('select-thread', thread)">
    <div class="flags">
      <div class="icon-wrapper counter" :style="counterStyle">
        {{ thread.countAllReplies() + 1 }}
      </div>
      <div v-if="thread.hasInstructorPost()" class="icon-wrapper instr">
        i
      </div>
      <div v-else class="placeholder instr"></div>
      <div v-if="thread.hasReplyRequests()" class="icon-wrapper question"
          :style="iconStyle">
        <font-awesome-icon icon="question">
        </font-awesome-icon>
      </div>
      <div v-else class="placeholder question"></div>
    </div>
    <span :style="textStyle">
      {{ thread.text }}
    </span>
  </div>
</template>

<script>
  import { compare, compareDomPosition } from '../../utils/compare-util.js'

  export default {
    name: 'list-view',
    props: ['thread', 'threadSelected', 'threadsHovered'],
    computed: {
      rowStyle: function() {
        if (this.threadSelected && this.thread === this.threadSelected) {
          return 'background-color: #70a0f0; color: #fff'
        }
        if (this.threadsHovered.includes(this.thread)) {
          return 'background-color: #ccddf9'
        }
      },
      counterStyle: function() {
        if (this.thread.isUnseen()) {
          return 'background-color: #ffff70; color: #7070ff;'
        }
      },
      iconStyle: function() {
        if (this.threadSelected && this.thread === this.threadSelected) {
          return 'color: #eee;'
        }
      },
      textStyle: function() {
        if (this.thread.isUnseen()) {
          return 'font-weight: bold;'
        }
      }
    },
    watch: {
      threadSelected: function(val) {
        if (this.thread !== val) { return }
        let el = this.$el
        let elTop = el.offsetTop
        let elHeight = el.clientHeight
        let view = el.parentNode
        let viewTop = view.scrollTop
        let viewHeight = view.clientHeight
        if (elTop < viewTop || (elTop + elHeight) > (viewTop + viewHeight)) {
          view.scrollTo({
            top: elTop + (elHeight / 2) - (viewHeight / 2), // bring to center
            left: 0,
            behavior: 'smooth'
          })
        }
      }
    }
  }
</script>
