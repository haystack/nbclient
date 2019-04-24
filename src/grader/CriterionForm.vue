<template>
  <div>
    <div>
      <input type="text" placeholder="Label (optional)" v-model="nickname">
    </div>
    <div>
      <input type="submit" value="Save">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'criterion-form',
    props: {
      editting: Object
    },
    data() {
      return {
        nickname: "",
        type: null,
        filters: {}
      }
    },
    watch: {
      editting: function(val) {
        this.nickname = val ? val.nickname : ""
        this.type = val ? val.type : null
        this.filters = val ? Object.assign({}, val) : {}
      }
    },
    methods: {
    }
  }
</script>

<style scoped>
</style>
