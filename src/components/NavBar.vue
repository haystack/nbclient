<template>
  <div class="nb-nav-bar" v-bind:style="style">
    <div>
      <span class="window-toggle" @click="hide" style="margin-right: 5px;">
        <font-awesome-icon v-if="hidden && !threadSelected"  icon="chevron-left"></font-awesome-icon>
        <font-awesome-icon v-if="!hidden || threadSelected"  icon="chevron-right"></font-awesome-icon>
      </span>
    <a class="logo" target="_blank" href="http://nb2.csail.mit.edu/">nb</a>
    </div>
    <span v-show="!hidden || threadSelected">Welcome, {{ `${me.name.first} ${me.name.last}` }}</span>
    <div v-show="!hidden || threadSelected">
      <a v-tooltip="'Report Bug'" href="https://forms.gle/6YERC3jSu1W1zUzS8" target="_blank">🐛</a>
      <v-popover
          class="overflow-menu"
          popoverClass="nav-overflow-wrapper"
          container="#nb-app-wrapper"
          offset="0"
          placement="bottom-end"
          :open="showOverflow"
          @hide="onHideOverflow">
        <span class="tooltip-target overflow-icon" @click="toggleOverflow">
          <font-awesome-icon icon="user-cog"></font-awesome-icon>
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
    me: Object,
    hidden: {
      type: Boolean,
      default: false
    }, 
    threadSelected: Object,
  },
  data () {
    return {
      showOverflow: false
    }
  },
  computed: {
    style: function () {
      if (this.hidden && !this.threadSelected){
        return `width: 40px`
      }    
    }
  },
  methods: {
    toggleOverflow: function () {
      this.showOverflow = !this.showOverflow
    },
    onHideOverflow: function () {
      this.showOverflow = false
    },
    hide: function(){
      this.hidden = !this.hidden;
      this.$emit('toggle-bar')
    }
  }
}
</script>
