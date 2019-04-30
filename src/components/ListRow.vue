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
        <i v-if="thread.hasInstructorPost()" class="fas fa-info icon"
            :style="iconStyle">
        </i>
      </div>
      <div class="icon-wrapper">
        <i v-if="thread.hasReplyRequests()" class="fas fa-question icon"
            :style="iconStyle">
        </i>
      </div>
    </div>
    {{ thread.text }}
  </div>
</template>

<script>
  import { compare, compareDomPosition } from '../utils/compare-util.js'

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
          return 'color: #fff'
        }
      }
    }
  }
</script>

<style scoped>
  .list-row {
    padding: 4px;
    color: #226;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .list-row:nth-child(even) {
    background-color: #f0f0f0;
  }
  .list-row:hover {
    background-color: #ffffd0;
  }
  .flags {
    width: 50px;
    display: inline-block;
  }
  .flags .counter {
    width: 16px;
    padding: 2px 0;
    margin-right: 2px;
    display: inline-block;
    border-radius: 3px;
    background-color: #eee;
    color: #aaa;
    font-size: 11px;
    text-align: center;
    vertical-align: bottom;
  }
  .flags .icon-wrapper {
    display: inline-block;
    width: 10px;
  }
  .flags .icon {
    width: 10px;
    color: #888;
    font-size: 13px;
    text-align: center;
  }
</style>
