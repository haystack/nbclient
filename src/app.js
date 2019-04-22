// TODO: Follow the JS doc style
import Vue from 'vue'
import VueQuill from 'vue-quill'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import NbHighlights from './NbHighlights.vue'
import NbSidebar from './NbSidebar.vue'

if (
  (document.attachEvent && document.readyState === "complete")
  || (!document.attachEvent && document.readyState !== "loading")
) {
  embedNbApp()
} else {
  document.addEventListener('DOMContentLoaded', embedNbApp)
}

function embedNbApp() {
  let meta = document.createElement('meta')
  meta.setAttribute('charset', 'utf-8')
  document.getElementsByTagName('HEAD')[0].appendChild(meta)

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

  loadCSS("https://use.fontawesome.com/releases/v5.8.1/css/all.css")
  loadCSS("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css")
  loadCSS("https://cdn.quilljs.com/1.3.6/quill.snow.css")

  loadScript("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.js")

  let selecting = false

  let element = document.createElement('div')
  element.id = "nb-app"
  document.body.appendChild(element)
  document.body.style.margin= '0 375px 0 0'

  document.addEventListener("mouseup", function(){
    function isNodeSidebar(node) {
      while (node) {
        if (node.id === "nb-sidebar") return true
        node = node.parentNode
      }
      return false
    }

    let selection = window.getSelection()
    if (selection.isCollapsed) return

    // Set global state to reflect the fact we're making a selection.
    // Used to stop click events from showing contents of older highlights
    // when the click event is the result of a selection.
    selecting = true
    // TODO: the whole selcting logic seems a bit off

    let range = selection.getRangeAt(0)
    if ( // check selection does not overlap sidebar
      !isNodeSidebar(range.startContainer)
      && !isNodeSidebar(range.endContainer)
    ) {
      app.draftThread(range)
      selection.removeAllRanges()
    }
  })

  window.addEventListener("resize", function() {
    // TODO: rerender highlights on width
  })

  Vue.use(VueQuill)

  let app = new Vue({
    el: '#nb-app',
    template: `
      <div id="nb-app" :style="style">
        <nb-highlights
            :threads="filteredThreads"
            :thread-selected="threadSelected"
            :draft-range="draftRange"
            @select-thread="onSelectThread">
        </nb-highlights>
        <nb-sidebar
            :users="users"
            :hashtags="hashtags"
            :total-threads="totalThreads"
            :threads="filteredThreads"
            :thread-selected="threadSelected"
            :draft-range="draftRange"
            @search-text="onSearchText"
            @filter-hashtags="onFilterHashtags"
            @select-thread="onSelectThread"
            @new-thread="onNewThread"
            @cancel-draft="onCancelDraft">
        </nb-sidebar>
      </div>
    `,
    data: {
      users: {},
      hashtags: {},
      threads: {},
      threadSelected: null, // TODO: Reset when you click on document outside of highlights?
      draftRange: null,
      filter: {
        searchText: "",
        hashtags: []
      }
    },
    computed: {
      style: function() { // TODO: put it in template?
        return `position: absolute; top: 0; right: 0; height: ${document.body.clientHeight}px`
      },
      totalThreads: function() {
        return Object.keys(this.threads).length
      },
      filteredThreads: function() {
        let items = Object.values(this.threads)
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
        return items
      }
    },
    methods: {
      draftThread: function(range) {
        this.draftRange = createNbRange(range)
      },
      onNewThread: function(thread) {
        this.$set(this.threads, thread.id, thread)
        this.draftRange = null
        selecting = false
      },
      onCancelDraft: function() {
        this.draftRange = null
        selecting = false
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
      onSelectThread: function(thread) {
        this.threadSelected = thread
      }
    },
    components: {
      NbHighlights,
      NbSidebar
    }
  })

  app.users = {
    '1': {
      id: '1',
      name: {
        first: 'Alisa',
        last: 'Ono'
      },
      role: 'student'
    },
    '2': {
      id: '2',
      name: {
        first: 'Adrian',
        last: 'Sy'
      },
      role: 'student'
    }
  }

  app.hashtags = {
    '1': {
      id: '1',
      value: "curious",
      emoji: "1F914"
    },
    '2': {
      id: '2',
      value: "confused",
      emoji: "1F616"
    },
    '3': {
      id: '3',
      value: "useful",
      emoji: "1F600"
    },
    '4': {
      id: '4',
      value: "interested",
      emoji: "1F9D0"
    },
    '5': {
      id: '5',
      value: "frustrated",
      emoji: "1F621"
    },
    '6': {
      id: '6',
      value: "help",
      emoji: "1F61F"
    },
    '7': {
      id: '7',
      value: "question",
      emoji: "2753"
    },
    '8': {
      id: '8',
      value: "idea",
      emoji: "1F4A1"
    }
  }

  //app.threads = Object.assign({}, app.threads, threadsRestored)
  // to serialize NBRange: sr = range.serialize()
  // to deserialize: dsr = deserializeNbRange(sr)
}
