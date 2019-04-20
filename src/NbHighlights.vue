<template>
  <div class="nb-highlights">
    <svg width="100%" height="100%">
      <nb-highlight
          v-for="thread in threads"
          :thread="thread"
          :threadSelected="threadSelected">
      </nb-highlight>
      <nb-highlight
          v-if="draftRange"
          :range="draftRange">
      </nb-highlight>
    </svg>
  </div>
</template>

<script>
  //import { ...TODO } from './highlight-util.js'
  import NbHighlight from './NbHighlight.vue'

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
    // mounted: function() {
    //   eventsProxyMouse(this.target, this.highlights) //TODO?
    // },
    components: {
      NbHighlight
    }
  }
</script>

<style scoped>
  /* TODO: fix offset and dim */
  .nb-highlights {
    position: absolute;
    top: 0;
    width: 800px;
    height: 800px;
    pointer-events: none;
  }
  .nb-highlights svg {
    position: absolute;
    pointer-events: none;
  }
</style>
