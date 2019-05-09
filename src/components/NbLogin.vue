<template>
  <div class="login-form">
    <div class='title'>Log in to NB</div>
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
      <button class='submit' @click="login" :disabled="submitDisabled">
        Submit
      </button>
    </div>
  </div>
</template>

<script>
  import axios from "axios"

  export default {
    name: "nb-login",
    data() {
      return {
        username: "",
        password: "",
        message: null
      }
    },
    computed: {
      submitDisabled: function() {
        return this.username.length === 0 || this.password.length === 0
      }
    },
    methods: {
      login: function() {
        let bodyContent = { username: this.username, password: this.password }
        axios.post("/api/users/login", bodyContent)
          .then(res => {
            this.$emit("login", res.data)
          })
          .catch(error => {
            if (error.response.status === 401) {
              this.message = "Please make sure your username and password are valid!"
            }
        })
      }
    }
  }
</script>
