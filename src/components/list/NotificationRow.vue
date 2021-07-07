<template>
  <div
      class="list-row"
      :style="rowStyle"
      :key="thread.id"
      @mouseenter="onHoverNotification"
      @mouseleave="onUnhoverNotification"
      @click="onClickNotification">
    <div class="flags" id="notification-row-flags"> 
      <div v-if="notification.type === 'instructor'" class="icon-wrapper instructor" :style="flagsStyle">
        {{notification.readableType}}
      </div>
      <div v-if="notification.type === 'question'" class="icon-wrapper reply-request" :style="flagsStyle">
        {{notification.readableType}}
      </div>
      <div v-if="notification.type === 'tag'" class="icon-wrapper tag" :style="flagsStyle">
        {{notification.readableType}}
      </div>
      <div v-if="notification.type === 'recent'" class="icon-wrapper recent" :style="flagsStyle"
        v-tooltip="'Recent comment'"
      >
        <font-awesome-icon icon="history"></font-awesome-icon>&nbsp;
      </div>
      <div v-if="notification.type === 'reply'" class="icon-wrapper reply" :style="flagsStyle"
        v-tooltip="'Comment reply'"
      >
        <font-awesome-icon icon="reply"></font-awesome-icon>&nbsp;
      </div>
      <span :style="textStyle">
        {{authorName}}: {{ commentText }}
      </span>
    </div>
    <span :style="timeTextStyle">
      {{timeString}}
    </span>
  </div>
</template>

<script>

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
import moment from 'moment'
import { CommentAnonymity } from '../../models/enums.js'

export default {
  name: 'notification-row',
  props: {
    threadSelected: Object,
    notificationSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    notification: Object,
    user: Object,
    activeClass: {
      type: Object,
      default: () => {}
    },
  },
  data () {
    return {
      thread: this.notification.comment,
    }
  },
  computed: {
    rowStyle: function () {
      let flex = 'display: list-item;'
      if (this.notificationSelected && this.notificationSelected === this.notification) {
        return flex + 'background-color: #b096ee; color: #fff'
      }
      if (this.threadsHovered.includes(this.thread)) {
        return flex +'background-color: #e5ddf9'
      }
      return flex
    },
    flagsStyle: function () {
      return 'width: auto;'
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
      if (this.unseen) {
        return 'font-weight: bold;'
      }
      return null
    },
    timeTextStyle: function () {
      return 'font-size: 12px;'
    },
    timeString: function () {
      let relevantComment = this.notification.specificAnnotation !== null ? this.notification.specificAnnotation : this.notification.comment 
      return moment(relevantComment.timestamp).fromNow()
    },
    unseen: function() {
        return this.notification.unseen
    },
    authorName: function () {
      let relevantComment = this.notification.specificAnnotation !== null ? this.notification.specificAnnotation : this.notification.comment 
      if (
        (relevantComment.author === null || 
        relevantComment.anonymity === CommentAnonymity.ANONYMOUS &&
        this.user.role !== 'instructor')
      ){
        return 'Anonymous'
      }
      return relevantComment.authorName
    },
    commentText: function () {
      let relevantComment = this.notification.specificAnnotation !== null ? this.notification.specificAnnotation : this.notification.comment 
      return relevantComment.text
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
    },
  },
  methods: {
    onClickNotification: function () {
      this.notification.setIsUnseen(false)
      this.$emit('select-notification', this.notification)
      const source = window.location.pathname === '/nb_viewer.html' ? window.location.href : window.location.origin + window.location.pathname
      const token = localStorage.getItem("nb.user");
      const config = { headers: { Authorization: 'Bearer ' + token }, params: { url: source } }
      axios.post(`/api/spotlights/log`, {
        spotlight_id: null,
        action: 'CLICK', 
        type: 'NOTIFICATION_LIST', 
        annotation_id: this.thread.id, 
        class_id: this.activeClass.id,
        role: this.user.role.toUpperCase(),
        trigger: this.notification.trigger 
      }, config)
    },
    onHoverNotification: function () {
        this.$emit('hover-thread', this.thread)   
    },
    onUnhoverNotification: function () {
        this.$emit('unhover-thread', this.thread)
    }
  },
  components: {
  }
}
</script>