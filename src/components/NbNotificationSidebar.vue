<template>
    <vue-draggable-resizable 
      v-if="showSyncFeatures && draggableNotificationsOpened"
      :w="330" :h="525" :z="30000000" 
      :x="-500"
      :y="250"
      :handles="['tl', 'tr', 'br', 'bl']"
      :min-height="300"
      :min-width="325"
      :parent="false">
      <notification-sidebar-view
          :user="user"
          :activeClass="activeClass"
          :notifications="notificationThreads"
          :total-count="notificationThreads.length"
          :thread-selected="threadSelected"
          :notification-selected="notificationSelected"
          :threads-hovered="threadsHovered"
          :show-highlights="showHighlights"
          :notificationsMuted="notificationsMuted"
          @toggle-highlights="onToggleHighlights"
          @select-notification="onSelectNotification"
          @hover-thread="onHoverThread"
          @unhover-thread="onUnhoverThread"
          @toggle-mute-notifications="onToggleMuteNotifications"
          @dock-draggable-notifications="$emit('dock-draggable-notifications')"
          @close-draggable-notications="$emit('close-draggable-notications')"
      >
      </notification-sidebar-view>
    </vue-draggable-resizable>
</template>

<script>
import NotificationSidebarView from './list/NotificationSidebarView.vue'
import Vue from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)


export default {
  name: 'nb-notification-sidebar',
  props: {
    user: {
      type: Object,
      default: () => {}
    },
    users: {
      type: Object,
      default: () => {}
    },
    onlineUsers: {
      type: Number,
      default: 0
    },
    activeClass: {
      type: Object,
      default: () => {}
    },
    stillGatheringThreads: {
      type: Boolean,
      default: true
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
    notificationSelected: Object,
    notificationThreads: {
      type: Array,
      default: () => []
    },
    showSyncFeatures: {
      type: Boolean,
      default: true
    },
    notificationsMuted: {
      type: Boolean,
      default: false,
    },
    draggableNotificationsOpened: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onToggleHighlights: function (show) {
      this.$emit('toggle-highlights', show)
    },
    onSelectNotification: function (notification) {
      this.$emit('select-notification', notification)
    },
    onHoverThread: function (thread) {
      this.$emit('hover-thread', thread)
    },
    onUnhoverThread: function (thread) {
      this.$emit('unhover-thread', thread)
    },
    onToggleMuteNotifications: function () {
      this.$emit('toggle-mute-notifications')
    },
  },
  components: {
    NotificationSidebarView,
  }
}
</script>
