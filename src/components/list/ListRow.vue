<template>
  <div
      class="list-row"
      :style="rowStyle"
      :key="thread.id"
      @mouseenter="$emit('hover-thread', thread)"
      @mouseleave="$emit('unhover-thread', thread)"
      @click="$emit('select-thread', thread)">
    <div class="flags">
      <div class="counter" :style="counterStyle">
        {{ thread.countAllReplies() + 1 }}
      </div>
      <div class="icon-wrapper">
        <font-awesome-icon v-if="thread.hasInstructorPost()"
            icon="info" class="icon" :style="iconStyle">
        </font-awesome-icon>
      </div>
      <div class="icon-wrapper">
        <font-awesome-icon v-if="thread.hasReplyRequests()"
            icon="question" class="icon" :style="iconStyle">
        </font-awesome-icon>
      </div>
    </div>
    {{ thread.text }}
  </div>
</template>

<script>
  import { compare, compareDomPosition } from '../../utils/compare-util.js'

  export default {
    name: 'list-view',
    props: ['thread', 'threadSelected', 'threadsHovered'],
    data() {
      return {
        sortBy: 'position',
        sortByOptions: [
          { text: "Position", value: 'position' },
          { text: "Most Recent", value: 'recent' },
          { text: "Total Comments", value: 'comment' },
          { text: "Reply Requests", value: 'reply_request' },
          { text: "Star", value: 'star' }
        ]
      }
    },
    computed: {
      rowStyle: function() {
        let style = this.thread.isUnseen() ? 'font-weight: bold;': ''
        if (this.threadSelected && this.thread === this.threadSelected) {
          return style + 'background-color: #70a0f0; color: #fff'
        }
        if (this.threadsHovered.includes(this.thread)) {
          return style + 'background-color: #ccddf9'
        }
        return style
      },
      counterStyle: function() {
        if (this.thread.isUnseen()) {
          return 'background-color: #ffff70; color: #7070ff;'
        }
      },
      iconStyle: function() {
        if (this.threadSelected && this.thread === this.threadSelected) {
          return { color : '#fff' }
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
