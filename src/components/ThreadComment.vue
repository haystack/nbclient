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
    methods: {
      draftReply: function(comment) {
        this.$emit('draft-reply', comment)
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
      styleStar: function() {
        if (this.comment.starredByMe) return 'color: #1B95E0'
      },
      styleQuestion: function() {
        if (this.comment.replyRequestedByMe) return 'color: #1B95E0'
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
    color: #1B95E0;
  }
  .thread-row-footer > span:focus {
    outline: none;
  }
</style>
<style src="./style/tooltip.css"></style>
