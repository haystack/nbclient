import Vue from 'vue'
import VueQuill from 'vue-quill'
import VTooltip from 'v-tooltip'
Vue.use(VueQuill)
Vue.use(VTooltip)

import { createNbRange, deserializeNbRange } from './models/nbrange.js'
import NbComment from './models/nbcomment.js'
import { isNodePartOf } from './utils/dom-util.js'


import NbHighlights from './components/NbHighlights.vue'
import NbSidebar from './components/NbSidebar.vue'
import Login from './Login.vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;


if (
  (document.attachEvent && document.readyState === "complete")
  || (!document.attachEvent && document.readyState !== "loading")
) {
  embedNbApp()
} else {
  document.addEventListener('DOMContentLoaded', embedNbApp)
}

function loadCSS(url) {
  let tag = document.createElement('link')
  tag.rel = 'stylesheet'
  tag.type = 'text/css'
  tag.href = url
  document.getElementsByTagName('HEAD')[0].appendChild(tag)
}

function loadScript(url) {
  let tag = document.createElement('script')
  tag.src = url
  document.getElementsByTagName('HEAD')[0].appendChild(tag)
}

function embedNbApp() {
  loadCSS("https://use.fontawesome.com/releases/v5.8.1/css/all.css")
  loadCSS("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css")
  loadCSS("https://cdn.quilljs.com/1.3.6/quill.snow.css")

  loadScript("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.js")

  // assuming sidebar is 350px wide + 2 * 10px padding + 5px margin
  document.body.style.margin= '0 395px 0 0'

  let element = document.createElement('div')
  element.id = "nb-app"
  document.body.appendChild(element)

  let app = new Vue({
    el: '#nb-app',
    template: `
      <div id="nb-app" :style="style">
        <login @login="setUser" v-if="!user"/>
        <div v-else>
          <nb-highlights
            :key="resizeKey"
            :threads="filteredThreads"
            :thread-selected="threadSelected"
            :threads-hovered="threadsHovered"
            :draft-range="draftRange"
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
            @search-text="onSearchText"
            @filter-hashtags="onFilterHashtags"
            @filter-comments="onFilterComments"
            @filter-reply-reqs="onFilterReplyReqs"
            @filter-stars="onFilterStars"
            @select-thread="onSelectThread"
            @hover-thread="onHoverThread"
            @unhover-thread="onUnhoverThread"
            @delete-thread="onDeleteThread"
            @new-thread="onNewThread"
            @cancel-draft="onCancelDraft">
          </nb-sidebar>
        </div>
      </div>
    `,
    data: {
      user: null,
      source: null,
      users: {},
      hashtags: {},
      threads: [],
      threadSelected: null,
      threadsHovered: [], //in case of hover on overlapping highlights
      draftRange: null,
      filter: {
        searchText: "",
        hashtags: [],
        comments: [],
        replyReqs: [],
        stars: []
      },
      resizeKey: Date.now() // work around to force redraw highlights
    },
    computed: {
      style: function() {
        return 'position: absolute; top: 0; right: 0;'
            + `height: ${document.body.clientHeight}px`
      },
      totalThreads: function() {
        return this.threads.length
      },
      filteredThreads: function() {
        let items = this.threads
        let searchText = this.filter.searchText
        if (searchText !== "") {
          items = items.filter(item => item.hasText(searchText))
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
        let filterStars = this.filter.stars
        if (filterStars.length > 0) {
          items = items.filter(item => {
            if (filterStars.includes("anyone") && item.hasStars()) {
              return true
            }
            if (filterStars.includes("me") && item.hasMyStars()) {
              return true
            }
            return false
          })
        }
        return items
      }
    },
    created: function(){
      axios.get('/api/users/current').then(res => {
        this.user = res.data;
      });
      axios.get('/api/annotations/allUsers',{params:{url: window.location.href.split('?')[0]}})
      .then(res => {
        this.users = res.data;
      });
      axios.get('/api/annotations/allTagTypes',{params:{url: window.location.href.split('?')[0]}})
      .then(res => {
        this.hashtags = res.data;
      });
      axios.get('/api/annotations/annotation', {params:{url: window.location.href.split('?')[0]}})
      .then(res => {
        this.threads = res.data.map(annotation => {
          annotation.range = deserializeNbRange(annotation.range);
          return new NbComment(
            annotation.id,
            annotation.range,
            annotation.parent,
            annotation.timestamp,
            annotation.author,
            annotation.authorName,
            annotation.html,
            annotation.hashtags,
            annotation.people,
            annotation.visibility,
            annotation.anonymity,
            annotation.replyRequestedByMe,
            annotation.replyRequestCount,
            annotation.starredByMe,
            annotation.starCount,
            annotation.seenByMe
          );
        });
      })
    },
    methods: {
      setUser: function(user) {
        this.user = user
      },
      draftThread: function(range) {
        this.draftRange = createNbRange(range)
      },
      onDeleteThread: function(thread) {
        if (this.threadSelected === thread) { this.threadSelected = null }
        let idx = this.threads.indexOf(thread)
        if (idx >= 0) { this.threads.splice(idx, 1) }
        // TODO: update database
      },
      onNewThread: function(thread) {
        this.threads.push(thread)
        this.draftRange = null
      },
      onCancelDraft: function() {
        this.draftRange = null
      },
      onSearchText: function(text) {
        if (
          this.threadSelected
          && text !== ""
          && !this.threadSelected.hasText(text)
        ) {
          this.threadSelected = null // reset selection if filtered
        }
        this.filter.searchText = text
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
      onFilterStars: function(filters){
        if (this.threadSelected && filters.length > 0) {
          let filtered = true
          if (filters.includes("anyone") && this.threadSelected.hasStars()) {
            filtered = false
          }
          if (filters.includes("me") && this.threadSelected.hasMyStars()) {
            filtered = false
          }
          if (filtered) {
            this.threadSelected = null // reset selection if filtered
          }
        }
        this.filter.stars = filters
      },
      onSelectThread: function(thread) {
        this.threadSelected = thread
        thread.markSeenAll()
      },
      onUnselectThread: function(thread) {
        this.threadSelected = null
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
      handleResize: function() {
        this.resizeKey = Date.now()
      }
    },
    mounted: function() {
      document.body.addEventListener("click", function() {
        let selection = window.getSelection()
        if (selection.isCollapsed) { return }

        let sidebar = document.querySelector('#nb-app')
        let range = selection.getRangeAt(0)
        if ( // check selection does not overlap sidebar
          !isNodePartOf(range.startContainer, sidebar)
          && !isNodePartOf(range.endContainer, sidebar)
        ) {
          app.draftThread(range)
          selection.removeAllRanges()
        }
      })

      window.addEventListener("resize", function() {
        app.handleResize()
      })
    },
    components: {
      NbHighlights,
      NbSidebar,
      Login
    }
  })

  // app.threads = Object.assign({}, app.threads, threadsRestored)
  // to serialize NBRange: sr = range.serialize()
  // to deserialize: dsr = deserializeNbRange(sr)
}
