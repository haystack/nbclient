<template>
  <div>
    <div class="thread-row" :style="styleRow">
      <div class="header">
        <span class="author">
          <div v-if="comment.instructor" class="instr-icon">
            instr
          </div>
          <b>{{ authorName }}</b>{{ comment.author === me.id ? " (me)" : "" }}
        </span>
        <span class="timestamp">{{ timeString }}</span>
        <div class="options">
          <span
              class="bookmark"
              v-tooltip="comment.bookmarked ? 'remove bookmark' : 'bookmark'"
              @click="toggleBookmark(comment)">
            <font-awesome-icon v-if="comment.bookmarked"
                :icon="['fas', 'bookmark']" class="fas icon">
            </font-awesome-icon>
            <font-awesome-icon v-else
                :icon="['far', 'bookmark']" class="far icon">
            </font-awesome-icon>
          </span>
          <v-popover
              v-if="firstComment || commentEditable"
              class="overflow-menu"
              popoverClass="thread-overflow-wrapper"
              container="#nb-app-wrapper"
              boundariesElement="#nb-app-wrapper"
              offset="0"
              placement="bottom-end"
              :open="showOverflow"
              @hide="onHideOverflow">
            <span
                class="tooltip-target overflow-icon"
                @click="showOverflow = true">
              <font-awesome-icon icon="ellipsis-v"></font-awesome-icon>
            </span>
            <template slot="popover">
              <div class="overflow-options">
                <div
                    v-if="firstComment"
                    class="overflow-option"
                    @click="copyLink(comment)">
                  Copy link
                </div>
                <div
                    v-if="commentEditable"
                    class="overflow-option"
                    @click="editComment(comment)">
                  Edit
                </div>
                <div
                    v-if="commentEditable"
                    class="overflow-option"
                    @click="deleteComment(comment)">
                  Delete
                </div>
              </div>
            </template>
          </v-popover>
        </div>
      </div>
      <div class="body" v-html="comment.html"></div>
      <div class="footer">
        <span
            v-tooltip="'reply'"
            @click="draftReply(comment)">
          <font-awesome-icon icon="reply" class="icon"></font-awesome-icon>
          {{ comment.countAllReplies() }}
        </span>
        &nbsp;·&nbsp;
        <span
            v-tooltip="comment.upvotedByMe ? 'undo upvote' : 'upvote'"
            @click="toggleUpvote(comment)">
          <font-awesome-icon icon="thumbs-up" class="icon" :style="styleUpvote">
          </font-awesome-icon>
          {{ comment.upvoteCount }}
        </span>
        &nbsp;·&nbsp;
        <span
            v-tooltip="comment.replyRequestedByMe ? 'undo request' : 'request reply'"
            @click="toggleReplyRequest(comment)">
          <font-awesome-icon icon="question" class="icon" :style="styleQuestion">
          </font-awesome-icon>
          {{ comment.replyRequestCount }}
        </span>
      </div>
    </div>
    <div class="thread-block" v-if="comment.children.length">
      <thread-comment
          v-for="child in comment.children"
          :comment="child"
          :me="me"
          :replyToComment="replyToComment"
          :key="child.id"
          @edit-comment="editComment"
          @delete-comment="deleteComment"
          @draft-reply="draftReply"
          @toggle-upvote="toggleUpvote"
          @toggle-reply-request="toggleReplyRequest">
      </thread-comment>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { CommentAnonymity } from '../../models/enums.js'

/**
 * Component for each row in the nested discussion view of thread.
 * Also see {@link NbComment} and {@link NbUser}.
 *
 * @vue-prop {NbComment} comment - comment or for this row
 * @vue-prop {NbUser} me - current user
 * @vue-prop {NbComment} replyToComment - comment user is currently drafting
 *   a reply for, if any.
 *
 * @vue-data {Boolean} showOverflow - if true, show overflow menu popup
 *   (edit, delete, get link) for this comment
 *
 * @vue-event {NbComment} edit-comment - Emit this comment when user clicks on
 *   edit option in overflow menu
 * @vue-event {NbComment} delete-comment - Emit this comment when user clicks on
 *   delete option in overflow menu
 * @vue-event {NbComment} draft-reply - Emit this comment when user clicks on
 *   reply button in this row
 */
export default {
  name: 'thread-comment',
  props: {
    comment: Object,
    me: Object,
    replyToComment: Object
  },
  data () {
    return {
      showOverflow: false
    }
  },
  methods: {
    copyLink: function (comment) {
      this.showOverflow = false
      let url = new URL(window.location.href)
      url.hash = `#nb-comment-${comment.id}`
      let el = document.createElement('textarea')
      el.value = url.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    editComment: function (comment) {
      this.showOverflow = false
      this.$emit('edit-comment', comment)
    },
    deleteComment: function (comment) {
      this.showOverflow = false
      this.$emit('delete-comment', comment)
    },
    onHideOverflow: function () {
      this.showOverflow = false
    },
    draftReply: function (comment) {
      this.$emit('draft-reply', comment)
    },
    toggleBookmark: function (comment) {
      comment.toggleBookmark()
    },
    toggleUpvote: function (comment) {
      comment.toggleUpvote()
    },
    toggleReplyRequest: function (comment) {
      comment.toggleReplyRequest()
    }
  },
  computed: {
    authorName: function () {
      if (
        (this.comment.anonymity === CommentAnonymity.ANONYMOUS &&
          this.me.role !== 'instructor') ||
        this.comment.author === null
      ) {
        return 'Anonymous'
      }
      return this.comment.authorName
    },
    timeString: function () {
      return moment(this.comment.timestamp).fromNow()
    },
    firstComment: function () {
      return !this.comment.parent
    },
    commentEditable: function () {
      return (this.comment.author === this.me.id) &&
        (this.comment.children.length === 0)
    },
    styleUpvote: function () {
      if (this.comment.upvotedByMe) {
        return { color: '#70a0f0' }
      }
      return null
    },
    styleQuestion: function () {
      if (this.comment.replyRequestedByMe) {
        return { color: '#70a0f0' }
      }
      return null
    },
    styleRow: function () {
      if (this.comment === this.replyToComment) {
        return { background: '#ffffd0' }
      }
      return null
    }
  }
}
</script>
