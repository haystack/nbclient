<template>
    <div id="nb-sidebar" class="nb-sidebar">
        <nav-bar :me="user" @logout="$emit('logout')"></nav-bar>
        <div class="nb-no-access-msg">
          <h1>You don't have access!</h1>
          <p>website doesn't seem to be part of any of your classes. Please make sure your enrolled to your class and using the correct URL. Contact your instructor for more informaiton.</p>
        </div>
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
