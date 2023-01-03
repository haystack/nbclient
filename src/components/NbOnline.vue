<template>
    <div class="online-control">
        <div class="online-control-header">
            <font-awesome-icon icon="globe" class="icon"></font-awesome-icon>
        </div>
        <div class="online-control-controls">
            <span v-tooltip="'Check if you do not want to receive notifications from your classmates'">
                <label style="font-family: monospace;">Focus</label>
                <input type="checkbox"
                    v-model="showSyncFeatures"
                    :true-value="false" 
                    :false-value="true"
                    @change="onShowSyncFeaturesChange($event)"
                >
            </span>
            <span v-if="showSyncFeatures" v-tooltip="'Users online'">
                <font-awesome-icon icon="users" class="icon"></font-awesome-icon> 
                <span class="count-number">{{onlineUsersCount}}</span>
            </span>
            <span v-if="showSyncFeatures" v-tooltip="'Instructors online'">
                <span class="online-instructors">i</span>
                <span class="count-number">{{onlineInstructorsCount}}</span>
            </span>
            <span v-if="showSyncFeatures" v-tooltip="'Instructors online'">
                <v-popover
                    class="overflow-menu"
                    popoverClass="thread-overflow-wrapper"
                    container="#nb-app-wrapper"
                    boundariesElement="#nb-app-wrapper"
                    offset="0"
                    placement="bottom-end"
                    v-tooltip="'Open notifications'"
                    :open="showOverflow"
                    @hide="showOverflow = false">
                    <span class="tooltip-target overflow-icon" @click="onOpenSidebarNotifications" >
                        <font-awesome-icon icon="envelope-open" class="icon"></font-awesome-icon>   
                        <span class="count-number">{{numberNotificationsUnseen}}</span>              
                    </span>
                </v-popover>
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
            type: Object,
            default: () => {}
        },
        showSyncFeatures: {
            type: Boolean,
            default: true
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
<style>
#nb-app-wrapper .online-control {
    display: flex;
    position: relative;
    background: #eee;
    border: 1px solid #ccc;
    padding: 2px 5px;
    margin: 4px 0 0px 0;
    align-items: center;
    height: 22px;
    justify-content: center;
    margin-top: 30px;
    user-select: none;
}

#nb-app-wrapper .online-control-header {
    float: left;
    position: absolute;
    left: 0;
    background: #ccc;
    top: 0;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    color: #777;
}

#nb-app-wrapper .online-control-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 22px;
    margin: 0 4px 0 26px;
}

#nb-app-wrapper .online-control-controls span {
    display: flex;
    max-width: 50px;
    min-width: 16px;
    justify-content: space-evenly;
    align-items: center;
}

#nb-app-wrapper .online-control-controls span  .count-number {
    margin: 2px 0 0 8px;
}

#nb-app-wrapper .online-control .overflow-icon {
    cursor: pointer;
}
</style>

