<template>
  <svg ref="highlights">
    <nb-highlight
        v-for="thread in threads"
        :thread="thread"
        :threadSelected="threadSelected"
        @select-thread="onSelectThread">
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
      draftRange: Object
    },
    methods: {
      onSelectThread: function(thread) {
        this.$emit('select-thread', thread)
      }
    },
    mounted: function() {
      eventsProxyMouse(document.body, this.$refs.highlights)
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
