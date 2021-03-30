<template>
    <div id="nb-marginalias"  v-if="showHighlights">
        <nb-marginalia 
            v-for="thread in marginalias"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :threads-hovered="threadsHovered"
            @select-thread="$emit('select-thread',thread)"
            @hover-thread="$emit('hover-thread',thread)"
            @unhover-thread="$emit('unhover-thread',thread)">
        </nb-marginalia>
    </div>
</template>

<script>
import NbMarginalia from './NbMarginalia.vue'

export default {
    name: 'nb-marginalias',
    props: {
        marginalias: {
            type: Array,
            default: () => []
        },
        showHighlights: {
            type: Boolean,
            default: true
        },
        threadsHovered: {
            type: Array,
            default: () => []
        },
        threadSelected: Object,
    },
    methods: {
        key: function (t) {
            return t.id + '' + t.updatedDate
        }
    },
    components: {
        NbMarginalia,
    }  
}
</script>