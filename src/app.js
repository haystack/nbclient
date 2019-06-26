import Vue from 'vue'
import VueQuill from 'vue-quill'
import VTooltip from 'v-tooltip'
Vue.use(VueQuill)
Vue.use(VTooltip)

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
library.add(fas, far)

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('font-awesome-icon', FontAwesomeIcon)

import { createNbRange, deserializeNbRange } from './models/nbrange.js'
import NbComment from './models/nbcomment.js'
import { isNodePartOf } from './utils/dom-util.js'


import NbHighlights from './components/highlights/NbHighlights.vue'
import NbSidebar from './components/NbSidebar.vue'
import NbLogin from './components/NbLogin.vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://nb-demo.herokuapp.com/';
// axios.defaults.baseURL = 'http://localhost:8080/'
axios.defaults.withCredentials = true;

// const HOST_ROOT_URL = 'https://nb-plugin.herokuapp.com'
const HOST_ROOT_URL = 'http://localhost:3000' // TODO: switch back

if (
  (document.attachEvent && document.readyState === "complete")
  || (!document.attachEvent && document.readyState !== "loading")
) {
  embedNbApp()
} else {
  document.addEventListener('DOMContentLoaded', embedNbApp)
}

function loadCSS(url, container = document.getElementsByTagName('HEAD')[0]) {
  let tag = document.createElement('link')
  tag.rel = 'stylesheet'
  tag.type = 'text/css'
  tag.href = url
  container.appendChild(tag)
}

function loadScript(url) {
  let tag = document.createElement('script')
  tag.src = url
  document.getElementsByTagName('HEAD')[0].appendChild(tag)
}

function embedNbApp() {
  loadCSS("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css")
  loadCSS("https://cdn.quilljs.com/1.3.6/quill.snow.css")
  loadCSS(`${HOST_ROOT_URL}/style/plugin.css`)
  loadCSS(`${HOST_ROOT_URL}/style/tooltip.css`)
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.js")

  // assuming sidebar is 350px wide + 2 * 10px padding + 5px margin
  document.documentElement.setAttribute('style', 'overflow: overlay !important;')
  document.body.setAttribute('style', 'position: initial !important; margin: 0 395px 0 0 !important;')

  let element = document.createElement('div')
  element.id = "nb-app-wrapper"
  // element.attachShadow({mode: 'open'})

  let child = document.createElement('div')
  child.id = "nb-app"
  // element.shadowRoot.appendChild(child)
  element.appendChild(child)

  // loadCSS("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css", element.shadowRoot)
  // loadCSS("https://cdn.quilljs.com/1.3.6/quill.snow.css", element.shadowRoot)
  // loadCSS("http://localhost:8081/src/style/plugin.css", element.shadowRoot)

  document.body.appendChild(element)

  let app = new Vue({
    // el: element.shadowRoot.querySelector('#nb-app'),
    el: '#nb-app',
    template: `
      <div id="nb-app" :style="style">
        <div v-if="!user" class="nb-sidebar">
          <nb-login @login="setUser"></nb-login>
        </div>
        <div v-else>
          <nb-highlights
            :key="resizeKey"
            :threads="filteredThreads"
            :thread-selected="threadSelected"
            :threads-hovered="threadsHovered"
            :draft-range="draftRange"
            :show-highlights="showHighlights"
            @select-thread="onSelectThread"
            @unselect-thread="onUnselectThread"
            @hover-thread="onHoverThread"
            @unhover-thread="onUnhoverThread">
          </nb-highlights>
          <nb-sidebar
            :user="user"
            :users="users"
            :hashtags="hashtags"
            :total-threads="totalThreads"
            :threads="filteredThreads"
            :thread-selected="threadSelected"
            :threads-hovered="threadsHovered"
            :draft-range="draftRange"
            :show-highlights="showHighlights"
            @toggle-highlights="onToggleHighlights"
            @search-option="onSearchOption"
            @search-text="onSearchText"
            @filter-bookmarks="onFilterBookmarks"
            @filter-hashtags="onFilterHashtags"
            @filter-user-tags="onFilterUserTags"
            @filter-comments="onFilterComments"
            @filter-reply-reqs="onFilterReplyReqs"
            @filter-upvotes="onFilterUpvotes"
            @min-words="onMinWords"
            @max-words="onMaxWords"
            @min-hashtags="onMinHashtags"
            @max-hashtags="onMaxHashtags"
            @min-replies="onMinReplies"
            @min-reply-reqs="onMinReplyReqs"
            @min-upvotes="onMinUpvotes"
            @select-thread="onSelectThread"
            @hover-thread="onHoverThread"
            @unhover-thread="onUnhoverThread"
            @delete-thread="onDeleteThread"
            @new-thread="onNewThread"
            @cancel-draft="onCancelDraft"
            @editor-empty="onEditorEmpty"
            @logout="onLogout">
          </nb-sidebar>
        </div>
      </div>
    `,
    data: {
      user: null,
      users: {},
      hashtags: {},
      threads: [],
      threadSelected: null,
      threadsHovered: [], //in case of hover on overlapping highlights
      draftRange: null,
      isEditorEmpty: true,
      filter: {
        searchOption: 'text',
        searchText: "",
        bookmarks: false,
        hashtags: [],
        userTags: [],
        comments: [],
        replyReqs: [],
        upvotes: [],
        minWords: 0,
        maxWords: null,
        minHashtags: 0,
        maxHashtags: null,
        minReplies: 0,
        minReplyReqs: 0,
        minUpvotes: 0,
      },
      showHighlights: true,
      resizeKey: Date.now() // work around to force redraw highlights
    },
    computed: {
      style: function() {
        return `height: ${document.body.clientHeight}px`
      },
      totalThreads: function() {
        return this.threads.length
      },
      filteredThreads: function() {
        let items = this.threads
        let searchText = this.filter.searchText
        if (searchText.length > 0) {
          if (this.filter.searchOption === 'text') {
            items = items.filter(item => item.hasText(searchText))
          }
          if (this.filter.searchOption === 'author') {
            items = items.filter(item => item.hasAuthor(searchText))
          }
        }
        if (this.filter.bookmarks) {
          items = items.filter(item => item.hasBookmarks())
        }
        let filterHashtags = this.filter.hashtags
        if (filterHashtags.length > 0) {
          items = items.filter(item => {
            for (let hashtag of filterHashtags) {
              if (item.hasHashtag(hashtag)) return true
            }
            return false
          })
        }
        let filterUserTags = this.filter.userTags
        if (filterUserTags.includes("me")) { // single option for now
          items = items.filter(item => item.hasUserTag(this.user.id))
        }
        let filterComments = this.filter.comments
        if (filterComments.length > 0) {
          items = items.filter(item => {
            if (
              filterComments.includes("instructor") && item.hasInstructorPost()
            ) {
              return true
            }
            if (
              filterComments.includes("me") && item.hasUserPost(this.user.id)
            ) {
              return true
            }
            return false
          })
        }
        let filterReplyReqs = this.filter.replyReqs
        if (filterReplyReqs.length > 0) {
          items = items.filter(item => {
            if (
              filterReplyReqs.includes("anyone") && item.hasReplyRequests()
            ) {
              return true
            }
            if (
              filterReplyReqs.includes("me") && item.hasMyReplyRequests()
            ) {
              return true
            }
            return false
          })
        }
        let filterUpvotes = this.filter.upvotes
        if (filterUpvotes.length > 0) {
          items = items.filter(item => {
            if (filterUpvotes.includes("anyone") && item.hasUpvotes()) {
              return true
            }
            if (filterUpvotes.includes("me") && item.hasMyUpvotes()) {
              return true
            }
            return false
          })
        }
        let minWords = this.filter.minWords
        if (minWords > 0) {
          items = items.filter(item => item.wordCount >= minWords)
        }
        let maxWords = this.filter.maxWords
        if (maxWords) {
          items = items.filter(item => item.wordCount <= maxWords)
        }
        let minHashtags = this.filter.minHashtags
        if (minHashtags > 0) {
          items = items.filter(item => item.hashtags.length >= minHashtags)
        }
        let maxHashtags = this.filter.maxHashtags
        if (maxHashtags) {
          items = items.filter(item => item.hashtags.length <= maxHashtags)
        }
        let minReplies = this.filter.minReplies
        if (minReplies > 0) {
          items = items.filter(item => item.countAllReplies() >= minReplies)
        }
        let minReplyReqs = this.filter.minReplyReqs
        if (minReplyReqs > 0) {
          items = items.filter(item => item.countAllReplyReqs() >= minReplyReqs)
        }
        let minUpvotes = this.filter.minUpvotes
        if (minUpvotes > 0) {
          items = items.filter(item => item.countAllUpvotes() >= minUpvotes)
        }
        return items
      }
    },
    watch: {
      user: function(val) {
        if (!val) return // logged out
        // TODO (backend): make sure information below gets returned only if user is enrolled in the course
        let source = window.location.origin + window.location.pathname
        axios.get('/api/annotations/allUsers',{params:{url: source}})
        .then(res => {
          this.users = res.data;
          this.$set(val, 'role', this.users[val.id].role)
        });
        axios.get('/api/annotations/allTagTypes',{params:{url: source}})
        .then(res => {
          this.hashtags = res.data;
        });
        axios.get('/api/annotations/annotation', {params:{url: source}})
        .then(res => {
          let items = res.data.filter(item => {
            try {
              item.range = deserializeNbRange(item.range)
              return true
            } catch(e) {
              console.warn(`Could not deserialize range for ${item.id}`)
              return false
            }
          })
          this.threads = items.map(item => new NbComment(item))
          let link = window.location.hash.match(/^#nb-comment-(.+$)/)
          if (link) {
            let id = link[1]
            this.threadSelected = this.threads.find(x => x.id === id)
          }
        })
      }
    },
    created: function(){
      axios.get('/api/users/current').then(res => {
        this.user = res.data;
      });
    },
    methods: {
      setUser: function(user) {
        this.user = user
      },
      draftThread: function(range) {
        if (this.user) { // only if selection was after user log in
          this.draftRange = createNbRange(range)
        }
      },
      onDeleteThread: function(thread) {
        if (this.threadSelected === thread) { this.threadSelected = null }
        let idx = this.threads.indexOf(thread)
        if (idx >= 0) { this.threads.splice(idx, 1) }
        if(thread.id){
          axios.delete(`/api/annotations/annotation/${thread.id}`);
        }
      },
      onNewThread: function(thread) {
        this.threads.push(thread)
        this.draftRange = null
      },
      onCancelDraft: function() {
        this.draftRange = null
      },
      onEditorEmpty: function(isEmpty) {
        this.isEditorEmpty = isEmpty
      },
      onSearchOption: function(option) {
        this.filter.searchOption = option
        this.onSearchUpdate()
      },
      onSearchText: function(text) {
        this.filter.searchText = text
        this.onSearchUpdate()
      },
      onSearchUpdate: function() {
        if (this.threadSelected && this.filter.searchText.length > 0) {
          if (
            this.filter.searchOption === 'text'
            && !this.threadSelected.hasText(this.filter.searchText)
          ) {
            this.threadSelected = null // reset selection if filtered
          }
          if (
            this.filter.searchOption === 'author'
            && !this.threadSelected.hasAuthor(this.filter.searchText)
          ) {
            this.threadSelected = null // reset selection if filtered
          }
        }
      },
      onFilterBookmarks: function(filter) {
        if (
          this.threadSelected
          && filter
          && !this.threadSelected.hasBookmarks()
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.bookmarks = filter
      },
      onFilterHashtags: function(hashtags) {
        if (this.threadSelected && hashtags.length > 0) {
          let filtered = true
          for (let hashtag of hashtags) {
            if (this.threadSelected.hasHashtag(hashtag)) {
              filtered = false
              break
            }
          }
          if (filtered) {
            this.threadSelected = null // reset selection if filtered
          }
        }
        this.filter.hashtags = hashtags
      },
      onFilterUserTags: function(filters) {
        if (
          this.threadSelected
          && filters.includes("me") // single option for now
          && !this.threadSelected.hasUserTag(this.user.id)
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.userTags = filters
      },
      onFilterComments: function(filters) {
        if (this.threadSelected && filters.length > 0) {
          let filtered = true
          if (
            filters.includes("instructor")
            && this.threadSelected.hasInstructorPost()
          ) {
            filtered = false
          }
          if (
            filters.includes("me")
            && this.threadSelected.hasUserPost(this.user.id)
          ) {
            filtered = false
          }
          if (filtered) {
            this.threadSelected = null // reset selection if filtered
          }
        }
        this.filter.comments = filters
      },
      onFilterReplyReqs: function(filters) {
        if (this.threadSelected && filters.length > 0) {
          let filtered = true
          if (
            filters.includes("anyone")
            && this.threadSelected.hasReplyRequests()
          ) {
            filtered = false
          }
          if (
            filters.includes("me")
            && this.threadSelected.hasMyReplyRequests()
          ) {
            filtered = false
          }
          if (filtered) {
            this.threadSelected = null // reset selection if filtered
          }
        }
        this.filter.replyReqs = filters
      },
      onFilterUpvotes: function(filters){
        if (this.threadSelected && filters.length > 0) {
          let filtered = true
          if (filters.includes("anyone") && this.threadSelected.hasUpvotes()) {
            filtered = false
          }
          if (filters.includes("me") && this.threadSelected.hasMyUpvotes()) {
            filtered = false
          }
          if (filtered) {
            this.threadSelected = null // reset selection if filtered
          }
        }
        this.filter.upvotes = filters
      },
      onMinWords: function(min) {
        if (this.threadSelected && this.threadSelected.wordCount < min) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.minWords = min
      },
      onMaxWords: function(max) {
        if (this.threadSelected && this.threadSelected.wordCount > max) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.maxWords = max
      },
      onMinHashtags: function(min) {
        if (this.threadSelected && this.threadSelected.hashtags.length < min) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.minHashtags = min
      },
      onMaxHashtags: function(max) {
        if (this.threadSelected && this.threadSelected.hashtags.length > max) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.maxHashtags = max
      },
      onMinReplies: function(min) {
        if (
          this.threadSelected
          && this.threadSelected.countAllReplies() < min
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.minReplies = min
      },
      onMinReplyReqs: function(min) {
        if (
          this.threadSelected
          && this.threadSelected.countAllReplyReqs() < min
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.minReplyReqs = min
      },
      onMinUpvotes: function(min) {
        if (
          this.threadSelected
          && this.threadSelected.countAllUpvotes() < min
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.minUpvotes = min
      },
      onSelectThread: function(thread) {
        this.threadSelected = thread
        thread.markSeenAll()
      },
      onUnselectThread: function(thread) {
        this.threadSelected = null
        if (this.draftRange && this.isEditorEmpty) {
          this.onCancelDraft()
        }
      },
      onHoverThread: function(thread) {
        if (!this.threadsHovered.includes(thread)) {
          this.threadsHovered.push(thread)
        }
      },
      onUnhoverThread: function(thread) {
        let idx = this.threadsHovered.indexOf(thread)
        if (idx >= 0) this.threadsHovered.splice(idx, 1)
      },
      onToggleHighlights: function(show) {
        this.showHighlights = show
      },
      handleResize: function() {
        this.resizeKey = Date.now()
      },
      onLogout: function() {
        axios.post("/api/users/logout").then(()=>{
          this.user = null
          this.users = {}
          this.hashtags = {}
          this.threads = []
          this.threadSelected = null
          this.threadsHovered = []
          this.draftRange = null
          this.isEditorEmpty = true
          this.filter = {
            searchOption: 'text',
            searchText: "",
            bookmarks: false,
            hashtags: [],
            userTags: [],
            comments: [],
            replyReqs: [],
            upvotes: [],
            minWords: 0,
            maxWords: null,
            minHashtags: 0,
            maxHashtags: null,
            minReplies: 0,
            minReplyReqs: 0,
            minUpvotes: 0,
          }
          this.showHighlights = true
        })
      }
    },
    components: {
      NbHighlights,
      NbSidebar,
      NbLogin
    }
  })

  document.body.addEventListener("mouseup", function() {
    let selection = window.getSelection()
    if (selection.isCollapsed) { return }

    let sidebar = document.querySelector('#nb-app-wrapper')
    let range = selection.getRangeAt(0)
    if ( // check selection does not overlap sidebar
      !isNodePartOf(range.startContainer, sidebar)
      && !isNodePartOf(range.endContainer, sidebar)
    ) {
      app.draftThread(range)
      // Selection will be removed in highlight-util.eventsProxyMouse
      // because 'click' is triggered after 'mouseup'
    }
  })

  document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      app.onUnselectThread()
    }
  })

  window.addEventListener("resize", function() {
    app.handleResize()
  })
}
