<template>
  <div class="nb-sync" :style="style">
    <div style="display: flex;align-items: center;justify-content: space-between;width: 60px;font-size: 12px;"> 
      <!-- below: focus mode on means showSyncFeatures false -->
      <label v-tooltip="'Check if you do not want to receive\n notifications from your classmates'">Focus</label>
      <input type="checkbox"
          v-model="showSyncFeatures"
          :true-value="false" 
          :false-value="true"
          @change="onShowSyncFeaturesChange($event)"
      >
    </div>

    <div>
      <span v-if="showSyncFeatures" v-tooltip="'Users online'">
        <font-awesome-icon icon="users" class="icon"></font-awesome-icon> 
        {{onlineUsersCount}}
      </span>
    </div>

    <div>
      <span v-if="showSyncFeatures" v-tooltip="'Instructors online'">
        <span class="online-instructors">i</span> 
        {{onlineInstructorsCount}}
      </span>
    </div>

    <div v-if="showSyncFeatures">
      <!-- <span
        v-tooltip="'Click to open notifications'"
        @click="onOpenDraggableNotifications">
        <font-awesome-icon icon="envelope-open" class="icon">
        </font-awesome-icon>    
        {{ numberNotificationsUnseen }}      
      </span> -->
      <v-popover
        class="overflow-menu"
        popoverClass="thread-overflow-wrapper"
        container="#nb-app-wrapper"
        boundariesElement="#nb-app-wrapper"
        offset="0"
        placement="bottom-end"
        v-tooltip="'Click to open notifications'"
        :open="showOverflow"
        @hide="showOverflow = false">
        <span
            class="tooltip-target overflow-icon"
            @click="onOpenSidebarNotifications"
        >
          <font-awesome-icon icon="envelope-open" class="icon"></font-awesome-icon>   
          {{ numberNotificationsUnseen }}               
        </span>
        <!-- <template slot="popover">
          <div class="overflow-options">
            <div
              class="overflow-option"
              @click="onOpenDraggableNotifications"
            >
              Open in popup
            </div>
            <div
              class="overflow-option"
              @click="onOpenSidebarNotifications"
            >
              Open in sidebar
            </div>
          </div>
        </template> -->
      </v-popover>
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
            type: Object,
            default: () => {}
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
        style: function() {
            return this.nbMenuShowing ? "margin-top: 5px" : "margin-top: 2.5em"
        },
        onlineUsersCount: function() {
            return this.onlineUsers.ids.length
        },
        onlineInstructorsCount: function() {
            return this.onlineUsers.instructors.length
        },
        onlineStudentsCount: function() {
            return this.onlineUsers.students.length
        }
    },
    data: {
        showOverflow: false,
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
        onOpenSidebarNotifications: function () {
            this.$emit('open-sidebar-notifications')
        },
    },
    components: {
        Avatar
    }
}
</script>
