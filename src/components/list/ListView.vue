<template>
  <div class="list-view">
    <div class="list-header">
      <span class="count">
        {{ threads.length }} of {{ totalCount }} threads
      </span>
      <span class="toggle-highlights" @click="toggleHighlights">
        <font-awesome-icon v-if="showHighlights" icon="eye" class="icon">
        </font-awesome-icon>
        <font-awesome-icon v-else icon="eye-slash" class="icon">
        </font-awesome-icon>
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
          :thread-selected="threadSelected"
          :threads-hovered="threadsHovered"
          @select-thread="$emit('select-thread', thread)"
          @hover-thread="$emit('hover-thread', thread)"
          @unhover-thread="$emit('unhover-thread', thread)">
      </list-row>
    </div>
  </div>
</template>

<script>
  import ListRow from './ListRow.vue'
  import { compare, compareDomPosition } from '../../utils/compare-util.js'

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
      threadSelected: Object,
      threadsHovered: {
        type: Array,
        default: []
      },
      showHighlights: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        sortBy: 'position',
        sortByOptions: [
          { text: "Default", value: 'position' },
          { text: "Most Recent", value: 'recent' },
          { text: "Longest Thread", value: 'comment' },
          { text: "Reply Requests", value: 'reply_request' },
          { text: "Upvotes", value: 'star' }
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
      toggleHighlights: function() {
        this.$emit('toggle-highlights', !this.showHighlights)
      }
    },
    components: {
      ListRow
    }
  }
</script>
