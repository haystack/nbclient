<template>
  <svg class="nb-online">
    <g v-if="showSyncFeatures">
      <text x="0" y="20" class="small-text">Classmates & Instructors Currently Online: {{numOnlineUsers}}</text>

       <rect
        v-for="(user, index) in onlineUsers"
        :key="user"
        :x="30 * index + 15*index"
        :y="40"
        :height="30"
        :width="30"
        style="fill:rgb(179, 236, 255);"
        >
      </rect>
      <text 
        v-for="(user, index) in onlineUsers"  
        :key="user"
        :x="30 * index + 15*index + 10"
        :y="60"
        class="heavy-text"
      >
      {{user.charAt(0)}}
      </text>

    </g>
   
  </svg>
</template>

<script>

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
  name: 'nb-online',
  props: {
    onlineUsers: {
      type: Array,
      default: () => [1, 2, 3]
    },
    showSyncFeatures: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    numOnlineUsers: function() {
      return this.onlineUsers.length
    }
  },
  mounted: function () {
  },
  components: {
    
  }
}
</script>
