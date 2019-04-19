<template>
  <text-editor
      :placeholder="placeholder"
      :users="users"
      :hashtags="hashtags"
      @text-change="onTextChange" />
</template>

<script>
  import TextEditor from './TextEditor.vue'

  export default {
    name: 'search-bar',
    props: {
      users: Array,
      hashtags: Array
    },
    data() {
      return {
        placeholder: 'Search for comments'
      }
    },
    components: {
      TextEditor
    },
    methods: {
      onTextChange: function(html) {
        // TODO: for now work around to generate plain text, formula breaks
        let temp = document.createElement('div')
        temp.innerHTML = html
        this.$emit('text-change', temp.textContent)
      }
    }
  }
</script>
