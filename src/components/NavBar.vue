<template>
  <div class="nb-nav-bar">
    <a class="logo" href="http://nb-next.csail.mit.edu/">nb</a>
    <span>Welcome, {{ `${me.name.first} ${me.name.last}` }}</span>
    <v-popover
        class="overflow-menu"
        popoverClass="nav-overflow-wrapper"
        container="#nb-app-wrapper"
        offset="0"
        placement="bottom-end"
        :open="showOverflow"
        @hide="onHideOverflow">
      <span class="tooltip-target overflow-icon" @click="toggleOverflow">
        <font-awesome-icon icon="bars"></font-awesome-icon>
      </span>
      <template slot="popover">
        <div class="overflow-options">
          <div
              class="overflow-option"
              @click="$emit('logout')">
            Logout
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
export default {
  name: 'nav-bar',
  props: {
    me: Object
  },
  data () {
    return {
      showOverflow: false
    }
  },
  methods: {
    toggleOverflow: function () {
      this.showOverflow = !this.showOverflow
    },
    onHideOverflow: function () {
      this.showOverflow = false
    }
  }
}
</script>
