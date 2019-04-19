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
import SearchBar from './SearchBar.vue'

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
      editorPane.init('New Comment', null)
      editorPane.show()

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

let users = {
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

let hashtags = {
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

let userSuggestions = Object.values(users)
userSuggestions.map(function(x) {
  Object.assign(x, { value: `${x.name.first} ${x.name.last}` })
})
userSuggestions.sort(compare('value'))

let hashtagSuggestions = Object.values(hashtags)
hashtagSuggestions.sort(compare('value'))

let headAnnotations = {} // {id: Annotation()}

let editorPane = new Vue({
  el: '#editor-pane',
  data: {
    visible: false, // hidden by default
    editorKey: Date.now(),
    header: "",
    initialContent: null,
    content: null,
    users: userSuggestions,
    hashtags: hashtagSuggestions
  },
  components: {
    EditorView
  },
  methods: {
    show: function() {
      this.visible = true
    },
    hide: function() {
      this.visible = false
    },
    init: function(header, content) {
      this.editorKey = Date.now()
      this.header = header
      this.initialContent = content // null if empty
    },
    onSubmitComment: function(comment) {
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
        headAnnotations[id] = annotation
        app.threadHeads.push(annotation)

        draftHighlight = null
        selecting = false
      }
    },
    onCancelComment: function() {
      if (draftHighlight) {
        highlights.removeHighlight(draftHighlight)
        draftHighlight = null
        selecting = false
      }
    }
  }
})

let searchBar = new Vue({
  el: '#search-bar',
  data: {
    users: userSuggestions,
    hashtags: hashtagSuggestions
  },
  components: {
    SearchBar
  },
  methods: {
    onTextChange(text) {
      app.filterText = text
    }
  }
})

let app = new Vue({
  el: '#list-pane',
  data: {
    threadHeads: [],
    threadSelected: null,
    filterText: "",
    filterHashtags: []
  },
  components: {
    ListView,
    ThreadView
  },
  methods: {
    onSelectThread: function(id) {
      selectAnnotation(id)
    },
    onDraftReply: function(comment) {
      replyToAnnotation = comment
      editorPane.init(`re: ${comment.text}`,  null)
      editorPane.show()
    }
  }
})
// TODO: filter before passing threads to ListView
//       if (this.filterText !== "") {
//         results = results.filter(thread => thread.hasText(this.filterText))
//       }
//       if (this.filterHashtags.length > 0) {
//         results = results.filter(thread => {
//           for (let hashtag of this.filterHashtags) {
//             if (thread.hasHashtag(hashtag)) {
//               return true
//             }
//           }
//           return false
//         })
//       }

let hashtagOptions = document.querySelector('#hashtag-options')
for (let hashtag of hashtagSuggestions) {
  let div = document.createElement('div')
  let input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  input.setAttribute('name', `hashtag-${hashtag.id}`)
  input.setAttribute('value', hashtag.id)
  let label = document.createElement('label')
  label.setAttribute('for', `hashtag-${hashtag.id}`)
  label.textContent = hashtag.value
  div.appendChild(input)
  div.appendChild(label)
  hashtagOptions.appendChild(div)
}
document.querySelector('#apply-filter').addEventListener('click', (event) => {
  let options = hashtagOptions.querySelectorAll(`input[type=checkbox]`)
  let toFilter = []
  for (let option of options) {
    if (option.checked) {
      toFilter.push(option.getAttribute('value'))
    }
  }
  app.filterHashtags = toFilter
})

function selectAnnotation(annotationID) {
  let highlight = document.getElementsByClassName('nb-highlight selected')[0]
  if (highlight) {
    highlight.classList.remove('selected')
  }
  let row = document.getElementsByClassName('list-row selected')[0]
  if (row) {
    row.classList.remove('selected')
  }
  // TODO: fix bug with wrong row highlighted when new comments created
  // or just select the annotation when it's created
  // but this could be inside vue component
  // TODO: check if list-row exists (when filtered)
  document.querySelector(`.list-row[annotation_id='${annotationID}']`).classList.add('selected')
  document.querySelector(`.nb-highlight[annotation_id='${annotationID}']`).classList.add('selected')

  renderThreadPane(headAnnotations[annotationID])
}

// Render thread pane for the thread containing 'annotation'
function renderThreadPane(annotation) {
  let headAnnotation = annotation
  while (headAnnotation.parent) {
    headAnnotation = headAnnotation.parent
  }

  app.threadSelected = headAnnotation
}
