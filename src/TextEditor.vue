<template>
  <quill
      v-model="content"
      output="html"
      :config="config"
      @input="onTextChange" />
</template>

<script>
  import 'quill-mention'

  let MAX_SUGGEST_USERS = 10

  export default {
    name: 'text-editor',
    props: {
      toolbar: {
        type: [Array, Boolean],
        default: false // no toolbar
      },
      placeholder: {
        type: String,
        default: ""
      },
      initialContent: {
        type: String,
        default: ""
      },
      users: {
        type: Array,
        default: []
      },
      hashtags: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        content: this.initialContent,
        config: {
          modules: {
            toolbar: this.toolbar,
            mention: {
              allowedChars: /^[a-zA-Z\s]*$/,
              mentionDenotationChars: ["@", "#"],
              source: this.handleMention,
              renderItem: this.renderMention
            }
          },
          placeholder: this.placeholder,
          theme: 'snow'
        }
      }
    },
    methods: {
      handleMention: function(searchTerm, renderList, mentionChar) {
        let matches = (mentionChar === "@") ? this.users : this.hashtags // mentionChar === "#"
        if (searchTerm.length > 0) {
          let toMatch = searchTerm.toLowerCase()
          matches = matches.filter(
            item => item.value.toLowerCase().includes(toMatch)
          )
        }
        if (mentionChar === "@" && matches.length > MAX_SUGGEST_USERS) {
          matches = matches.slice(0, MAX_SUGGEST_USERS)
        }
        renderList(matches, searchTerm)
      },
      renderMention: function(item, searchTerm) {
        if (item.hasOwnProperty('emoji')) {
          return `<span>&#x${item.emoji};</span> ${item.value}`
        }
        return `${item.value}`
      },
      onTextChange: function(html) {
        this.$emit('text-change', html)
      }
    }
  }
</script>
