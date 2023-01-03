<template>
    <div id="nb-marginalias" v-if="showSpotlights">
        <nb-marginalia 
            v-for="thread in marginalias"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :user="user"
            :threads-hovered="threadsHovered"
            :activeClass="activeClass"
            @log-nb="onLogNb"
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
        showSpotlights: {
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
        onLogNb: async function (event='NONE', initiator='NONE', comment = undefined) {
            this.$emit('log-nb', event, initiator, comment)
        }
    },
    components: {
        NbMarginalia,
    }  
}
</script>