// TODO: Follow the JS doc style
import Vue from 'vue'
import VueQuill from 'vue-quill'
Vue.use(VueQuill)

import { compare } from './compare-util.js'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import Annotation from "./annotation.js"

import NbHighlights from './NbHighlights.vue'
import ListView from './ListView.vue'
import ThreadView from './ThreadView.vue'
import EditorView from './EditorView.vue'
import FilterView from './FilterView.vue'

// to serialize NBRange: sr = range.serialize()
// to deserialize: dsr = deserializeNbRange(sr)

let selecting = false

document.addEventListener("mouseup", checkForSelection, false)
window.addEventListener("resize", redrawHighlights, false)

function checkForSelection(event) {
  let selection = window.getSelection()
  if (!selection.isCollapsed) {
    // Set global state to reflect the fact we're making a selection.
    // Used to stop click events from showing contents of older highlights
    // when the click event is the result of a selection.
    selecting = true
    // TODO: the whole selcting logic seems a bit off
    let range = selection.getRangeAt(0)
    // TODO: check if range is in body, not sidebar
    // e.g. sidebar.contains(range.commonAncestorContainer)
    // or check if either start / end of range is in sidebar
    app.onDraftThread(range)
    selection.removeAllRanges() // Clear the selection
  }
}

function redrawHighlights() {
  // highlights.render()
}

let app = new Vue({
  el: '#app',
  data: {
    draftRange: null,
    replyToComment: null,
    threads: {},
    threadSelected: null, // TODO: Reset when you click on document outside of highlights?
    filter: {
      searchText: "",
      hashtags: []
    },
    editor: {
      key: Date.now(),
      visible: false,
      header: "",
      initialContent: null
    },
    users: [],
    hashtags: []
  },
  computed: {
    sortedUsers: function() {
      let items = Object.values(this.users)
      for (let item of items) {
        Object.assign(item, { value: `${item.name.first} ${item.name.last}` })
      }
      return items.sort(compare('value'))
    },
    sortedHashtags: function() {
      return Object.values(this.hashtags).sort(compare('value'))
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
    },
    totalThreads: function() {
      return Object.keys(this.threads).length
    }
  },
  methods: {
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
    initEditor: function(header, content, visible) {
      this.editor.key = Date.now()
      this.editor.header = header
      this.editor.initialContent = content
      this.editor.visible = visible
    },
    onSelectThread: function(thread) {
      this.threadSelected = thread
    },
    onDraftThread: function(range) {
      this.replyToComment = null // Cannot reply and create at the same time.
      this.draftRange = createNbRange(range)
      this.initEditor('New Comment', null, true)
    },
    onDraftReply: function(comment) {
      this.replyToComment = comment
      this.initEditor(`re: ${comment.text}`,  null, true)
    },
    onSubmitComment: function(comment) {
      this.editor.visible = false

      let id = comment.timestamp //TODO: get actual annotation ID
      let author = '1' //TODO: get actual user ID
      let name = this.users[author].name

      let annotation = new Annotation(
        id,
        this.draftRange, //range, null if this is reply
        this.replyToComment, //parent, null if this is the head of thread
        comment.timestamp,
        author,
        `${name.first} ${name.last}`, //authorName
        comment.html, //content
        comment.mentions.hashtags,
        comment.mentions.users,
        comment.visibility, //TODO: create enum?
        comment.anonymity,
        comment.replyRequested, //replyRequestedByMe
        comment.replyRequested ? 1 : 0, //replyRequestCount
        false, //starredByMe
        0, //starCount
        true //seenByMe
      )

      if (this.replyToComment) {
        this.replyToComment.children.push(annotation)
        this.replyToComment = null
      } else {
        this.$set(this.threads, id, annotation)
        this.draftRange = null
        selecting = false
      }
    },
    onCancelComment: function() {
      this.editor.visible = false

      if (this.draftRange) {
        this.draftRange = null
        selecting = false
      }
    }
  },
  components: {
    NbHighlights,
    FilterView,
    ListView,
    ThreadView,
    EditorView
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
