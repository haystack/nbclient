<template>
  <quill
      v-model="content"
      output="html"
      :config="config"
      @input="onTextChange"
      @selection-change="onSelectionChange">
  </quill>
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
      bounds: {
        type: String,
        default: "#nb-sidebar"
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
          bounds: this.bounds,
          theme: 'snow'
        },
        editor: null
      }
    },
    mounted: function() {
      if (this.toolbar) {
        let hashtagButton = this.$el.querySelector('.ql-hashtag')
        hashtagButton.addEventListener('click', this.onHashtagClicked)
        let peopleButton = this.$el.querySelector('.ql-people')
        peopleButton.addEventListener('click', this.onPeopleClicked)
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
      },
      onSelectionChange(editor, range) {
        this.editor = editor
      },
      onHashtagClicked() {
        if (this.editor) {
          let range = this.editor.getSelection()
          if (range) {
            this.editor.insertText(range.index, "#", "user")
            this.editor.setSelection(range.index + 1)
          }
        }
      },
      onPeopleClicked() {
        if (this.editor) {
          let range = this.editor.getSelection()
          if (range) {
            this.editor.insertText(range.index, "@", "user")
            this.editor.setSelection(range.index + 1)
          }
        }
      }
    }
  }
</script>
