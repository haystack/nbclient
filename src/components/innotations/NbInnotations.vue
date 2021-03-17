<template>
    <div>
        <nb-innotation-inline
            v-for="thread in innotationsInline"
            :key="thread.innotation"
            :thread="thread">
        </nb-innotation-inline>
        <nb-innotation-block 
            v-for="thread in innotationsBlock"
            :key="thread.innotation"
            :thread="thread">
        </nb-innotation-block>
    </div>
</template>

<script>
import NbInnotationBlock from './NbInnotationBlock.vue'
import NbInnotationInline from './NbInnotationInline.vue'

export default {
    name: 'nb-innotations',
    props: {
        innotationsBlock: {
            type: Array,
            default: () => []
        },
        innotationsInline: {
            type: Array,
            default: () => []
        },
    },
    components: {
        NbInnotationBlock,
        NbInnotationInline,
    }  
}
</script>