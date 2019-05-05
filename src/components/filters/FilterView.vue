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
      <button
          class="toggle-filters"
          :style="toggleFiltersStyle"
          @click="toggleFilters">
        {{ toggleFiltersLabel }}
      </button>
      <span
          class="filter-bookmarks"
          v-tooltip="filterBookmarks ? 'clear filter' : 'show bookmarked'"
          @click="toggleFilterBookmarks">
        <font-awesome-icon v-if="filterBookmarks"
            :icon="['fas', 'bookmark']" class="icon fas">
        </font-awesome-icon>
        <font-awesome-icon v-else :icon="['far', 'bookmark']" class="icon far">
        </font-awesome-icon>
      </span>
    </div>
    <div class="filter-options" v-show="filterVisible">
      <div class="title">Hashtags</div>
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
      <div class="title">Comments and Replies</div>
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
      <div class="title">Reply Requests</div>
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
      <div class="title">Stars</div>
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
        filterBookmarks: false,
        filterHashtags: [],
        filterComments: [],
        filterReplyReqs: [],
        filterStars: []
      }
    },
    computed: {
      toggleFiltersStyle: function() {
        if (this.filterVisible) {
          return "background-color: #666; color: #fff;"
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
      toggleFilterBookmarks: function() {
        this.filterBookmarks = !this.filterBookmarks
        this.$emit('filter-bookmarks', this.filterBookmarks)
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
