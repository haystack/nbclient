<template>
  <div id="nb-sidebar" class="nb-sidebar">
    <nav-bar :me="user" @logout="$emit('logout')"></nav-bar>
    <div class="nb-menu" v-if="myClasses.length > 1">
        <nb-menu 
            :myClasses="myClasses" 
            :activeClass="activeClass"
            @switch-class="onSwitchClass"
            @show-sync-features="onShowSyncFeatures">
        </nb-menu>
    </div>
    <filter-view
        :me="user"
        :users="sortedUsers"
        :hashtags="sortedHashtags"
        @search-option="onSearchOption"
        @search-text="onSearchText"
        @filter-bookmarks="onFilterBookmarks"
        @filter-hashtags="onFilterHashtags"
        @filter-user-tags="onFilterUserTags"
        @filter-comments="onFilterComments"
        @filter-reply-reqs="onFilterReplyReqs"
        @filter-upvotes="onFilterUpvotes"
        @min-words="onMinWords"
        @max-words="onMaxWords"
        @min-hashtags="onMinHashtags"
        @max-hashtags="onMaxHashtags"
        @min-replies="onMinReplies"
        @min-reply-reqs="onMinReplyReqs"
        @min-upvotes="onMinUpvotes">
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
        :replyToComment="replyToComment"
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
        :initial-visibility="editor.initialSettings.visibility"
        :initial-anonymity="editor.initialSettings.anonymity"
        :initial-reply-request="editor.initialSettings.replyRequested"
        :users="sortedUsers"
        :hashtags="sortedHashtags"
        @editor-empty="onEditorEmpty"
        @submit-comment="onSubmitComment"
        @cancel-comment="onCancelComment"
        @thread-typing="onThreadTyping"
        @thread-stop-typing="onThreadStopTyping"
        >
    </editor-view>
    <!-- <nb-chat :user="user"></nb-chat> -->

  </div>
</template>

<script>
import htmlToText from 'html-to-text'
import { compare } from '../utils/compare-util.js'
import { CommentVisibility, CommentAnonymity } from '../models/enums.js'
import NbComment from '../models/nbcomment.js'

import NavBar from './NavBar.vue'
import FilterView from './filters/FilterView.vue'
import ListView from './list/ListView.vue'
import ThreadView from './thread/ThreadView.vue'
import EditorView from './editor/EditorView.vue'
import NbMenu from './NbMenu.vue'
import NbChat from './NbChat.vue'

export default {
  name: 'nb-sidebar',
  props: {
    user: {
      type: Object,
      default: () => {}
    },
    users: {
      type: Object,
      default: () => {}
    },
    myClasses: {
      type: Array,
      default: () => []
    },
    activeClass: {
      type: Object,
      default: () => {}
    },
    hashtags: {
      type: Object,
      default: () => {}
    },
    totalThreads: { // count of total threads before filter
      type: Number,
      default: 0
    },
    threads: { // threads after filter
      type: Object,
      default: () => {}
    },
    threadSelected: Object,
    threadsHovered: {
      type: Array,
      default: () => []
    },
    draftRange: Object,
    showHighlights: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      replyToComment: null,
      edittingComment: null,
      editor: {
        key: Date.now(),
        visible: false,
        header: '',
        initialContent: null,
        initialSettings: {
          visibility: CommentVisibility.EVERYONE,
          anonymity: CommentAnonymity.IDENTIFIED,
          replyRequested: false
        },
        isEmpty: true,
      }
    }
  },
  computed: {
    sortedUsers: function () {
      let items = Object.values(this.users)
      for (let item of items) {
        Object.assign(item, { value: `${item.name.first} ${item.name.last}` })
      }
      return items.sort(compare('value'))
    },
    sortedHashtags: function () {
      return Object.values(this.hashtags).sort(compare('value'))
    }
  },
  watch: {
    draftRange: function (val, oldVal) {
      if (val) {
        if (this.replyToComment || this.edittingComment) {
          alert("You're already working on another comment. Please save or cancel it first.")
          this.$emit('cancel-draft', this.draftRange)
          return
        }
        if (!oldVal) { // Init editor only if it's not open yet.
          this.initEditor('New Comment', null, {}, true)
        }
      } else {
        // No new thread, not replying or editting
        if (!this.replyToComment && !this.edittingComment) {
          this.editor.visible = false
        }
      }
    },
    threadSelected: function (val) {
      if (!val && this.replyToComment && this.editor.isEmpty) {
        // When thread is unselected, cancel reply if editor is empty.
        this.editor.visible = false
        this.replyToComment = null
      }
    }
  },
  methods: {
    onSwitchClass: function (newClass) {
      this.$emit('switch-class', newClass)
    },
    onShowSyncFeatures: function (showSyncFeatures) {
      this.$emit('show-sync-features', showSyncFeatures)
    },
    onToggleHighlights: function (show) {
      this.$emit('toggle-highlights', show)
    },
    onSearchOption: function (option) {
      this.$emit('search-option', option)
    },
    onSearchText: function (text) {
      this.$emit('search-text', text)
    },
    onFilterBookmarks: function (filter) {
      this.$emit('filter-bookmarks', filter)
    },
    onFilterHashtags: function (hashtags) {
      this.$emit('filter-hashtags', hashtags)
    },
    onFilterUserTags: function (filters) {
      this.$emit('filter-user-tags', filters)
    },
    onFilterComments: function (filters) {
      this.$emit('filter-comments', filters)
    },
    onFilterReplyReqs: function (filter) {
      this.$emit('filter-reply-reqs', filter)
    },
    onFilterUpvotes: function (filter) {
      this.$emit('filter-upvotes', filter)
    },
    onMinWords: function (min) {
      this.$emit('min-words', min)
    },
    onMaxWords: function (max) {
      this.$emit('max-words', max)
    },
    onMinHashtags: function (min) {
      this.$emit('min-hashtags', min)
    },
    onMaxHashtags: function (max) {
      this.$emit('max-hashtags', max)
    },
    onMinReplies: function (min) {
      this.$emit('min-replies', min)
    },
    onMinReplyReqs: function (min) {
      this.$emit('min-reply-reqs', min)
    },
    onMinUpvotes: function (min) {
      this.$emit('min-upvotes', min)
    },
    onSelectThread: function (thread) {
      this.$emit('select-thread', thread)
    },
    onHoverThread: function (thread) {
      this.$emit('hover-thread', thread)
    },
    onUnhoverThread: function (thread) {
      this.$emit('unhover-thread', thread)
    },
    onEditComment: function (comment) {
      if (this.draftRange || this.replyToComment) {
        alert("You're already working on another comment. Please save or cancel it first.")
        return
      }
      let settings = {
        visibility: comment.visibility,
        anonymity: comment.anonymity,
        replyRequested: comment.replyRequestedByMe
      }
      this.edittingComment = comment
      this.initEditor('Edit Comment', comment.html, settings, true)
    },
    onDeleteComment: function (comment) {
      if (comment.parent) { // reply
        comment.parent.removeChild(comment)
      } else { // head of thread
        this.$emit('delete-thread', comment)
      }
    },
    onDraftReply: function (comment) {
      if (this.draftRange || this.edittingComment) {
        alert("You're already working on another comment. Please save or cancel it first.")
        return
      }
      this.replyToComment = comment
      this.initEditor(`re: ${comment.text}`, null, {}, true)
    },
    onEditorEmpty: function (isEmpty) {
      this.editor.isEmpty = isEmpty
      this.$emit('editor-empty', isEmpty)
    },
    onSubmitComment: function (data) {
      this.editor.visible = false

      if (this.edittingComment) {
        this.edittingComment.saveUpdates(data)
        this.edittingComment = null
        return
      }

      let responseWanted = confirm("Do you want to request help from a classmate and get notifications about this thread?")

      let comment = new NbComment({
        id: null, // will be updated when submitAnnotation() is called
        range: this.draftRange, // null if this is reply
        parent: this.replyToComment, // null if this is the head of thread
        timestamp: null,
        author: this.user.id,
        authorName: `${this.user.name.first} ${this.user.name.last}`,
        instructor: this.user.role === 'instructor',
        html: data.html,
        hashtags: data.mentions.hashtags,
        people: data.mentions.users,
        visibility: data.visibility,
        anonymity: data.anonymity,
        replyRequestedByMe: data.replyRequested || responseWanted,
        replyRequestCount: (data.replyRequested || responseWanted) ? 1 : 0,
        upvotedByMe: false,
        upvoteCount: 0,
        seenByMe: true,
      })
      comment.submitAnnotation(this.activeClass.id)
      if (this.draftRange) {
        this.$emit('new-thread', comment)
      } else if (this.replyToComment) {
        this.replyToComment.children.push(comment)
        this.replyToComment = null
      }
    },
    onCancelComment: function () {
      this.editor.visible = false
      if (this.draftRange) {
        this.$emit('cancel-draft', this.draftRange)
      } else if (this.replyToComment) {
        this.replyToComment = null
      } else if (this.edittingComment) {
        this.edittingComment = null
      }
    },
    initEditor: function (header, content, settings, visible) {
      this.editor.key = Date.now() // work around to force redraw editor
      this.editor.header = header
      this.editor.initialContent = content

      let plaintext = htmlToText.fromString(content, { wordwrap: false })
      this.editor.isEmpty = (plaintext === '')
      this.$emit('editor-empty', this.editor.isEmpty)

      let defaultSettings = {
        visibility: CommentVisibility.EVERYONE,
        anonymity: CommentAnonymity.IDENTIFIED,
        replyRequested: false
      }
      this.editor.initialSettings = Object.assign(defaultSettings, settings)
      this.editor.visible = visible
    },
    onThreadTyping: function(val) {
      if (this.threadSelected) {
        this.$emit('thread-typing', this.threadSelected.id)
      }
    },
    onThreadStopTyping: function(val) {
      if (this.threadSelected) {
        this.$emit('thread-stop-typing', this.threadSelected.id)
      }
    }
  },
  components: {
    NavBar,
    FilterView,
    ListView,
    ThreadView,
    EditorView,
    NbMenu,
    NbChat,
  }
}
</script>
