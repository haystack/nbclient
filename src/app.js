// TODO: Follow the JS doc style
import Vue from 'vue'
import VueQuill from 'vue-quill'
Vue.use(VueQuill)

import { compare } from './compare-util.js'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import Highlights from './highlighter.js'
import Annotation from "./annotation.js"

import ListView from './ListView.vue'
import ThreadView from './ThreadView.vue'
import EditorView from './EditorView.vue'
import FilterView from './FilterView.vue'

let docPane = document.querySelector('#document-pane')
let highlights = new Highlights(docPane)

let selecting = false
let draftHighlight = null
let replyToAnnotation = null

document.addEventListener("mouseup", checkForSelection, false)
window.addEventListener("resize", redrawHighlights, false)

function checkForSelection(event) {
  let selection = window.getSelection()

  if (!selection.isCollapsed) {
    // Set global state to reflect the fact we're making a selection.
    // Used to stop click events from showing contents of older highlights
    // when the click event is the result of a selection.
    selecting = true
    //TODO: the whole selcting logic seems a bit off

    let range = selection.getRangeAt(0)

    // Check if range is inside #document-pane
    if (docPane.contains(range.commonAncestorContainer)) {
      if (selecting) {
        highlights.removeHighlight(draftHighlight)
        draftHighlight = null
      }

      // Cannot reply and create at the same time.
      replyToAnnotation = null

      makeHighlight(range)

      // Display the editor pane
      app.initEditor('New Comment', null, true)

      // Clear the selection
      selection.removeAllRanges()
    }
  }
}

/* Helper function for checkForSelection */
function makeHighlight(range) {
  let nbRange = createNbRange(range)
  draftHighlight = highlights.createHighlight(nbRange)
}

function redrawHighlights() {
  highlights.render()
}

let app = new Vue({
  el: '#app',
  data: {
    threads: {},
    threadSelected: null,
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
            if (item.hasHashtag(hashtag)) {
              return true
            }
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
      app.threadSelected = thread
      // TODO: Convert Highlights to Vue
      let highlight = document.getElementsByClassName('nb-highlight selected')[0]
      if (highlight) {
        highlight.classList.remove('selected')
      }
      document.querySelector(`.nb-highlight[annotation_id='${thread.id}']`).classList.add('selected')
    },
    onDraftReply: function(comment) {
      replyToAnnotation = comment
      this.initEditor(`re: ${comment.text}`,  null, true)
    },
    onSubmitComment: function(comment) {
      this.editor.visible = false

      let id = comment.timestamp //TODO: get actual annotation ID
      let author = '1' //TODO: get actual user ID
      let name = this.users[author].name

      let annotation = new Annotation(
        id,
        (draftHighlight !== null) ? draftHighlight.range : null, //range, null if this is reply
        replyToAnnotation, //parent, null if this is head annotation
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

      if (replyToAnnotation) {
        replyToAnnotation.children.push(annotation)
        replyToAnnotation = null
      } else {
        draftHighlight.setAnnotationID(id)
        this.$set(this.threads, id, annotation)
        draftHighlight = null
        selecting = false
      }
    },
    onCancelComment: function() {
      this.editor.visible = false

      if (draftHighlight) {
        highlights.removeHighlight(draftHighlight)
        draftHighlight = null
        selecting = false
      }
    }
  },
  components: {
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
