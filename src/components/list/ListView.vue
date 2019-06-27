<template>
  <div class="list-view">
    <div class="list-header">
      <span class="count">
        {{ threads.length }} of {{ totalLabel }}
      </span>
      <span
          class="toggle-highlights"
          v-tooltip="showHighlights ? 'hide highlights' : 'show highlights'"
          @click="toggleHighlights">
        <font-awesome-icon v-if="showHighlights" icon="eye" class="icon">
        </font-awesome-icon>
        <font-awesome-icon v-else icon="eye-slash" class="icon">
        </font-awesome-icon>
      </span>
      <span class="sort">
        Sort by:
        <select v-model="sortBy">
          <option v-for="option in sortByOptions" :key="option.value"
              :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </span>
    </div>
    <div class="list-table">
      <list-row
          v-for="thread in sorted"
          :key="thread"
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
      default: () => []
    },
    totalCount: { // number of total threads before filter
      type: Number,
      default: 0
    },
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    showHighlights: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      sortBy: 'position',
      sortByOptions: [
        { text: 'Default', value: 'position' },
        { text: 'Most Recent', value: 'recent' },
        { text: 'Longest Thread', value: 'comment' },
        { text: 'Reply Requests', value: 'reply_request' },
        { text: 'Upvotes', value: 'upvote' }
      ]
    }
  },
  computed: {
    totalLabel: function () {
      if (this.totalCount === 1) {
        return '1 thread'
      } else {
        return `${this.totalCount} threads`
      }
    },
    sorted: function () {
      switch (this.sortBy) {
        case 'position':
          return this.threads.concat().sort(compareDomPosition)
        case 'recent':
          return this.threads.concat().sort(compare('timestamp', 'key', false))
        case 'comment':
          return this.threads.concat().sort(compare('countAllReplies', 'func', false))
        case 'reply_request':
          return this.threads.concat().sort(compare('countAllReplyReqs', 'func', false))
        case 'upvote':
          return this.threads.concat().sort(compare('countAllUpvotes', 'func', false))
        default:
          return this.threads
      }
    }
  },
  methods: {
    toggleHighlights: function () {
      this.$emit('toggle-highlights', !this.showHighlights)
    }
  },
  components: {
    ListRow
  }
}
</script>
