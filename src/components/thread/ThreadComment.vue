<template>
  <div>
    <div class="thread-row">
      <div class="header">
        <span class="author">
          <font-awesome-icon v-if="comment.instructor" icon="info" class="icon">
          </font-awesome-icon>
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
          <v-popover class="overflow-menu" :disabled="!overflowMenu">
            <span
                v-if="commentEditable"
                class="tooltip-target overflow-icon"
                @click="overflowMenu = true">
              ···
            </span>
            <template slot="popover">
              <div
                  class="overflow-option nb-comment-tooltip"
                  @click="editComment(comment)">
                Edit
              </div>
              <div
                  class="overflow-option nb-comment-tooltip"
                  @click="deleteComment(comment)">
                Delete
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
            v-tooltip="comment.starredByMe ? 'undo star' : 'give star'"
            @click="toggleStar(comment)">
          <font-awesome-icon icon="star" class="icon" :style="styleStar">
          </font-awesome-icon>
          {{ comment.starCount }}
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
          :key="child.id"
          @edit-comment="editComment"
          @delete-comment="deleteComment"
          @draft-reply="draftReply"
          @toggle-star="toggleStar"
          @toggle-reply-request="toggleReplyRequest">
      </thread-comment>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import { CommentAnonymity } from "../../models/enums.js"

  export default {
    name: 'thread-comment',
    props: ['comment', 'me'],
    data() {
      return {
        overflowMenu: false
      }
    },
    methods: {
      editComment: function(comment) {
        this.overflowMenu = false
        this.$emit('edit-comment', comment)
      },
      deleteComment: function(comment) {
        this.overflowMenu = false
        this.$emit('delete-comment', comment)
      },
      draftReply: function(comment) {
        this.$emit('draft-reply', comment)
      },
      toggleBookmark: function(comment) {
        comment.toggleBookmark()
      },
      toggleStar: function(comment) {
        comment.toggleStar()
      },
      toggleReplyRequest: function(comment) {
        comment.toggleReplyRequest()
      }
    },
    computed: {
      authorName: function() {
        if (
          this.comment.anonymity === CommentAnonymity.ANONYMOUS
          || this.comment.author === null
        ) {
          return 'Anonymous'
        }
        return this.comment.authorName
      },
      timeString: function() {
        return moment(this.comment.timestamp).fromNow()
      },
      commentEditable: function() {
        return (this.comment.author === this.me.id)
          && (this.comment.children.length === 0)
      },
      styleStar: function() {
        if (this.comment.starredByMe) return { color: '#70a0f0' }
      },
      styleQuestion: function() {
        if (this.comment.replyRequestedByMe) return { color: '#70a0f0' }
      }
    }
  }
</script>
