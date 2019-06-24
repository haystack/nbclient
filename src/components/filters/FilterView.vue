<template>
  <div class="filter-view">
    <div class="filter-header">
      <search-bar
          :users="users"
          :hashtags="hashtags"
          @dropdown-change="onSearchOptionChange"
          @text-change="onTextChange">
      </search-bar>
      <v-popover
          class="overflow-menu"
          popoverClass="filter-options-wrapper"
          container="#nb-app-wrapper"
          :open="filterVisible"
          @hide="onFilterHide">
        <button
            class="tooltip-target toggle-filters"
            :style="toggleFiltersStyle"
            @click="toggleFilters">
          {{ toggleFiltersLabel }}
        </button>
        <template slot="popover">
          <div class="filter-options">
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
            <div class="title">Users tagged</div>
            <div class="user-tags">
              <div>
                <input
                    type="checkbox"
                    id="me-tagged"
                    value="me"
                    v-model="filterUserTags"
                    @change="onFilterChange('user-tags')">
                <label for="me-tagged">
                  me
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
                  instructors
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
                  me
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
                  anyone
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
                  me
                </label>
              </div>
            </div>
            <div class="title">Upvotes</div>
            <div class="stars">
              <div>
                <input
                    type="checkbox"
                    id="anyone-stars"
                    value="anyone"
                    v-model="filterStars"
                    @change="onFilterChange('stars')">
                <label for="anyone-stars">
                  anyone
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
                  me
                </label>
              </div>
            </div>
            <div v-if="showAdvanced" class="title">Advanced</div>
            <div v-if="showAdvanced" class="advanced">
              <div>
                <label for="min-words">
                  Min. # of words
                </label>
                <input
                    type="number"
                    id="min-words"
                    placeholder="0"
                    min="0"
                    v-model="minWords"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('min-words')">
              </div>
              <div>
                <label for="max-words">
                  Max. # of words
                </label>
                <input
                    type="number"
                    id="max-words"
                    placeholder="n/a"
                    min="0"
                    v-model="maxWords"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('max-words')">
              </div>
              <div>
                <label for="min-hashtags">
                  Min. # of hashtags
                </label>
                <input
                    type="number"
                    id="min-hashtags"
                    placeholder="0"
                    min="0"
                    v-model="minHashtags"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('min-hashtags')">
              </div>
              <div>
                <label for="max-hashtags">
                  Max. # of hashtags
                </label>
                <input
                    type="number"
                    id="max-hashtags"
                    placeholder="n/a"
                    min="0"
                    v-model="maxHashtags"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('max-hashtags')">
              </div>
              <div>
                <label for="min-replies">
                  Min. # of replies
                </label>
                <input
                    type="number"
                    id="min-replies"
                    placeholder="0"
                    min="0"
                    v-model="minReplies"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('min-replies')">
              </div>
              <div>
                <label for="min-rep-reqs">
                  Min. # of reply requests
                </label>
                <input
                    type="number"
                    id="min-reply-reqs"
                    placeholder="0"
                    min="0"
                    v-model="minReplyReqs"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('min-reply-reqs')">
              </div>
              <div>
                <label for="min-upvotes">
                  Min. # of upvotes
                </label>
                <input
                    type="number"
                    id="min-upvotes"
                    placeholder="0"
                    min="0"
                    v-model="minUpvotes"
                    @keypress="event => validateNumber(event)"
                    @change="onFilterChange('min-upvotes')">
              </div>
            </div>
          </div>
        </template>
      </v-popover>
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
  </div>
</template>

<script>
  import SearchBar from './SearchBar.vue'

  export default {
    name: 'filter-view',
    props: {
      me: Object,
      users: Array,
      hashtags: Array
    },
    data() {
      return {
        filterVisible: false,
        filterBookmarks: false,
        filterHashtags: [],
        filterUserTags: [],
        filterComments: [],
        filterReplyReqs: [],
        filterStars: [],
        minWords: null,
        maxWords: null,
        minHashtags: null,
        maxHashtags: null,
        minReplies: null,
        minReplyReqs: null,
        minUpvotes: null,
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
      },
      showAdvanced: function() {
        return this.me.role === 'instructor'
      },
    },
    methods: {
      onSearchOptionChange: function(option) {
        this.$emit('search-option', option)
      },
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
      onFilterHide: function() {
        this.filterVisible = false
      },
      onFilterChange: function(type) {
        switch (type) {
          case 'hashtags':
            this.$emit('filter-hashtags', this.filterHashtags)
            break
          case 'user-tags':
            this.$emit('filter-user-tags', this.filterUserTags)
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
          case 'min-words':
            if (this.minWords) {
              this.$emit('min-words', parseInt(this.minWords))
            } else {
              this.$emit('min-words', 0)
            }
            break
          case 'max-words':
            if (this.maxWords) {
              this.$emit('max-words', parseInt(this.maxWords))
            } else {
              this.$emit('max-words', null)
            }
            break
          case 'min-hashtags':
            if (this.minHashtags) {
              this.$emit('min-hashtags', parseInt(this.minHashtags))
            } else {
              this.$emit('min-hashtags', 0)
            }
            break
          case 'max-hashtags':
            if (this.maxHashtags) {
              this.$emit('max-hashtags', parseInt(this.maxHashtags))
            } else {
              this.$emit('max-hashtags', null)
            }
            break
          case 'min-replies':
            if (this.minReplies) {
              this.$emit('min-replies', parseInt(this.minReplies))
            } else {
              this.$emit('min-replies', 0)
            }
            break
          case 'min-reply-reqs':
            if (this.minReplyReqs) {
              this.$emit('min-reply-reqs', parseInt(this.minReplyReqs))
            } else {
              this.$emit('min-reply-reqs', 0)
            }
            break
          case 'min-upvotes':
            if (this.minUpvotes) {
              this.$emit('min-upvotes', parseInt(this.minUpvotes))
            } else {
              this.$emit('min-upvotes', 0)
            }
            break
          default:
            return
        }
      },
      validateNumber(event) {
        let keyCode = event.which ? event.which : event.keyCode
        if (keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
          event.preventDefault()
        }
        return true
      },
    },
    components: {
      SearchBar
    }
  }
</script>
