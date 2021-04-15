<template>
    <div id="nb-marginalias"  v-if="showHighlights">
        <nb-marginalia 
            v-for="thread in marginalias"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :user="user"
            :threads-hovered="threadsHovered"
            :activeClass="activeClass"
            @select-thread="onSelectThread"
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
        user: Object,
        activeClass: {
            type: Object,
            default: () => {}
        },
    },
    methods: {
        key: function (t) {
            return t.id + '' + t.updatedDate
        },
        onSelectThread: function (thread, threadViewInitiator='NONE') {
            this.$emit('select-thread', thread, threadViewInitiator)
        },
    },
    components: {
        NbMarginalia,
    }  
}
</script>