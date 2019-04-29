<template>
  <div>
    <div class="thread-row">
      <div class="thread-row-header">
        <span class="author">
          <i v-if="comment.instructor" class="fas fa-info icon"
              :style="iconStyle">
          </i>
          <b>{{ authorName }}</b>{{ comment.author === me.id ? " (me)" : "" }}
        </span>
        <span class="timestamp">{{ timeString }}</span>
        <div class="options">
          <span
              class="bookmark"
              v-tooltip="comment.bookmarked ? 'undo save' : 'save'"
              @click="toggleBookmark(comment)">
            <i v-if="comment.bookmarked" class="fas fa-bookmark"
                style="color: #70a0f0">
            </i>
            <i v-else class="far fa-bookmark" style="color: #444"></i>
          </span>
          <v-popover class="overflow-menu" :disabled="!overflowMenu">
            <span
                v-if="commentEditable"
                class="tooltip-target"
                style="color: #444"
                @click="overflowMenu = true">
              ···
            </span>
            <template slot="popover">
              <div
                  class="overflow-btn nb-comment-tooltip"
                  @click="editComment(comment)">
                Edit
              </div>
              <div
                  class="overflow-btn nb-comment-tooltip"
                  @click="deleteComment(comment)">
                Delete
              </div>
            </template>
          </v-popover>
        </div>
      </div>
      <div class="thread-row-body" v-html="comment.html"></div>
      <div class="thread-row-footer">
        <span
            v-tooltip="'reply'"
            @click="draftReply(comment)">
          <i class="fas fa-reply"></i> {{ comment.countAllReplies() }}
        </span>
        &nbsp;·&nbsp;
        <span
            v-tooltip="comment.starredByMe ? 'undo star' : 'give star'"
            @click="toggleStar(comment)">
          <i class="fas fa-star" :style="styleStar"></i>
          {{ comment.starCount }}
        </span>
        &nbsp;·&nbsp;
        <span
            v-tooltip="comment.replyRequestedByMe ? 'undo request' : 'request reply'"
            @click="toggleReplyRequest(comment)">
          <i class="fas fa-question" :style="styleQuestion"></i>
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
  import { CommentAnonymity } from "../models/enums.js"

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
        if (this.comment.starredByMe) return 'color: #70a0f0'
      },
      styleQuestion: function() {
        if (this.comment.replyRequestedByMe) return 'color: #70a0f0'
      }
    }
  }
</script>

<style scoped>
  .thread-row {
    padding: 10px 0 10px 10px;
  }
  .thread-row:hover {
    background-color: #f0f0f0;
  }
  .thread-block {
    border-left: 1px solid #ddd;
    margin-left: 20px;
  }
  .thread-row-header {
    position: relative;
    margin-bottom: 5px;
  }
  .thread-row-header .author .icon {
    width: 16px;
    padding: 3px 0;
    color: #fff;
    background: #444;
    font-size: 11px;
    text-align: center;
    border-radius: 3px;
    vertical-align: top;
  }
  .thread-row-header .timestamp {
    font-size: 14px;
    color: #444;
  }
  .thread-row-header .options {
    position: absolute;
    right: 0;
    top: 0;
  }
  .thread-row-header .options .bookmark {
    cursor: pointer;
  }
  .thread-row-header .options .bookmark:hover {
    color: #70a0f0;
  }
  .overflow-menu {
    margin-left: 5px;
    display: inline-block;
    cursor: pointer;
  }
  .overflow-btn {
    padding: 8px 12px;
    cursor: pointer;
  }
  .overflow-btn:hover {
    background-color: #444;
  }
  .thread-row-body > p {
    margin: 0;
  }
  .thread-row-footer {
    text-align: right;
    font-size: 14px;
    color: #444;
    margin-top: 8px;
  }
  .thread-row-footer > span {
    cursor: pointer;
  }
  .thread-row-footer > span:hover {
    color: #70a0f0;
  }
  .thread-row-footer > span:focus {
    outline: none;
  }
</style>
<style src="./style/tooltip.css"></style>
