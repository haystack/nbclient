<template>
  <div class="nb-nav-bar">
    <a class="logo" target="_blank" href="http://nb2.csail.mit.edu/">nb</a>
    <span><em>Welcome</em>, <strong>{{ `${me.name.first} ${me.name.last}` }}</strong></span>
    <div>
      <a v-tooltip="'Report Bug'" class="bug-icon" href="https://forms.gle/6YERC3jSu1W1zUzS8" target="_blank">
        <font-awesome-icon icon="bug" class="icon"></font-awesome-icon>
      </a>
      <v-popover
          class="overflow-menu"
          popoverClass="nav-overflow-wrapper"
          container="#nb-app-wrapper"
          offset="0"
          placement="bottom-end"
          :open="showOverflow"
          @hide="onHideOverflow">
        <span class="tooltip-target overflow-icon" @click="toggleOverflow">
          <font-awesome-icon icon="bars" class="icon"></font-awesome-icon>
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
