<template>
    <div id="nb-sidebar" class="nb-sidebar">
        <nav-bar :me="user" @logout="$emit('logout')"></nav-bar>
        <tile loading="true"></tile>
    </div>
</template>

<script>
import Vue from 'vue'
import NavBar from './NavBar.vue'
import VueSpinners from 'vue-spinners'

Vue.use(VueSpinners)

export default {
    name: 'nb-loading',
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
