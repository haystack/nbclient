<template>
  <svg class="nb-highlights" @unselect-thread="$emit('unselect-thread', null)">
    <nb-highlight
        v-for="thread in threads"
        :key="thread"
        :thread="thread"
        :thread-selected="threadSelected"
        :threads-hovered="threadsHovered"
        :show-highlights="showHighlights"
        :user="user"
        :activeClass="activeClass"
        :is-emphasize="isEmphasize"
        :is-innotation="isInnotation"
        @select-thread="onSelectThread"
        :show-sync-features="showSyncFeatures"
        @hover-thread="$emit('hover-thread',thread)"
        @unhover-thread="$emit('unhover-thread',thread)"
        @new-recent-thread="$emit('new-recent-thread', thread)">
    </nb-highlight>
    <nb-highlight
        v-if="draftRange"
        :range="draftRange">
    </nb-highlight>
  </svg>
</template>

<script>
import NbHighlight from './NbHighlight.vue'
import { eventsProxyMouse } from '../../utils/highlight-util.js'

/**
 * Component for highlight overlays corresponding to threads.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {Array<NbComment>} threads=([]) - all visible threads
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=([]) - currently hovered threads
 * @vue-prop {NbRange} draftRange - text range for the new thread currently being drafted
 * @vue-prop {Boolean} showHighlights=true - true if highlights are overlayed
 *   on text, false if collapsed to the side
 *
 * @vue-event {NbComment} select-thread - Emit currently selected thread
 *   when user selects a thread by clicking on the highlight
 * @vue-event {NbComment} hover-thread - Emit the hovered thread
 *   when user starts hovering over the thread's highlight
 * @vue-event {NbComment} unhover-thread - Emit the unhovered thread
 *   when user stops hovering over the thread's highlight
 * @vue-event {null} unselect-thread - Emit when user unselect thread
 *   by clicking outside of highlights
 */
export default {
  name: 'nb-highlights',
  props: {
    threads: {
      type: Array,
      default: () => []
    },
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    draftRange: Object,
    showHighlights: {
      type: Boolean,
      default: true
    },
    user: Object,
    activeClass: {
      type: Object,
      default: () => {}
    },
    isEmphasize: Boolean,
    isInnotation: Boolean,
    showSyncFeatures: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    onSelectThread: function (thread, threadViewInitiator='NONE') {
        this.$emit('select-thread', thread, threadViewInitiator)
    }
  },
  mounted: function () {
    eventsProxyMouse(document.body, this.$el)
  },
  components: {
    NbHighlight,
  }
}
</script>
