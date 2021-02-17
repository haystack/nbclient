<template>
    <div>
    <!-- <nb-innotation-bellow
        v-for="thread in threads"
        :key="thread"
        :thread="thread">
    </nb-innotation-bellow>
    <nb-innotation-above
        v-for="thread in threads"
        :key="thread"
        :thread="thread">
    </nb-innotation-above> -->
  <!-- <nb-innotation-aside
        v-for="thread in threads"
        :key="thread"
        :thread="thread">
    </nb-innotation-aside> -->
    <nb-innotation
        v-for="thread in threads"
        :key="thread"
        :thread="thread">
    </nb-innotation>
    </div> 
</template>

<script>
import NbInnotationBellow from './NbInnotationBellow.vue'
import NbInnotationAbove from './NbInnotationAbove.vue'
import NbInnotationAside from './NbInnotationAside.vue'
import NbInnotation from './NbInnotation.vue'

export default {
  name: 'nb-innotations',
  props: {
      threads: {
          type: Array,
          default: () => []
      }
  },
  components: {
      NbInnotationBellow,
      NbInnotationAbove,
      NbInnotationAside,
      NbInnotation
  }  
}
</script>