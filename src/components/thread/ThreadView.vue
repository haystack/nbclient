<template>
  <div class="thread-view">
    <div class="thread-header">
      {{ thread.countAllReplies() + 1 }} comments
      &nbsp;·&nbsp;
      {{ thread.countAllReplyRequests() }} reply requests
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

<style scoped>
  .thread-view {
    height: 40vh;
    overflow-y: scroll;
  }
  .thread-header {
    padding: 0 0 10px 0;
    color: #444;
    border-bottom: 1px solid #666;
  }
</style>
