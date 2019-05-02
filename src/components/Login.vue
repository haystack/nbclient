<template>
  <form class='component' v-on:submit.prevent='login' method="post">
    <h3>Login</h3>

    <div class='form-group'>
      <label for='username'>Username:</label>
      <input id='username' v-model.trim='username' type='text' name='name'>
    </div>

    <div class='form-group'>
      <label for='password'>Password:</label>
      <input id='password' v-model.trim='password' type='password' name='password'>
    </div>

    <input type='submit' value='Login'>
  </form>
</template>

<script>
import axios from "axios";


export default {
  name: "login",

  data() {
    return {
      username: "",
      password: ""
    };
  },

  methods: {
    login: function() {
      const bodyContent = { username: this.username, password: this.password };
      axios.post("/api/users/login", bodyContent).then((res) => {
        this.$emit("login",res.data);
      });
    },
  }
};
</script>
