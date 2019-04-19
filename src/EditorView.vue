<template>
  <div v-show="visible" ref="view">
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
      </div>
      <div class="editor-button">
        <button class="submit" @click="submit">Submit</button>
        <button class="cancel" @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
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
      author: { // TODO: Use actual name
        type: String,
        default: "Alisa Ono"
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
        visibility: 'everyone', //comment visibility TODO: enum?
        visibilityOptions: [
          { text: "Entire class", value: 'everyone' },
          { text: "Instructors and TAs", value: 'instructors' },
          { text: "Myself only", value: 'myself' }
        ], //TODO: if replying to private comment, should the visibility also be private?
        anonymity: 'identified', //comment anonymity TODO: enum?
        anonymityOptions: [
          { text: this.author, value: 'identified', disabled: false },
          { text: "Anonymous to Classmates", value: 'anonymous', disabled: false }
        ],
        ANONYMOUS_IDX: 1, //index for 'anonymous' in anonymityOptions
        replyRequested: false
      }
    },
    components: {
      TextEditor
    },
    methods: {
      onTextChange: function(html) {
        this.content = html
      },
      extractMentions() {
        let tags = this.$refs.view.getElementsByClassName('mention')
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
        this.visible = false
        this.$emit('submit-comment', comment)
        this.resetCommentPrefs()
      },
      cancel: function() {
        this.visible = false
        this.$emit('cancel-comment')
        this.resetCommentPrefs()
      },
      onVisibilityChange: function(event) { //comment visibility
        // Disable 'anonymous' and choose 'identified' unless post to entire class.
        if (event.target.value === 'everyone') { //TODO: enum?
          this.anonymityOptions[this.ANONYMOUS_IDX].disabled = false
        } else {
          this.anonymity = 'identified'
          this.anonymityOptions[this.ANONYMOUS_IDX].disabled = true
        }
      },
      resetCommentPrefs: function() {
        this.visibility = this.defaultVisibility
        this.anonymity = this.defaultAnonymity
        this.replyRequested = false
      }
    }
  }
</script>

<style scoped>
  /* TODO: clean up styling */
  .editor-header {
    color: #444;
    padding-bottom: 5px;
  }
  .editor-footer {
    color: #444;
    font-size: 14px;
  }
  .editor-selection {
    padding-top: 5px;
  }
  .editor-checkbox {
    padding: 5px 0;
  }
  .editor-button > button {
    float: right;
  }
</style>
