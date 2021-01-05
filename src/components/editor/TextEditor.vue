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

/**
 * Component for the base text editor used in comment editor and search bar.
 * Also see {@link NbUser} and {@link NbHashtag}.
 *
 * @vue-prop {Array|Boolean} toolbar=false - editor toolbar options to show.
 *   If false, do not show toolbar. See Quill doc for more details.
 * @vue-prop {String} placeholder='' - editor placeholder text
 * @vue-prop {String} bounds='#nb-sidebar' - query selector for DOM element
 *   that bounds text editor, mainly used to make sure tooltip stays inside
 *   the element. See Quill doc for more info.
 * @vue-prop {String} initialContent='<p></p>' - initial editor content
 * @vue-prop {Array<NbUser>} users=([]) - all users enrolled in this course
 * @vue-prop {Array<NbHashtag>} hashtags=([]) - suggested hashtags in this course
 *
 * @vue-data {String} content - current editor content as HTML string
 * @vue-data {Object} config - configuration for Quill editor. See Vue Quill
 *   and Quill doc for more info.
 * @vue-data {Object} editor - editor object that belongs to the underlying
 *   Quill editor component. We use it to call some methods directly on Quill
 *   that are not supported by Vue Quill.
 *
 * @vue-event {String} text-change - Emit the new editor content on change
 *   as HTML string
 */
export default {
  name: 'text-editor',
  props: {
    toolbar: {
      type: [Array, Boolean],
      default: false // no toolbar
    },
    placeholder: {
      type: String,
      default: ''
    },
    bounds: {
      type: String,
      default: '#nb-sidebar'
    },
    initialContent: {
      type: String,
      default: ''
    },
    users: {
      type: Array,
      default: () => []
    },
    hashtags: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      content: this.initialContent,
      config: {
        modules: {
          toolbar: this.toolbar,
          mention: {
            allowedChars: /^[a-zA-Z\s]*$/,
            mentionDenotationChars: ['@', '#'],
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
  mounted: function () {
    if (this.toolbar) {
      let hashtagButton = this.$el.querySelector('.ql-hashtag')
      hashtagButton.addEventListener('click', this.onHashtagClicked)
      let peopleButton = this.$el.querySelector('.ql-people')
      peopleButton.addEventListener('click', this.onPeopleClicked)
    }
  },
  methods: {
    handleMention: function (searchTerm, renderList, mentionChar) {
      let matches = (mentionChar === '@') ? this.users : this.hashtags // mentionChar === "#"
      if (searchTerm.length > 0) {
        let toMatch = searchTerm.toLowerCase()
        matches = matches.filter(
          item => item.value.toLowerCase().includes(toMatch)
        )
      }
      if (mentionChar === '@' && matches.length > MAX_SUGGEST_USERS) {
        matches = matches.slice(0, MAX_SUGGEST_USERS)
      }
      renderList(matches, searchTerm)
    },
    renderMention: function (item, searchTerm) {
      if (item.hasOwnProperty('emoji')) {
        return `<span><img src="https://127.0.0.1:8080/emoji/${item.emoji}.png">${item.value}</span>`
      }
      return `${item.value}`
    },
    onTextChange: function (html) {
      this.$emit('text-change', html)
    },
    onSelectionChange (editor, range) {
      this.editor = editor
    },
    onHashtagClicked () {
      if (this.editor) {
        let range = this.editor.getSelection()
        if (range) {
          this.editor.insertText(range.index, '#', 'user')
          this.editor.setSelection(range.index + 1)
        }
      }
    },
    onPeopleClicked () {
      if (this.editor) {
        let range = this.editor.getSelection()
        if (range) {
          this.editor.insertText(range.index, '@', 'user')
          this.editor.setSelection(range.index + 1)
        }
      }
    }
  }
}
</script>
