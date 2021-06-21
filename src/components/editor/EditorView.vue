<template>
  <div class="editor-view" v-show="visible">
    <div class="header">{{ header }}</div>
    <text-editor
        :key="key"
        :toolbar="toolbar"
        :placeholder="placeholder"
        :initial-content="initialContent"
        :users="users"
        :hashtags="hashtags"
        @text-change="onTextChange"
        @thread-typing="onThreadTyping"
        @thread-stop-typing="onThreadStopTyping"
        >
    </text-editor>
    <div class="footer">
      <div class="selections">
        Post to
        <select v-model="visibility" @change="onVisibilityChange($event)">
          <option v-for="option in visibilityOptions" :key="option.value"
              :value="option.value">
            {{ option.text }}
          </option>
        </select>
        as
        <select v-model="anonymity">
          <option v-for="option in anonymityOptions" :key="option.value"
              :value="option.value" :disabled="option.disabled">
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="checkbox-buttons">
        <input type="checkbox" id="draft-request-reply" v-model="replyRequested">
        <label for="draft-request-reply">Request replies</label>
        <div class="buttons">
          <button class="cancel" @click="cancel">Cancel</button>
          <button class="submit" @click="submit" :disabled="isEditorEmpty">
            Submit
          </button>
        </div>
      </div>
      <div class="nb-emoji-attr">All emojis designed by OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0</div>
    </div>
  </div>
</template>

<script>
import htmlToText from 'html-to-text'
import { CommentVisibility, CommentAnonymity } from '../../models/enums.js'
import TextEditor from './TextEditor.vue'

/**
 * Component for the comment composer/editor on the side bar.
 * Also see {@link NbUser} and {@link NbHashtag}.
 *
 * @vue-prop {NbUser} author - the current user
 * @vue-prop {String} key - unique key for forcing editor to redraw on change
 * @vue-prop {String} header - label to show above the text editor
 * @vue-prop {String} initialContent='<p></p>' - initial comment content
 * @vue-prop {String} initialVisibility='CommentVisibility.EVERYONE'
 *   - initially selected comment visibility option
 * @vue-prop {String} initialAnonymity='CommentAnonymity.IDENTIFIED'
 *   - initially selected comment anonymity option
 * @vue-prop {Boolean} initialReplyRequest=false - true if comment is initially
 *   reply requested by the current user
 * @vue-prop {Array<NbUser>} users - all users enrolled in this course
 * @vue-prop {Array<NbHashtag>} hashtags - suggested hashtags in this course
 * @vue-prop {Boolean} visible - true if the comment editor is visible
 *
 * @vue-data {Array} toolbar - editor toolbar options to show,
 *   see Quill doc for more info.
 * @vue-data {String} placeholder - editor placeholder text
 * @vue-data {String} content - current comment content as HTML string
 * @vue-data {String} visibility - currently selected comment visibility option
 * @vue-data {Array} visibilityOptions - all visibility options, each option
 *   is an object with two string props, text (for labels) and value
 * @vue-data {String} anonymity - currently selected comment anonymity option
 * @vue-data {Array} anonymityOptions - all anonymity options, each option
 *   is an object with two string props, text (for labels) and value
 * @vue-data {Number} anonymousIdx - index for 'anonymous' in anonymityOptions
 * @vue-data {Boolean} replyRequested - true if reply request is selected
 *
 * @vue-computed {Boolean} isEditorEmpty - true if current editor content as
 *   plaintext is empty
 *
 * @vue-event {Boolean} editor-empty - Emit true (editor is empty) or false
 *   (editor is not empty) when the empty state changes
 * @vue-event {} cancel-comment - Emit when user cancels current comment
 * @vue-event {Object} submit-comment - Emit when user submits current comment.
 *   Object has following fields: timestamp (String), content (HTML string),
 *   mentions (Object), visibility (Enum), anonymity (Enum),
 *   replyRequested (Boolean)
 */
export default {
  name: 'editor-view',
  props: {
    author: Object,
    key: String,
    header: String,
    initialContent: {
      type: String,
      default: '<p></p>'
    },
    initialVisibility: {
      type: String,
      default: CommentVisibility.EVERYONE
    },
    initialAnonymity: {
      type: String,
      default: CommentAnonymity.IDENTIFIED
    },
    initialReplyRequest: {
      type: Boolean,
      default: false
    },
    users: Array,
    hashtags: Array,
    visible: Boolean
  },
  data () {
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [ 'bold', 'italic', 'underline', 'strike' ],
        [{ 'script': 'super' }, { 'script': 'sub' } ],
        // [ 'blockquote', 'code-block', 'link'/*, 'formula'*/ ],
        // [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        // [{ 'align': [] }],
        // [ 'people' ],
        ['interesting-topic', 'surprised', 'just-curious', 'lost', 'lets-discuss',  'i-think', 'question', 'important', 'learning-goal', 'real-world-application', 'lightbulb-moment', 'needs-work'],
      ],
      placeholder: 'Type # or @ to include tags',
      content: this.initialContent,
      visibility: this.initialVisibility,
      visibilityOptions: [
        { text: 'Entire class', value: CommentVisibility.EVERYONE },
        { text: 'Instructors and TAs', value: CommentVisibility.INSTRUCTORS },
        { text: 'Myself only', value: CommentVisibility.MYSELF }
      ],
      anonymity: this.initialAnonymity,
      anonymityOptions: [
        { text: `${this.author.name.first} ${this.author.name.last}`, value: CommentAnonymity.IDENTIFIED, disabled: false },
        { text: 'Anonymous to Classmates', value: CommentAnonymity.ANONYMOUS, disabled: false }
      ],
      anonymousIdx: 1, // index for 'anonymous' in anonymityOptions
      replyRequested: this.initialReplyRequest,
    }
  },
  computed: {
    isEditorEmpty: function () {
      return htmlToText.fromString(this.content, { wordwrap: false }) === ''
    }
  },
  watch: {
    isEditorEmpty: function (val) {
      this.$emit('editor-empty', val)
    }
  },
  methods: {
    onThreadStopTyping: function() {
      this.$emit("thread-stop-typing", true)
    },
    onThreadTyping: function() {
      this.$emit("thread-typing", true)
    },
    onTextChange: function (html) {
      this.content = html
    },
    extractMentions () {
      let tags = this.$el.getElementsByClassName('mention')
      let extracted = {
        users: [],
        hashtags: []
      }
      for (let tag of tags) {
        let type = tag.getAttribute('data-denotation-char') === '@' ? 'users' : 'hashtags'
        extracted[type].push(tag.getAttribute('data-id'))
      }
      return extracted
    },
    submit: function () {
      let comment = {
        timestamp: Date.now(),
        html: this.content,
        mentions: this.extractMentions(),
        visibility: this.visibility,
        anonymity: this.anonymity,
        replyRequested: this.replyRequested
      }
      this.$emit('submit-comment', comment)
      this.resetPreferences()
    },
    cancel: function () {
      this.$emit('cancel-comment')
      this.resetPreferences()
    },
    onVisibilityChange: function (event) { // comment visibility
      // Disable 'anonymous' and choose 'identified' unless post to entire class.
      if (event.target.value === CommentVisibility.EVERYONE) {
        this.anonymityOptions[this.anonymousIdx].disabled = false
      } else {
        this.anonymity = CommentAnonymity.IDENTIFIED
        this.anonymityOptions[this.anonymousIdx].disabled = true
      }
    },
    resetPreferences: function () {
      this.visibility = CommentVisibility.EVERYONE
      this.anonymity = CommentAnonymity.IDENTIFIED
      this.replyRequested = false
    }
  },
  components: {
    TextEditor
  }
}
</script>
