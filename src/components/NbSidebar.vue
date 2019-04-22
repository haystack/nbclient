<template>
  <div id="nb-sidebar">
    <filter-view
        :users="sortedUsers"
        :hashtags="sortedHashtags"
        @search-text="onSearchText"
        @filter-hashtags="onFilterHashtags">
    </filter-view>
    <list-view
        :threads="threads"
        :total-count="totalThreads"
        :thread-selected="threadSelected"
        @select-thread="onSelectThread">
    </list-view>
    <thread-view
        v-if="threadSelected"
        :thread="threadSelected"
        @draft-reply="onDraftReply">
    </thread-view>
    <editor-view
        :key="editor.key"
        :visible="editor.visible"
        :header="editor.header"
        :initial-content="editor.initialContent"
        :users="sortedUsers"
        :hashtags="sortedHashtags"
        @submit-comment="onSubmitComment"
        @cancel-comment="onCancelComment">
    </editor-view>
  </div>
</template>

<script>
  import { compare } from '../utils/compare-util.js'
  import NbComment from "../models/NbComment.js"

  import FilterView from './FilterView.vue'
  import ListView from './ListView.vue'
  import ThreadView from './ThreadView.vue'
  import EditorView from './EditorView.vue'

  export default {
    name: 'nb-sidebar',
    props: {
      users: {
        type: Object,
        default: {}
      },
      hashtags: {
        type: Object,
        default: {}
      },
      totalThreads: { // count of total threads before filter
        type: Number,
        default: 0
      },
      threads: { // threads after filter
        type: Object,
        default: {}
      },
      threadSelected: Object,
      draftRange: Object
    },
    data() {
      return {
        replyToComment: null,
        editor: {
          key: Date.now(),
          visible: false,
          header: "",
          initialContent: null
        }
      }
    },
    computed: {
      sortedUsers: function() {
        let items = Object.values(this.users)
        for (let item of items) {
          Object.assign(item, { value: `${item.name.first} ${item.name.last}` })
        }
        return items.sort(compare('value'))
      },
      sortedHashtags: function() {
        return Object.values(this.hashtags).sort(compare('value'))
      }
    },
    watch: {
      draftRange: function(val) {
        if (val) {
          this.replyToComment = null // Cannot reply at the same time
          this.initEditor('New Comment', null, true)
        } else {
          // No new thread, not replying
          if (!this.replyToComment) this.editor.visible = false
        }
      },
    },
    methods: {
      onSearchText: function(text) {
        this.$emit('search-text', text)
      },
      onFilterHashtags: function(hashtags) {
        this.$emit('filter-hashtags', hashtags)
      },
      onSelectThread: function(thread) {
        this.$emit('select-thread', thread)
      },
      onDraftReply: function(comment) {
        if (this.draftRange) {
          this.$emit('cancel-draft', this.draftRange)
        }
        this.replyToComment = comment
        this.initEditor(`re: ${comment.text}`,  null, true)
      },
      onSubmitComment: function(data) {
        this.editor.visible = false

        let id = data.timestamp //TODO: get actual ID
        let author = '1' //TODO: get actual user ID
        let name = this.users[author].name

        let comment = new NbComment(
          id,
          this.draftRange, //range, null if this is reply
          this.replyToComment, //parent, null if this is the head of thread
          data.timestamp,
          author,
          `${name.first} ${name.last}`, //authorName
          data.html, //content
          data.mentions.hashtags,
          data.mentions.users,
          data.visibility,
          data.anonymity,
          data.replyRequested, //replyRequestedByMe
          data.replyRequested ? 1 : 0, //replyRequestCount
          false, //starredByMe
          0, //starCount
          true //seenByMe
        )

        if (this.draftRange) {
          this.$emit('new-thread', comment)
        } else if (this.replyToComment) {
          this.replyToComment.children.push(comment)
          this.replyToComment = null
        }
      },
      onCancelComment: function() {
        this.editor.visible = false
        if (this.draftRange) {
          this.$emit('cancel-draft', this.draftRange)
        }
      },
      initEditor: function(header, content, visible) {
        this.editor.key = Date.now()
        this.editor.header = header
        this.editor.initialContent = content
        this.editor.visible = visible
      }
    },
    components: {
      FilterView,
      ListView,
      ThreadView,
      EditorView
    }
  }
</script>

<style>
#nb-sidebar {
  width: 370px;
  height: 100vh;
  padding: 0 10px;
  position: fixed;
  top: 0;
  right: 0;
  overflow-x: visible; /* for editor tooltips */
  overflow-y: scroll;
  line-height: normal;
  font-size: 16px;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}
</style>
