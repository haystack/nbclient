<template>
  <svg class="nb-highlights" @unselect-thread="$emit('unselect-thread', null)">
    <nb-highlight
        v-for="thread in threads"
        :key="thread"
        :thread="thread"
        :thread-selected="threadSelected"
        :threads-hovered="threadsHovered"
        :show-highlights="showHighlights"
        @select-thread="$emit('select-thread',thread)"
        @hover-thread="$emit('hover-thread',thread)"
        @unhover-thread="$emit('unhover-thread',thread)">
    </nb-highlight>
    <nb-highlight
        v-if="draftRange"
        :range="draftRange">
    </nb-highlight>
  </svg>
</template>

<script>
import NbHighlight from './NbHighlight.vue'
import { eventsProxyMouse } from '../../utils/highlight-util.js'

export default {
  name: 'nb-highlights',
  props: {
    threads: {
      type: Array,
      default: () => []
    },
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    draftRange: Object,
    showHighlights: {
      type: Boolean,
      default: false
    }
  },
  mounted: function () {
    eventsProxyMouse(document.body, this.$el, this.$root.$el)
  },
  components: {
    NbHighlight
  }
}
</script>
