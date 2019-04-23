<template>
  <div class="editor-view" v-show="visible">
    <div class="editor-header">{{ header }}</div>
    <text-editor
        :key="key"
        :toolbar="toolbar"
        :placeholder="placeholder"
        :initial-content="initialContent"
        :users="users"
        :hashtags="hashtags"
        @text-change="onTextChange">
    </text-editor>
    <div class="editor-footer">
      <div class="editor-selection">
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
      <div class="editor-checkbox">
        <input type="checkbox" id="draft-request-reply" v-model="replyRequested">
        <label for="draft-request-reply">Request replies</label>
        <div class="editor-button">
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
  import { CommentVisibility, CommentAnonymity } from "../models/enums.js"
  import TextEditor from './TextEditor.vue'

  export default {
    name: 'editor-view',
    props: {
      key: String,
      header: String,
      initialContent: {
        type: String,
        default: "<p></p>"
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
          [ 'clean' ]
        ],
        placeholder: 'Include tags with @ or #',
        content: this.initialContent,
        visibility: CommentVisibility.EVERYONE,
        visibilityOptions: [
          { text: "Entire class", value: CommentVisibility.EVERYONE },
          { text: "Instructors and TAs", value: CommentVisibility.INSTRUCTORS },
          { text: "Myself only", value: CommentVisibility.MYSELF }
        ],
        anonymity: CommentAnonymity.IDENTIFIED,
        anonymityOptions: [
          { text: "Tim Beaver", value: CommentAnonymity.IDENTIFIED, disabled: false }, // TODO: get actual user name
          { text: "Anonymous to Classmates", value: CommentAnonymity.ANONYMOUS, disabled: false }
        ],
        anonymousIdx: 1, //index for 'anonymous' in anonymityOptions
        replyRequested: false
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

<style scoped>
  .editor-view {
    margin: 10px 0;
  }
  .editor-header {
    font-size: 14px;
    color: #444;
    padding-bottom: 5px;
  }
  .editor-footer {
    color: #444;
  }
  .editor-selection {
    padding-top: 5px;
    font-size: 12px;
  }
  .editor-checkbox {
    padding: 5px 0;
    font-size: 12px;
  }
  .editor-button {
    display: inline-block;
    position: absolute;
    right: 10px;
  }
  .editor-button button {
    width: 80px;
    padding: 6px;
    border-radius: 5px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }
  .editor-button button.cancel {
    background-color: #6c757d;
    border-color: #6c757d;
  }
  .editor-button button.cancel:hover {
    background-color: #5a6268;
  }
  .editor-button button.submit {
    background-color: #007bff;
    border-color: #007bff;
  }
  .editor-button button.submit:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .editor-button button.submit:enabled:hover {
    background-color: #0069d9;
  }
</style>
