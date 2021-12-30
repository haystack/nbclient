<template>
    <div v-if="showHighlights">
        <nb-innotation-inline
            v-for="thread in innotationsInline"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :user="user"
            :activeClass="activeClass"
            @log-sync="onLogSync"
            @select-thread="onSelectThread"
            @hover-innotation="$emit('hover-innotation',thread)"
            @unhover-innotation="$emit('unhover-innotation',thread)">
        </nb-innotation-inline>
        <nb-innotation-block 
            v-for="thread in innotationsBlock"
            :key="key(thread)"
            :thread="thread"
            :thread-selected="threadSelected"
            :user="user"
            :activeClass="activeClass"
            @log-sync="onLogSync"
            @select-thread="onSelectThread"
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
        },
        onSelectThread: function (thread, threadViewInitiator='NONE') {
            this.$emit('select-thread', thread, threadViewInitiator)
        },
        onLogSync: async function (event='NONE', initiator='NONE', spotlightType='NONE', isSyncEvent=false, hasSyncEvent=false, annotationId=null, countAnnotationReplies=0) {
            this.$emit('log-sync', event, initiator, spotlightType, isSyncEvent, hasSyncEvent, annotationId, countAnnotationReplies)
        }
    },
    components: {
        NbInnotationBlock,
        NbInnotationInline,
    }  
}
</script>