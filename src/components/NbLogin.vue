<template>
  <form class="login-form" @submit.prevent="login">
    <div class='title'>
      <img src="https://nb.mit.edu/res/nb-logo.png" height="60"/>
    </div>
    <div class='group'>
      <label for='login-username'>Username:</label>
      <input id='login-username' type='text' v-model.trim='username'>
    </div>
    <div class='group'>
      <label for='login-password'>Password:</label>
      <input id='login-password' type='password' v-model.trim='password'>
    </div>
    <div v-if="message" class='message'>{{ message }}</div>
    <div class='buttons'>
      <button class='submit' type="submit" :disabled="submitDisabled">
        Submit
      </button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
import VueJwtDecode from "vue-jwt-decode";


export default {
  name: 'nb-login',
  data () {
    return {
      username: '',
      password: '',
      message: null
    }
  },
  computed: {
    submitDisabled: function () {
      return this.username.length === 0 || this.password.length === 0
    }
  },
  methods: {
    login: function () {
      let bodyContent = { username: this.username, password: this.password }
      axios.post('/api/users/login', bodyContent)
        .then(res => {
          localStorage.setItem("nb.user", res.data.token)
          const decoded = VueJwtDecode.decode(res.data.token)
          this.$emit('login', decoded.user)
        })
        .catch(error => {
          if (error.response.status === 401) {
            this.message = 'Invalid username and password. Try again!'
          }
        })
    }
  }
}
</script>
