<template>
    <div>
    <nb-innotation-bellow
        v-for="thread in threads"
        :key="thread"
        :thread="thread">
    </nb-innotation-bellow>
    </div> 
</template>

<script>
import NbInnotationBellow from './NbInnotationBellow.vue'
export default {
  name: 'nb-innotations',
  props: {
      threads: {
          type: Array,
          default: () => []
      }
  },
  components: {
      NbInnotationBellow
  }  
}
</script>