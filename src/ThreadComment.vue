<template>
  <div>
    <div class="thread-row">
      <div class="thread-row-header">
        <span><b>{{ authorName }}</b></span> <span>{{ timeString }}</span>
      </div>
      <div class="thread-row-body" v-html="comment.html"></div>
      <div class="thread-row-footer">
        <span
            class="tippy"
            data-tippy-content="reply"
            @click="draftReply(comment)">
          <i class="fas fa-reply"></i> {{ comment.countAllReplies() }}
        </span>
        &nbsp;·&nbsp;
        <span
            class="tippy"
            data-tippy-content="give star"
            @click="toggleStar(comment)">
          <i class="fas fa-star" :style="styleStar"></i>
          {{ comment.starCount }}
        </span>
        &nbsp;·&nbsp;
        <span
            class="tippy"
            data-tippy-content="request reply"
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
          :key="child.id"
          @draft-reply="draftReply"
          @toggle-star="toggleStar"
          @toggle-reply-request="toggleReplyRequest">
      </thread-comment>
    </div>
  </div>
</template>

<script>
  import tippy from 'tippy.js'
  var moment = require('moment') // TODO: ES6 import syntax?

  export default {
    name: 'thread-comment',
    props: ['comment'],
    methods: {
      draftReply: function(comment) {
        this.$emit('draft-reply', comment)
      },
      toggleStar: function(comment) {
        comment.toggleStar()
        // this.$emit('toggle-star', comment)
      },
      toggleReplyRequest: function(comment) {
        comment.toggleReplyRequest()
        // this.$emit('toggle-reply-request', comment)
      }
    },
    computed: {
      authorName: function() {
        console.log(this.comment)
        if (this.comment.anonymity === 'anonymous' || this.comment.author === null) { // TODO: enum?
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
    },
    mounted: function() {
      tippy('.tippy', {arrow: true})
    }
    //TODO: toggle tooltip contents
  }
</script>

<style scoped>
  /* TODO: lint */
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
  .thread-row-header > span:nth-child(2) {
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
