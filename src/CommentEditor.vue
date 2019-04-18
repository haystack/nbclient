<template>
  <div :style="editorStyle">
    <text-editor
        :key="key"
        :toolbar="toolbar"
        :placeholder="placeholder"
        :initial-content="initialContent"
        :users="users"
        :hashtags="hashtags"
        @text-change="onTextChange" />
  </div>
</template>

<script>
  import TextEditor from './TextEditor.vue'

  export default {
    name: 'comment-editor',
    props: {
      key: String,
      initialContent: {
        type: String,
        default: "<p></p>"
      },
      users: Array,
      hashtags: Array,
      editorStyle: String
    },
    data() {
      return {
        toolbar: [
          // TODO: Which options should we include?
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [ 'bold', 'italic', 'underline', 'strike' ],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [ 'blockquote', 'code-block', 'link', 'formula' ],
          [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'align': [] }],
          [ 'clean' ]
        ],
        placeholder: 'Include tags with @ or #',
        content: {
          html: null,
          text: null
        }
      }
    },
    components: {
      TextEditor
    },
    methods: {
      onTextChange: function(html, text) {
        this.content.html = html
        this.content.text = text
        this.$emit('content-change', this.content)
      }
    }
  }
</script>
