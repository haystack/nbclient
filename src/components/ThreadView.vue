<template>
  <div class="thread-view">
    <div class="thread-header">
      {{ thread.countAllReplies() + 1 }} comments
      &nbsp;·&nbsp;
      {{ thread.countAllReplyRequests() }} reply requests
    </div>
    <thread-comment :comment="thread" @draft-reply="draftReply">
    </thread-comment>
  </div>
</template>

<script>
  import ThreadComment from './ThreadComment.vue'

  export default {
    name: 'thread-view',
    props: ['thread'],
    methods: {
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
    padding: 10px 0;
    color: #444;
    border-bottom: 1px solid #666;
  }
</style>
