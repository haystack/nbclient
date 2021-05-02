<template>
  <div class="nb-notification-sidebar list-view">
    <header class="card-header" id="draggable-notification-card-header">
      <p class="card-header-title">{{title}} ({{numberUnseen}} / {{totalCount}} unread)</p>
      <div class="icons-left-parent">
        <span class="icons-left" v-tooltip="notificationsMuted ? 'Click to unmute notifications' : 'Click to mute notifications'"
            @click="toggleMute">
            <font-awesome-icon icon="bell-slash" class="icon" v-if="notificationsMuted">
            </font-awesome-icon>
            <font-awesome-icon icon="bell" class="icon" v-else>
            </font-awesome-icon>
        </span>
      </div>
    </header>
    <div class="notification-table">
      <notification-sidebar-row
          v-for="(notification,index) in notifications" 
          :notification="notifications[notifications.length-1-index]"
          :key="notifications[notifications.length-1-index]"
          :thread-selected="threadSelected"
          :notification-selected="notificationSelected"
          :threads-hovered="threadsHovered"
          :user="user"
          :active-class="activeClass"
          @select-notification="onSelectNotification"
          @hover-thread="onHoverNotification"
          @unhover-thread="onUnhoverNotification">
      </notification-sidebar-row>
    </div>
    <button class="notification-close-button" @click="$emit('close-draggable-notications')">X</button>
  </div>
</template>

<script>
import NotificationSidebarRow from './NotificationSidebarRow.vue'

/**
 * Component for the list of threads on the side bar.
 * Each thread is represented by the head of thread {@link NbComment}.
 *
 * @vue-prop {Array<NbComment>} threads=([]) - all visible threads
 * @vue-prop {Number} totalCount=0 - number of all threads (visible and hidden)
 * @vue-prop {NbComment} threadSelected - currently selected thread
 * @vue-prop {Array<NbComment>} threadsHovered=([]) - currently hovered threads
 * @vue-prop {Boolean} showHighlights=true - true if highlights are overlayed
 *   on text, false if collapsed to the side
 *
 * @vue-computed {String} totalLabel - display label for number of all threads
 *
 * @vue-event {NbComment} select-thread - Emit currently selected thread
 *   when user selects a thread by clicking on the list row
 * @vue-event {NbComment} hover-thread - Emit the hovered thread
 *   when user starts hovering over the list row
 * @vue-event {NbComment} unhover-thread - Emit the unhovered thread
 *   when user stops hovering over the list row
 * @vue-event {Boolean} toggle-highlights - Emit the new highlight visibility
 *   upon change, true to show, false to collapse
 */
export default {
  name: 'notification-sidebar-view',
  props: {
    user: Object,
    activeClass: {
      type: Object,
      default: () => {}
    },
    notifications: {
      type: Array,
      default: () => []
    },
    totalCount: { // number of total notifications 
      type: Number,
      default: 0
    },
    threadSelected: Object,
    notificationSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    showHighlights: {
      type: Boolean,
      default: true
    },
    notificationsMuted: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    totalLabel: function () {
      if (this.totalCount === 1) {
        return '1 total notification'
      } else {
        return `${this.totalCount} total notifications`
      }
    },
    tooltipType: function () {
    return 'See some help-need threads, pins, reply requests, and threads happening nearby you.'
      
    },
    title: function () {
      return 'Notifications'
    },
    numberUnseen: function () {
        return this.notifications.filter(n => n.unseen).length
    }
  },
  methods: {
    toggleHighlights: function () {
      this.$emit('toggle-highlights', !this.showHighlights)
    },
    onSelectNotification: function (notification) {
        this.$emit('select-notification', notification)
    },
    onHoverNotification: function (thread) {
        this.$emit('hover-thread', thread)   
    },
    onUnhoverNotification: function (thread) {
        this.$emit('unhover-thread', thread)
    },
    toggleMute: function () {
      this.$emit('toggle-mute-notifications')
    }
  },
  components: {
    NotificationSidebarRow
  }
}
</script>
