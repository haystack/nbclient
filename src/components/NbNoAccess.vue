<template>
    <div id="nb-sidebar" class="nb-sidebar">
        <nav-bar :me="user" @logout="$emit('logout')"></nav-bar>
        <h1 class="nb-no-access-msg">You don't have access to this source</h1>
    </div>
</template>
<script>
import NavBar from './NavBar.vue'

export default {
  name: 'nb-no-access',
  props: {
     user: {
      type: Object,
      default: () => {}
    }
  },
   components: {
    NavBar
  }
}

</script>
