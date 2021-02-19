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
import {PLUGIN_HOST_URL} from '../../app' 

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
    //   let hashtagButton = this.$el.querySelector('.ql-hashtag')
    //   hashtagButton.addEventListener('click', this.onHashtagClicked)
    //   let peopleButton = this.$el.querySelector('.ql-people')
    //   peopleButton.addEventListener('click', this.onPeopleClicked)

      // this is a feature requested by UC Davis for the emojis experiment   
      let interestingTopicButton = this.$el.querySelector('.ql-interesting-topic')
      let surprisedButton = this.$el.querySelector('.ql-surprised')
      let curiousButton = this.$el.querySelector('.ql-just-curious')
      let lostButton = this.$el.querySelector('.ql-lost')
      let discussButton = this.$el.querySelector('.ql-lets-discuss')
      let thinkButton = this.$el.querySelector('.ql-i-think')
      let questionButton = this.$el.querySelector('.ql-question')
      let importantButton = this.$el.querySelector('.ql-important')
      let learningButton = this.$el.querySelector('.ql-learning-goal')
      let realButton = this.$el.querySelector('.ql-real-world-application')
      let lightbulbButton = this.$el.querySelector('.ql-lightbulb-moment') 
      let cc = this.$el.querySelector('.ql-cc')        

      //quilljs doesnt have a simple way to add tooltip. emojis are temp and this will be removed soon.
      interestingTopicButton.title = "interesting topic"      
      surprisedButton.title = "surprised"
      curiousButton.title  = "just curious"
      lostButton.title  = "lost"
      discussButton.title  = "lets discuss"
      thinkButton.title  = "i think"
      questionButton.title  = "question"
      importantButton.title  = "important"
      learningButton.title  = "learning-goal"
      realButton.title  = "real world application"
      lightbulbButton.title  = "lightbulb moment" 
      
      interestingTopicButton.addEventListener('click', () => {this.insertHashtag('interesting-topic')})
      surprisedButton.addEventListener('click', () => {this.insertHashtag('surprised')})
      curiousButton.addEventListener('click', () => {this.insertHashtag('just-curious')})
      lostButton.addEventListener('click', () => {this.insertHashtag('lost')})
      discussButton.addEventListener('click', () => {this.insertHashtag('lets-discuss')})
      thinkButton.addEventListener('click', () => {this.insertHashtag('i-think')})
      questionButton.addEventListener('click', () => {this.insertHashtag('question')})
      importantButton.addEventListener('click', () => {this.insertHashtag('important')})
      learningButton.addEventListener('click', () => {this.insertHashtag('learning-goal')})
      realButton.addEventListener('click', () => {this.insertHashtag('real-world-application')})
      lightbulbButton.addEventListener('click', () => {this.insertHashtag('lightbulb-moment')})                
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
          
        return `<span><img src="${PLUGIN_HOST_URL}/emoji/${item.emoji}.png">${item.value} </span>`
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
    insertHashtag(hashtag) {
        if (this.editor) {
            let range = this.editor.getSelection()
            if (range) {
                const tags = this.hashtags.filter(h => h.value === hashtag) 
                const tag = tags[0]
                const tagSpan = `<span class="mention" data-index="0" data-denotation-char="#" data-id="${tag.id}" data-value="${tag.value}">&#65279;<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>${tag.value}</span>&#65279;</span>`
                this.editor.clipboard.dangerouslyPasteHTML(range.index, tagSpan, 'user')
                this.editor.setSelection(range.index + hashtag.length + 1)
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
