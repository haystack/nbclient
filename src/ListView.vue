<template>
  <div>
    <div class="list-header">
      <span class="count">
        {{ threads.length }} of {{ totalCount }} threads <!-- TODO -->
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
      <!-- should this be a seperate vue component, like ListRow.vue -->
      <div class="list-row"
        v-for="thread in sorted"
        :key="thread.id"
        :annotation_id="thread.id"
        @click="selectThread(thread.id)">
        {{ thread.text }}
      </div>
    </div>
  </div>
</template>

<script>
  import { compare, compareDomPosition } from './compare-util.js'

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
      }
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
    methods: {
      selectThread: function(id) {
        this.$emit('select-thread', id)
      }
    }
  }
</script>

<style scoped>
  /* TODO: clean up styling */
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
  .list-row.selected { /* TODO: do this in computed? */
    background-color: #70a0f0;
  }
</style>
