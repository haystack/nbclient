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
        @text-change="onTextChange">
    </text-editor>
    <div class="footer">
      <div class="selections">
        Post to
        <select v-model="visibility" @change="onVisibilityChange($event)">
          <option v-for="option in visibilityOptions" :value="option.value">
            {{ option.text }}
          </option>
        </select>
        as
        <select v-model="anonymity">
          <option v-for="option in anonymityOptions" :value="option.value" :disabled="option.disabled">
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="checkbox-buttons">
        <input type="checkbox" id="draft-request-reply" v-model="replyRequested">
        <label for="draft-request-reply">Request replies</label>
        <div class="buttons">
          <button class="cancel" @click="cancel">Cancel</button>
          <button class="submit" @click="submit" :disabled="submitDisabled">
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import htmlToText from 'html-to-text'
  import { CommentVisibility, CommentAnonymity } from "../../models/enums.js"
  import TextEditor from './TextEditor.vue'

  export default {
    name: 'editor-view',
    props: {
      author: Object,
      key: String,
      header: String,
      initialContent: {
        type: String,
        default: "<p></p>"
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
    data() {
      return {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [ 'bold', 'italic', 'underline', 'strike' ],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [ 'blockquote', 'code-block', 'link', 'formula' ],
          [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'align': [] }],
          [ 'clean' ],
          [ 'hashtag', 'people' ]
        ],
        placeholder: 'Type # or @ to include tags',
        content: this.initialContent,
        visibility: this.initialVisibility,
        visibilityOptions: [
          { text: "Entire class", value: CommentVisibility.EVERYONE },
          { text: "Instructors and TAs", value: CommentVisibility.INSTRUCTORS },
          { text: "Myself only", value: CommentVisibility.MYSELF }
        ],
        anonymity: this.initialAnonymity,
        anonymityOptions: [
          { text: this.author.name.first + " " + this.author.name.last, value: CommentAnonymity.IDENTIFIED, disabled: false },
          { text: "Anonymous to Classmates", value: CommentAnonymity.ANONYMOUS, disabled: false }
        ],
        anonymousIdx: 1, //index for 'anonymous' in anonymityOptions
        replyRequested: this.initialReplyRequest
      }
    },
    computed: {
      submitDisabled: function() {
        return htmlToText.fromString(this.content, { wordwrap: false }) === ""
      }
    },
    methods: {
      onTextChange: function(html) {
        this.content = html
      },
      extractMentions() {
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
      submit: function() {
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
      cancel: function() {
        this.$emit('cancel-comment')
        this.resetPreferences()
      },
      onVisibilityChange: function(event) { //comment visibility
        // Disable 'anonymous' and choose 'identified' unless post to entire class.
        if (event.target.value === CommentVisibility.EVERYONE) {
          this.anonymityOptions[this.anonymousIdx].disabled = false
        } else {
          this.anonymity = CommentAnonymity.IDENTIFIED
          this.anonymityOptions[this.anonymousIdx].disabled = true
        }
      },
      resetPreferences: function() {
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
