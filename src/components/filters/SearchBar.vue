<template>
  <div class="search">
    <div class="dropdown">
      <select v-model="searchBy">
        <option value="text">Text</option>
        <option value="author">Author</option>
      </select>
      <font-awesome-icon icon="caret-down"></font-awesome-icon>
    </div>
    <div class="text">
      <text-editor
          :placeholder="placeholder"
          :users="users"
          :hashtags="hashtags"
          @text-change="onTextChange">
      </text-editor>
    </div>
  </div>
</template>

<script>
import TextEditor from '../editor/TextEditor.vue'
import htmlToText from 'html-to-text'

export default {
  name: 'search-bar',
  props: {
    users: Array,
    hashtags: Array
  },
  data () {
    return {
      searchBy: 'text',
      placeholder: 'Search for comments'
    }
  },
  watch: {
    searchBy: function (val) {
      this.$emit('dropdown-change', val)
    }
  },
  methods: {
    onTextChange: function (html) {
      let text = htmlToText.fromString(html, { wordwrap: false })
      this.$emit('text-change', text)
    }
  },
  components: {
    TextEditor
  }
}
</script>
