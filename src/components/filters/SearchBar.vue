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

/**
 * Component for the search bar on the side bar.
 * Also see {@link NbUser} and {@link NbHashtag}.
 *
 * @vue-prop {Array<NbUser>} users - all users enrolled in this course
 * @vue-prop {Array<NbHashtag>} hashtags - suggested hashtags in this course
 *
 * @vue-data {String} searchBy - search bar type: 'text' (comment contents) or
 *   'author'
 * @vue-data {String} placeholder - search bar placeholder text
 *
 * @vue-event {String} dropdown-change - Emit the new 'searchBy' value on change
 * @vue-event {String} text-change - Emit the new search query text on change.
 *   Search query text is treated as plaintext
 */
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
