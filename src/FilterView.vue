<template>
  <div class="search-bar">
    <search-bar :users="users" :hashtags="hashtags" @text-change="onTextChange">
    </search-bar>
  </div>
</template>

<script>
  import SearchBar from './SearchBar.vue'

  export default {
    name: 'filter-view',
    props: {
      users: Array,
      hashtags: Array
    },
    methods: {
      onTextChange(text) {
        console.log(text)
        this.$emit('search-text', text)
      }
    },
    components: {
      SearchBar
    }
  }
</script>

<style scoped>
  .search-bar {
    width: 75%;
    display: inline-block;
    vertical-align: middle;
    border-radius: 5px;
  }
  /deep/ .ql-blank,
  /deep/ .ql-editor {
    padding: 6px 9px;
  }
</style>
