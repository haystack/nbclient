<template>
  <div class="list-view">
    <header class="card-header"
      v-tooltip="tooltipType"
      @click="isCollapsed = !isCollapsed">
      <p class="card-header-title">{{title}} ({{numberUnseen}} / {{totalCount}} unread)</p>
      <a class="button card-header-icon collapse-button">
        <font-awesome-icon icon="chevron-up" v-if="!isCollapsed"/>
        <font-awesome-icon icon="chevron-down" v-if="isCollapsed"/>
      </a>
    </header>
    <div v-if="!isCollapsed">
      <div class="list-header">
        <span class="count">
          {{ totalLabel }}
        </span>
        <div class="icons-left">
          <span v-tooltip="notificationsMuted ? 'Click to unmute notifications' : 'Click to mute notifications'"
            @click="toggleMute">
            <font-awesome-icon icon="bell-slash" class="icon" v-if="notificationsMuted">
            </font-awesome-icon>
            <font-awesome-icon icon="bell" class="icon" v-else>
            </font-awesome-icon>
          </span>   
          <span v-tooltip="'Click to open draggable notifications window'"
            @click="$emit('undock-draggable-notifications')"
          >
            <font-awesome-icon icon="clone" class="icon">
            </font-awesome-icon>
          </span>  
          <span v-tooltip="'Click to close sidebar notifications window'"
            @click="$emit('close-sidebar-notifications')"
          >
            <font-awesome-icon icon="window-close" class="icon">
            </font-awesome-icon>          
          </span>     
        </div>
      </div>
      <div class="notification-table">
        <notification-row
            v-for="(notification,index) in onlineNotifications" 
            :notification="onlineNotifications[onlineNotifications.length-1-index]"
            :key="onlineNotifications[onlineNotifications.length-1-index]"
            :thread-selected="threadSelected"
            :notification-selected="notificationSelected"
            :threads-hovered="threadsHovered"
            :activeClass="activeClass"
            :user="user"
            @select-notification="onSelectNotification"
            @hover-thread="onHoverNotification"
            @unhover-thread="onUnhoverNotification">
        </notification-row>
        <h4 id="olderNotificationHeading" v-if="offlineNotifications.length > 0">
          <span id="olderNotificationSpanWhite">
            <font-awesome-icon icon="chevron-down"/>
            Older Notifications
            <font-awesome-icon icon="chevron-down"/>
          </span>
        </h4>
        <notification-row
            v-for="(notification,index) in offlineNotifications" 
            :notification="offlineNotifications[offlineNotifications.length-1-index]"
            :key="offlineNotifications[offlineNotifications.length-1-index]"
            :thread-selected="threadSelected"
            :notification-selected="notificationSelected"
            :threads-hovered="threadsHovered"
            :activeClass="activeClass"
            :user="user"
            @select-notification="onSelectNotification"
            @hover-thread="onHoverNotification"
            @unhover-thread="onUnhoverNotification">
        </notification-row>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationRow from './NotificationRow.vue'

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
  name: 'notification-view',
  props: {
    notifications: {
      type: Array,
      default: () => []
    },
    totalCount: { // number of total threads before filter
      type: Number,
      default: 0
    },
    threadSelected: Object,
    notificationSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    user: Object,
    activeClass: {
      type: Object,
      default: () => {}
    },
    showHighlights: {
      type: Boolean,
      default: true
    },
    notificationsMuted: {
      type: Boolean,
      default: false,
    },
    draggableNotificationsOpened: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isCollapsed: false,
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
    },
    offlineNotifications: function () {
      return this.notifications.filter(n => n.isOfflineNotification)
    },
    onlineNotifications: function () {
      return this.notifications.filter(n => !n.isOfflineNotification)
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
    NotificationRow
  }
}
</script>
