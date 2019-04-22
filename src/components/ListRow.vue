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
    props: ['thread', 'threadSelected'],
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
      }
    }
  }
</script>

<style scoped>
  .list-row {
    padding: 4px;
    cursor: pointer;
  }
  .list-row:nth-child(even) {
    background-color: #f0f0f0;
  }
  .list-row:hover {
    background-color: #ffffd0;
  }
</style>
