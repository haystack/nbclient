<template>
  <div class="editor-view" v-show="visible">
    <div class="header">{{ header }}</div>
    <tabs v-if="currentConfigs.isCommentMediaAudio">
      <tab v-bind:class="{ active: activeTab === 'text' }" @click="handleTabChange('text')"><span><font-awesome-icon icon="i-cursor" class="ev-icon"></font-awesome-icon></span></tab>
      <tab v-if="currentConfigs.isCommentMediaAudio" v-bind:class="{ active: activeTab === 'audio' }" @click="handleTabChange('audio')"><span><font-awesome-icon icon="microphone" class="ev-icon"></font-awesome-icon></span></tab>
      <tab v-if="false" v-bind:class="{ active: activeTab === 'video' }" @click="handleTabChange('video')"><span><font-awesome-icon icon="video" class="ev-icon"></font-awesome-icon></span></tab>
    </tabs>
    <div class="area" v-bind:class="{ active: activeTab === 'text' }">
      <text-editor
          :key="key"
          :toolbar="toolbar"
          :placeholder="placeholder"
          :initial-content="initialContent"
          :users="users"
          :hashtags="hashtags"
          @text-change="onTextChange"
          @thread-typing="onThreadTyping"
          @thread-stop-typing="onThreadStopTyping">
      </text-editor>
    </div>
    <div v-if="currentConfigs.isCommentMediaAudio" class="area" v-bind:class="{ active: activeTab === 'audio' }">
        <audio-editor v-if="activeTab === 'audio' || mediaBlob"
                      @audio-stop="onAudioStop">
        </audio-editor>
    </div>
    <div v-if="false" class="area" v-bind:class="{ active: activeTab === 'video' }">
      Video
    </div>
    <div class="footer">
      <div class="selections">
        Post to
        <select v-model="visibility" @change="onVisibilityChange($event)">
          <option v-for="option in currentVisibilityOptions" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
        <br>as
        <select v-model="anonymity">
          <option v-for="option in anonymityOptions" :key="option.value"
              :value="option.value" :disabled="option.disabled">
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="checkbox-buttons">
        <input type="checkbox" id="draft-request-reply" v-if="currentConfigs.isExpClass" v-model="upvotedByMe">
        <input type="checkbox" id="draft-request-reply" v-else v-model="replyRequested">
        <label for="draft-request-reply">{{ currentConfigs.isExpClass ? "Discuss with class" : "Request replies" }}</label>
        <div class="buttons">
          <button class="cancel" @click="cancel" :disabled='isSubmitting'>Cancel</button>
          <button class="submit" @click="submit" :disabled='isSubmitting || !canSubmit'>
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
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
import AudioEditor from './AudioEditor.vue'

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
    initialUpvotedByMe: {
      type: Boolean,
      default: false
    },
    isSubmitting: {
      type: Boolean,
      default: false
    },
    currentConfigs: {
        type: Object,
        default: () => {}
    },
    users: Array,
    hashtags: Array,
    visible: Boolean,
  },
  data () {
    return {
      toolbar: {
        container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [ 'bold', 'italic', 'underline', 'strike' ],
        [{ 'script': 'super' }, { 'script': 'sub' } ],
        ['link'],
        // [ 'blockquote', 'code-block', 'link'/*, 'formula'*/ ],
        // [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        // [{ 'align': [] }],
        // [ 'people' ],
        ['interesting-topic', 'surprised', 'just-curious', 'lost', 'lets-discuss',  'i-think', 'question', 'important', 'learning-goal', 'real-world-application', 'lightbulb-moment', 'needs-work'],
      ],
      handlers: { // Add empty handler to suppress console warning. Handlers is added in TextEditor.vue
        'interesting-topic': () => { },
        'surprised': () => { },
        'just-curious': () => { },
        'lost': () => { },
        'lets-discuss': () => { },
        'i-think': () => { },
        'question': () => { },
        'important': () => { },
        'learning-goal': () => { },
        'real-world-application': () => { },
        'lightbulb-moment': () => { },
        'needs-work': () => { },
      }},
      placeholder: 'Type # or @ to include tags',
      content: this.initialContent,
      mediaBlob: null,
      visibility: this.initialVisibility,
      visibilityOptions: [
        { text: 'Entire class', value: CommentVisibility.EVERYONE },
        { text: 'Instructors and TAs', value: CommentVisibility.INSTRUCTORS },
        { text: 'Myself only', value: CommentVisibility.MYSELF }
      ],
      visibilityOptionsExp: [
        { text: 'Entire class', value: CommentVisibility.EVERYONE },
        { text: 'Myself only', value: CommentVisibility.MYSELF }
      ],
      anonymity: this.initialAnonymity,
      anonymityOptions: [
        { text: `${this.author.name.first} ${this.author.name.last}`, value: CommentAnonymity.IDENTIFIED, disabled: false },
        { text: 'Anonymous to Classmates', value: CommentAnonymity.ANONYMOUS, disabled: false }
      ],
      anonymousIdx: 1, // index for 'anonymous' in anonymityOptions
      replyRequested: this.initialReplyRequest,
      upvotedByMe: this.initialUpvotedByMe,
      activeTab: 'text',
    }
  },
  computed: {
    canSubmit: function() {
      return (this.activeTab === 'text' && !this.isEditorEmpty)
          || (this.activeTab === 'audio' && this.mediaBlob)
    },
    isEditorEmpty: function () {
      return htmlToText.fromString(this.content, { wordwrap: false }) === ''
    },
    currentVisibilityOptions: function () {
      if (this.currentConfigs.isExpClass) {
        return this.visibilityOptionsExp
      }

      return this.visibilityOptions
    }
  },
  watch: {
    isEditorEmpty: function (val) {
      this.$emit('editor-empty', val)
    }
  },
  methods: {
    handleTabChange: function(tab) {
      this.activeTab = tab
    },
    onThreadStopTyping: function() {
      this.$emit("thread-stop-typing", true)
    },
    onThreadTyping: function() {
      this.$emit("thread-typing", true)
    },
    onTextChange: function (html) {
      this.content = html
    },
    onAudioStop: function(blob) {
      this.mediaBlob = blob
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
      let text = this.content
      let blob = null

      if (this.activeTab === 'audio') {
        text = ''
        blob = this.mediaBlob
      }

      let comment = {
        timestamp: Date.now(),
        type: this.activeTab,
        html: text,
        mediaBlob: blob,
        mentions: this.extractMentions(),
        visibility: this.visibility,
        anonymity: this.anonymity,
        replyRequested: this.replyRequested,
        upvotedByMe: this.upvotedByMe
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
    TextEditor,
    AudioEditor
  }
}
</script>

<style>
#nb-app .editor-view tabs {
  background: white;
  border-bottom: 1px solid #d4d4d4;
  margin: 5px 0;
  width: 100%;
  display: flex;
  height: 30px;
  align-items: center;
  justify-content: flex-start;
}

#nb-app .editor-view tab {
  display: flex;
  width: 50px;
  border: 1px solid #dadada;
  background: #f9f5f5;
  height: 100%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

#nb-app .editor-view tab span {
    display: flex;
    align-content: center;
    justify-content: center;
}

#nb-app .editor-view tab:hover {
  background: #eee;
}

#nb-app .editor-view tab.active {
  background: #dadada;
  cursor: default;
}

#nb-app .editor-view .area {
  display: none;
  min-height: 50px;
  transition: all 0.5s;
}

#nb-app .editor-view .area.active {
  display: block;
  transition: all 0.5s;
}

.editor-view .ev-icon {
    color: #484848;
}
</style>
