<template>
  <text-editor
      :placeholder="placeholder"
      :users="users"
      :hashtags="hashtags"
      @text-change="onTextChange">
  </text-editor>
</template>

<script>
  import TextEditor from '../editor/TextEditor.vue'
  import htmlToText from 'html-to-text'

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
    methods: {
      onTextChange: function(html) {
        let text = htmlToText.fromString(html, { wordwrap: false })
        this.$emit('text-change', text)
      }
    },
    components: {
      TextEditor
    }
  }
</script>
