<template>
  <div class="thread-view">
    <div class="thread-header">
      {{ numComments }}
      &nbsp;·&nbsp;
      {{ numReplyReqs }}
    </div>
    <thread-comment
        :comment="thread"
        :me="me"
        @edit-comment="editComment"
        @delete-comment="deleteComment"
        @draft-reply="draftReply">
    </thread-comment>
  </div>
</template>

<script>
  import ThreadComment from './ThreadComment.vue'

  export default {
    name: 'thread-view',
    props: ['thread', 'me'],
    computed: {
      numComments: function() {
        let count = this.thread.countAllReplies() + 1
        if (count === 1) {
          return "1 comment"
        } else {
          return `${count} comments`
        }
      },
      numReplyReqs: function() {
        let count = this.thread.countAllReplyRequests()
        if (count === 0) {
          return "no reply requests"
        } else if (count === 1) {
          return "1 reply request"
        } else {
          return `${count} reply requests`
        }
      }
    },
    methods: {
      editComment: function(comment) {
        this.$emit('edit-comment', comment)
      },
      deleteComment: function(comment) {
        this.$emit('delete-comment', comment)
      },
      draftReply: function(comment) {
        this.$emit('draft-reply', comment)
      }
    },
    components: {
      ThreadComment
    }
  }
</script>
