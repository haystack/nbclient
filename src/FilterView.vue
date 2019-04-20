<template>
  <div class="filter-view">
    <div class="filter-header">
      <div class="search-bar">
        <search-bar
            :users="users"
            :hashtags="hashtags"
            @text-change="onTextChange">
        </search-bar>
      </div>
      <button>More filters</button>
    </div>
    <div class="filter-options">
      <h1>Hashtags</h1>
      <div class="hashtags">
        <div v-for="hashtag in hashtags">
          <input
              v-model="filterHashtags"
              type="checkbox"
              :id="'filter-hashtag-' + hashtag.id"
              :value="hashtag.id"
              @change="onFilterChange('hashtags')">
          <label :for="'filter-hashtag-' + hashtag.id">
            {{ hashtag.value }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import SearchBar from './SearchBar.vue'

  export default {
    name: 'filter-view',
    props: {
      users: Array,
      hashtags: Array
    },
    data() {
      return {
        filterHashtags: []
      }
    },
    methods: {
      onTextChange(text) {
        this.$emit('search-text', text)
      },
      onFilterChange(type) {
        if (type === 'hashtags') { // in case we add different kinds of filters
          this.$emit('filter-hashtags', this.filterHashtags)
        }
      },
    },
    components: {
      SearchBar
    }
  }
</script>

<style scoped>
  /* TODO: clean up styling */
  .filter-header .search-bar {
    width: 75%;
    display: inline-block;
    vertical-align: middle;
    border-radius: 5px;
  }
  .filter-header button {
    font-size: 13px;
    padding: 6px 9px;
    border-radius: 5px;
    cursor: pointer;
  }
  .filter-options {
    padding: 10px;
  }
  .filter-options > h1 {
    font-size: 14px;
  }
  .filter-options .hashtags > div {
    width: 50%;
    display: inline-block;
  }
  /deep/ .ql-blank,
  /deep/ .ql-editor {
    padding: 6px 9px;
  }
</style>
