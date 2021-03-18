<template>
    <div v-if="showHighlights">
        <nb-innotation-inline
            v-for="thread in innotationsInline"
            :key="key(thread)"
            :thread="thread">
        </nb-innotation-inline>
        <nb-innotation-block 
            v-for="thread in innotationsBlock"
            :key="key(thread)"
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
        showHighlights: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        key: function (t) {
            return t.id + '' + t.updatedDate
        }
    },
    components: {
        NbInnotationBlock,
        NbInnotationInline,
    }  
}
</script>