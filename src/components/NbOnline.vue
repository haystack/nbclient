<template>
  <div 
    class="nb-sync"
    :style="style"
  >
    <div> 
      <label>Online</label>
      <input type="checkbox"
          v-model="showSyncFeatures"
          :true-value="true"
          :false-value="false"
          @change="onShowSyncFeaturesChange($event)"
      >
    </div>

    <div>
      <span v-if="showSyncFeatures"
        v-tooltip="'Classmates online'"
      >
        <font-awesome-icon icon="users" class="icon"></font-awesome-icon> 
        {{numOnlineUsers}}
      </span>
    </div>

    <div v-if="showSyncFeatures">
      <span
        v-tooltip="'Click to open notifications'"
        @click="onOpenDraggableNotifications">
        <font-awesome-icon icon="envelope-open" class="icon">
        </font-awesome-icon>    
        {{ numberNotificationsUnseen }}      
      </span>
    </div>

    <div v-if="showSyncFeatures">
      <span 
        v-tooltip="{ content: getTooltipContent() }"
      >
        <font-awesome-icon icon="info-circle" class="icon"></font-awesome-icon> 
      </span> 
    </div>

  </div>
</template>

<script>

/**
 * Component for showing who is online overlays corresponding to threads.
 */
import Avatar from 'vue-avatar-component'

export default {
  name: 'nb-online',
  props: {
    onlineUsers: {
      type: Array,
      default: () => []
    },
    showSyncFeatures: {
      type: Boolean,
      default: true
    },
    nbMenuShowing: {
      type: Boolean,
      default: false
    },
    numberNotificationsUnseen: {
      type: Number,
      default: 0,
    },
    notificationsMuted: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    numOnlineUsers: function() {
      return this.onlineUsers.length
    },
    style: function() {
      return this.nbMenuShowing ? "margin-top: 5px" : "margin-top: 2.5em"
    }
  },
  methods: {
    onShowSyncFeaturesChange: function(event) {
        this.$emit('show-sync-features', this.showSyncFeatures)
    },
    toggleMute: function () {
      this.$emit('toggle-mute-notifications')
    },
    onOpenDraggableNotifications: function () {
      this.$emit('open-draggable-notifications')
    },
    getTooltipContent: function () {
      return `<div>
        <span><label>blinking thread: </label>thread has recent typing or new post activity</span>
        <br><br>
        <span><label style="background-color: rgb(255, 0, 255);">pink:</label> someone needs a reply request</span>
        <br><br>
        <span><label style="background-color: rgba(80, 54, 255, 0.9);">purple:</label> thread has notification associated</span>
      </div>`
    }
  },
  components: {
    Avatar
  }
}
</script>
