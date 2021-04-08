<template>
    <div v-if="showHighlights">
        <nb-innotation-inline
            v-for="thread in innotationsInline"
            :key="key(thread)"
            :thread="thread"
            :user="user"
            :activeClass="activeClass">
        </nb-innotation-inline>
        <nb-innotation-block 
            v-for="thread in innotationsBlock"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :user="user"
            :activeClass="activeClass"
            @select-thread="$emit('select-thread',thread)"
            @hover-innotation="$emit('hover-innotation',thread)"
            @unhover-innotation="$emit('unhover-innotation',thread)">
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
        },
        threadSelected: Object,
        user: Object,
        activeClass: {
            type: Object,
            default: () => {}
        },
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