<template>
  <div id="nb-sidebar">
    <filter-view
        :users="sortedUsers"
        :hashtags="sortedHashtags"
        @search-text="onSearchText"
        @filter-hashtags="onFilterHashtags"
        @filter-comments="onFilterComments"
        @filter-reply-reqs="onFilterReplyReqs"
        @filter-stars="onFilterStars">
    </filter-view>
    <list-view
        :threads="threads"
        :total-count="totalThreads"
        :thread-selected="threadSelected"
        :threads-hovered="threadsHovered"
        :show-highlights="showHighlights"
        @toggle-highlights="onToggleHighlights"
        @select-thread="onSelectThread"
        @hover-thread="onHoverThread"
        @unhover-thread="onUnhoverThread">
    </list-view>
    <thread-view
        v-if="threadSelected"
        :thread="threadSelected"
        :me="user"
        @edit-comment="onEditComment"
        @delete-comment="onDeleteComment"
        @draft-reply="onDraftReply">
    </thread-view>
    <editor-view
        :author="user"
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
  import NbComment from "../models/nbcomment.js"

  import FilterView from './FilterView.vue'
  import ListView from './ListView.vue'
  import ThreadView from './ThreadView.vue'
  import EditorView from './EditorView.vue'

  export default {
    name: 'nb-sidebar',
    props: {
      user:{
        type: Object,
        default:{}
      },
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
      threadsHovered: {
        type: Array,
        default: []
      },
      draftRange: Object,
      showHighlights: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        replyToComment: null,
        edittingComment: null,
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
      },
      authorName: function() {
        return this.user.name.first + " " + this.user.name.last
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
      onToggleHighlights: function(show) {
        this.$emit('toggle-highlights', show)
      },
      onSearchText: function(text) {
        this.$emit('search-text', text)
      },
      onFilterHashtags: function(hashtags) {
        this.$emit('filter-hashtags', hashtags)
      },
      onFilterComments: function(filters) {
        this.$emit('filter-comments', filters)
      },
      onFilterReplyReqs: function(filter) {
        this.$emit('filter-reply-reqs', filter)
      },
      onFilterStars: function(filter){
        this.$emit('filter-stars', filter)
      },
      onSelectThread: function(thread) {
        this.$emit('select-thread', thread)
      },
      onHoverThread: function(thread) {
        this.$emit('hover-thread', thread)
      },
      onUnhoverThread: function(thread) {
        this.$emit('unhover-thread', thread)
      },
      onEditComment: function(comment) {
        if (this.draftRange) {
          this.$emit('cancel-draft', this.draftRange)
        } else if (this.replyToComment) {
          this.replyToComment = null
        }
        this.edittingComment = comment
        this.initEditor('Edit Comment', comment.html, true)
      },
      onDeleteComment: function(comment) {
        if (comment.parent) { // reply
          comment.parent.removeChild(comment)
        } else { // head of thread
          this.$emit('delete-thread', comment)
        }
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

        if (this.edittingComment) {
          this.edittingComment.saveUpdates(data)
          this.edittingComment = null
          return
        }

        let id = null
        console.log(this.user)
        let author = this.user.id
        let name = this.user.name

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
        comment.submitAnnotation();

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
        } else if (this.replyToComment) {
          this.replyToComment = null
        } else if (this.edittingComment) {
          this.edittingComment = null
        }
      },
      initEditor: function(header, content, visible) {
        this.editor.key = Date.now() // work around to force redraw editor
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
  overflow-y: scroll;
  padding: 0 10px;
  position: fixed;
  top: 0;
  right: 0;
  line-height: normal;
  font-size: 16px;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}
</style>
