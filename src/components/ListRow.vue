<template>
  <div
      class="list-row"
      :style="style"
      :key="thread.id"
      @click="$emit('select-thread', thread)">
    {{ thread.text }}
  </div>
</template>

<script>
  import { compare, compareDomPosition } from '../utils/compare-util.js'

  export default {
    name: 'list-view',
    props: ['thread', 'threadSelected', 'threadHovered'],
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
      style: function() {
        if (this.threadSelected && this.thread.id === this.threadSelected.id) {
          return 'background-color: #70a0f0;'
        }
        if (this.threadHovered && this.thread.id === this.threadHovered.id) {
          return 'background-color: #b5cef7'
        }
      }
    }
  }
</script>

<style scoped>
  .list-row {
    padding: 4px;
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
</style>
