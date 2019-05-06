<template>
  <div class="nb-nav-bar">
    <a href="http://localhost:8080/">nb</a> <!--TODO-->
    <span>Welcome, {{ `${me.name.first} ${me.name.last}` }}</span>
    <v-popover class="overflow-menu" :disabled="!overflowMenu">
      <span class="tooltip-target overflow-icon" @click="overflowMenu = true">
        <font-awesome-icon icon="bars"></font-awesome-icon>
      </span>
      <template slot="popover">
        <div
            class="overflow-option nb-tooltip"
            @click="$emit('logout')">
          Logout
        </div>
      </template>
    </v-popover>
  </div>
</template>

<script>
  export default {
    name: 'nav-bar',
    props: ['me'],
    data() {
      return {
        overflowMenu: false
      }
    }
  }
</script>
