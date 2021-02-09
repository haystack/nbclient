<template>
  <div class="nb-online">
    <div v-if="showSyncFeatures">
      <h3>Classmates & Instructors Currently Online: {{numOnlineUsers}}</h3>
      <avatar 
        v-for="user in onlineUsers"
        :key="user"
        :fullname="user"/>
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
    Avatar
  }
}
</script>
