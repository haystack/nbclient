<template>
    <div>
        <nb-innotation-controller>
            <a v-on:click="onInline">🔤</a>
            <a v-on:click="onLeft">⬅️</a>
            <a v-on:click="onBottom">⬇️</a>
            <a v-on:click="onRight">➡️</a>
            <a v-on:click="onTop">⬆️</a>
        </nb-innotation-controller>
        <nb-innotation-inline
            v-for="thread in threads"
            :key="thread"
            :thread="thread"
            :isInline="isInline">
        </nb-innotation-inline>
        <nb-innotation-block 
            v-for="thread in threads"
            :key="thread"
            :thread="thread"
            :innotationBlockPosition="innotationBlockPosition"
            :isInline="isInline">
        </nb-innotation-block>
    </div>
</template>

<script>
import NbInnotationBlock from './NbInnotationBlock.vue'
import NbInnotationInline from './NbInnotationInline.vue'
import NbInnotationPosition from './NbInnotationPosition'

export default {
  name: 'nb-innotations',
  props: {
      threads: {
          type: Array,
          default: () => []
      }
  },
  data () {
    return {
      isInline: false,
      innotationBlockPosition: NbInnotationPosition.BOTTOM
    }
  },
  methods: {
        onInline: function (state) {
            console.log('onInline');
            this.isInline = true
        },
        onTop: function (state) {
            console.log('onTop');
            this.isInline = false
            this.innotationBlockPosition = NbInnotationPosition.TOP
        },
        onBottom: function (state) {
            console.log('onBottom');
            this.isInline = false
            this.innotationBlockPosition = NbInnotationPosition.BOTTOM
        },
        onLeft: function (state) {
            console.log('onLeft');
            this.isInline = false
            this.innotationBlockPosition = NbInnotationPosition.LEFT
        },
        onRight: function (state) {
            console.log('onRight');
            this.isInline = false
            this.innotationBlockPosition = NbInnotationPosition.RIGHT
        },
    },
  components: {
      NbInnotationBlock,
      NbInnotationInline,
  }  
}
</script>