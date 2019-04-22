<template>
  <div class="list-view">
    <div class="list-header">
      <span class="count">
        {{ threads.length }} of {{ totalCount }} threads
      </span>
      <span class="sort">
        Sort by:
        <select v-model="sortBy">
          <option v-for="option in sortByOptions" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </span>
    </div>
    <div class="list-table">
      <list-row
          v-for="thread in sorted"
          :thread="thread"
          :threadSelected="threadSelected"
          @select-thread="$emit('select-thread', thread)">
      </list-row>
    </div>
  </div>
</template>

<script>
  import ListRow from './ListRow.vue'
  import { compare, compareDomPosition } from '../utils/compare-util.js'

  export default {
    name: 'list-view',
    props: {
      threads: {
        type: Array,
        default: []
      },
      totalCount: { //number of total threads before filter
        type: Number,
        default: 0
      },
      threadSelected: Object
    },
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
      sorted: function () {
        switch (this.sortBy) {
          case 'position':
            return this.threads.sort(compareDomPosition)
          case 'recent':
            return this.threads.sort(compare('timestamp', 'key', false))
          case 'comment':
            return this.threads.sort(compare('countAllReplies', 'func', false))
          case 'reply_request':
            return this.threads.sort(compare('countAllReplyRequests', 'func', false))
          case 'star':
            return this.threads.sort(compare('countAllStars', 'func', false))
          default:
            return this.threads
        }
      }
    },
    components: {
      ListRow
    }
  }
</script>

<style scoped>
  /* TODO: clean up styling */
  .list-view {
    margin-bottom: 10px;
  }
  .list-header .count {
    font-size: 13px;
  }
  .list-header .sort {
    font-size: 13px;
    float: right;
  }
  .list-table {
    list-style-type: none;
    height: 15vh;
    border: solid 1px #ddd;
    overflow-y: scroll;
  }
</style>
