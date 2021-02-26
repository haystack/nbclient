<template>
    <div>
        <!-- <nb-innotation-block
            v-for="thread in threads"
            :key="thread"
            :thread="thread">
        </nb-innotation-block> -->
        <nb-innotation-inline
            v-for="thread in threads"
            :key="thread"
            :thread="thread">
        </nb-innotation-inline>
    </div> 
</template>

<script>
import NbInnotationBlock from './NbInnotationBlock.vue'
import NbInnotationInline from './NbInnotationInline.vue'

export default {
  name: 'nb-innotations',
  props: {
      threads: {
          type: Array,
          default: () => []
      }
  },
  components: {
      NbInnotationBlock,
      NbInnotationInline
  }  
}
</script>