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
      <button @click="toggleFilters" :style="toggleFiltersStyle">
        {{ toggleFiltersLabel }}
      </button>
    </div>
    <div class="filter-options" v-show="filterVisible">
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
      <h1>Comments and Replies</h1>
      <div class="comments-replies">
        <div>
          <input
              type="checkbox"
              id="instructor-comments"
              value="instructor"
              v-model="filterComments"
              @change="onFilterChange('comments')">
          <label for="instructor-comments">
            by instructors
          </label>
        </div>
        <div>
          <input
              type="checkbox"
              id="my-comments"
              value="me"
              v-model="filterComments"
              @change="onFilterChange('comments')">
          <label for="my-comments">
            by me
          </label>
        </div>
      </div>
      <h1>Reply Requests</h1>
      <div class="reply-requests">
        <div>
          <input
              type="checkbox"
              id="anyone-reply-reqs"
              value="anyone"
              v-model="filterReplyReqs"
              @change="onFilterChange('reply-reqs')">
          <label for="anyone-reply-reqs">
            by anyone
          </label>
        </div>
        <div>
          <input
              type="checkbox"
              id="my-reply-reqs"
              value="me"
              v-model="filterReplyReqs"
              @change="onFilterChange('reply-reqs')">
          <label for="my-reply-reqs">
            by me
          </label>
        </div>
      </div>
      <h1>Stars</h1>
      <div class="stars">
        <div>
          <input
              type="checkbox"
              id="anyone-stars"
              value="anyone"
              v-model="filterStars"
              @change="onFilterChange('stars')">
          <label for="anyone-stars">
            by anyone
          </label>
        </div>
        <div>
          <input
              type="checkbox"
              id="my-stars"
              value="me"
              v-model="filterStars"
              @change="onFilterChange('stars')">
          <label for="my-stars">
            by me
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
        filterVisible: false,
        filterHashtags: [],
        filterComments: [],
        filterReplyReqs: [],
        filterStars: []
      }
    },
    computed: {
      toggleFiltersStyle: function() {
        if (this.filterVisible) {
          return "background-color: #888; color: #fff;"
        }
      },
      toggleFiltersLabel: function() {
        return this.filterVisible ? "Close filters" : "More filters"
      }
    },
    methods: {
      onTextChange: function(text) {
        this.$emit('search-text', text)
      },
      toggleFilters: function(event) {
        this.filterVisible = !this.filterVisible
      },
      onFilterChange: function(type) {
        switch (type) {
          case 'hashtags':
            this.$emit('filter-hashtags', this.filterHashtags)
            break
          case 'comments':
            this.$emit('filter-comments', this.filterComments)
            break
          case 'reply-reqs':
            this.$emit('filter-reply-reqs', this.filterReplyReqs)
            break
          case 'stars':
            this.$emit('filter-stars', this.filterStars)
            break
          default:
            return
        }
      }
    },
    components: {
      SearchBar
    }
  }
</script>

<style scoped>
  .filter-view {
    margin: 10px 0;
  }
  .filter-header .search-bar {
    width: 270px;
    display: inline-block;
    vertical-align: middle;
  }
  .filter-header button {
    font-size: 13px;
    width: 94px;
    padding: 8px;
    border-radius: 5px;
    border-color: #aaa;
    color: #666;
    cursor: pointer;
  }
  .filter-header button:focus {
    outline: none;
  }
  .filter-options {
    padding: 10px;
  }
  .filter-options > h1 {
    font-size: 14px;
  }
  .filter-options .hashtags > div,
  .filter-options .comments-replies > div,
  .filter-options .reply-requests > div,
  .filter-options .stars > div {
    width: 49%;
    display: inline-block;
  }
  /deep/ .ql-container {
    border-color: #aaa !important;
    border-radius: 5px;
  }
  /deep/ .ql-blank,
  /deep/ .ql-editor {
    padding: 7px 9px;
  }
</style>
