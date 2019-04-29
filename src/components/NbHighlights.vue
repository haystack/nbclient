<template>
  <svg @unselect-thread="$emit('unselect-thread', null)">
    <nb-highlight
        v-for="thread in threads"
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
  import { eventsProxyMouse } from '../utils/highlight-util.js'
  import { compare } from '../utils/compare-util.js'

  export default {
    name: 'nb-highlights',
    props: {
      threads: {
        type: Array,
        default: []
      },
      threadSelected: Object,
      threadsHovered: {
        type: Array,
        default: []
      },
      draftRange: Object,
      showHighlights: {
        type: Boolean,
        default: false
      }
    },
    mounted: function() {
      eventsProxyMouse(document.body, this.$el, this.$root.$el)
    },
    components: {
      NbHighlight
    }
  }
</script>

<style scoped>
  svg {
    position: absolute;
    top: 0;
    right: 395px; /* assuming sidebar is 350px wide + 2 * 10px padding + 5px margin */
    width: calc(100vw - 395px);;
    height: 100%;
    pointer-events: none;
  }
</style>
