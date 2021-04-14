<template>
    <div
        class="list-row"
        :style="rowStyle"
        :key="thread.id"
        @mouseenter="$emit('hover-thread', thread)"
        @mouseleave="$emit('unhover-thread', thread)"
        @click="onClick()">
        <div class="flags">
            <div v-if="isSpotlightEnabled">
                <div v-if="isSpotlighted" class="icon-wrapper inno">
                    {{(thread.spotlight.type === "IN" && "~")   ||
                    (thread.spotlight.type === "ABOVE" && "↑")  ||
                    (thread.spotlight.type === "BELLOW" && "↓") ||
                    (thread.spotlight.type === "LEFT" && "←")  ||
                    (thread.spotlight.type === "RIGHT" && "→") ||
                    (thread.spotlight.type === "MARGIN" && "Ɱ") ||
                    (thread.spotlight.type === "EM" && "❖")}}
                </div>
                <div v-else class="placeholder inno"></div>
            </div>
            <div class="icon-wrapper counter" :style="counterStyle">
                {{ thread.countAllReplies() + 1 }}
            </div>
            <div v-if="thread.hasInstructorPost()" class="icon-wrapper instr">
                i
            </div>
            <div v-else class="placeholder instr"></div>
            <div v-if="thread.hasReplyRequests()" class="icon-wrapper question"
                :style="iconStyle">
                <font-awesome-icon icon="question">
                </font-awesome-icon>
            </div>
            <div v-else class="placeholder question"></div>
        </div>
        <span :style="textStyle">
            {{ thread.text }}
        </span>
    </div>
</template>

<script>
import axios from 'axios'

/**
 * Component for each row per thread on the side bar list.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {NbComment} thread - thread for this row
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=([]) - currently hovered threads
 *
 * @vue-computed {String} rowStyle - additional CSS for row background/font
 *   color in case this is selected or hovered
 * @vue-computed {String} counterStyle - additional CSS for background/font
 *   color of thread length flag in case this is unseen
 * @vue-computed {String} iconStyle - additional CSS for icon color in case
 *   this is selected
 * @vue-computed {String} textStyle - additional CSS for excerpt font weight
 *   in case this is unseen
 *
 * @vue-event {NbComment} select-thread - Emit this thread when user clicks on
 *   this row
 * @vue-event {NbComment} hover-thread - Emit this thread when user starts
 *   hovering over this row
 * @vue-event {NbComment} unhover-thread - Emit this thread when user stops
 *   hovering over this row
 */
export default {
  name: 'list-view',
  props: {
    thread: Object,
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    user: Object,
    activeClass: {
      type: Object,
      default: () => {}
    },
    isMarginalia: Boolean,
    isInnotation: Boolean,
    isEmphasize: Boolean,
  },
  methods: {
    onClick: function () {
      const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
      const token = localStorage.getItem("nb.user");
      const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
      axios.post(`/api/spotlights/log`, {
        spotlight_id: null,
        action: 'CLICK', 
        type: 'LIST', 
        annotation_id: this.thread.id, 
        class_id: this.activeClass.id,
        role: this.user.role.toUpperCase() 
      }, config)

      this.$emit('select-thread', this.thread, 'LIST')
    },
  },
  computed: {
    isSpotlighted: function () {
      if (this.thread.isSpotlighted()) {
        if (['ABOVE', 'BELLOW', 'LEFT', 'RIGHT', 'IN'].includes(this.thread.spotlight.type) && this.isInnotation) return true
        if (this.thread.spotlight.type === 'EM' && this.isEmphasize) return true
        if (this.thread.spotlight.type === 'MARGIN' && this.isMarginalia) return true
      }

      return false
    },
    isSpotlightEnabled: function () {
      return this.isMarginalia || this.isInnotation || this.isEmphasize
    },
    rowStyle: function () {
      if (this.threadSelected && this.thread === this.threadSelected) {
        return 'background-color: #70a0f0; color: #fff'
      }
      if (this.threadsHovered.includes(this.thread)) {
        return 'background-color: #ccddf9'
      }
      return null
    },
    counterStyle: function () {
      if (this.thread.isUnseen()) {
        return 'background-color: #ffff70; color: #7070ff;'
      }
      return null
    },
    iconStyle: function () {
      if (this.threadSelected && this.thread === this.threadSelected) {
        return 'color: #eee;'
      }
      return null
    },
    textStyle: function () {
      if (this.thread.isUnseen()) {
        return 'font-weight: bold;'
      }
      return null
    }
  },
  watch: {
    /**
     * When the currently selected thread changes, check if the list row is
     * in the view. If not, scroll down/up the list to center the row.
     */
    threadSelected: function (val) {
      if (this.thread !== val) { return }
      let el = this.$el
      let elTop = el.offsetTop
      let elHeight = el.clientHeight
      let view = el.parentNode
      let viewTop = view.scrollTop
      let viewHeight = view.clientHeight
      if (elTop < viewTop || (elTop + elHeight) > (viewTop + viewHeight)) {
        view.scrollTo({
          top: elTop + (elHeight / 2) - (viewHeight / 2), // bring to center
          left: 0,
          behavior: 'smooth'
        })
      }
    }
  }
}
</script>
