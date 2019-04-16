// TODO: Follow the JS doc style
import Vue from 'vue'
import Quill from 'quill'
import 'quill-mention'
import tippy from 'tippy.js'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import { Highlights } from './highlighter.js'

var moment = require('moment')

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
        // Reset the draft (i.e. cancel the previous draft)
        quill.setContents([])
        highlights.removeHighlight(draftHighlight)
        draftHighlight = null
      }

      // Cannot reply and create at the same time.
      replyToAnnotation = null

      makeHighlight(range)

      // Display the editor pane
      editorHeader.textContent = 'New Comment' // TODO: cleaner?
      editorPane.style.display = 'block'

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

/////////////// Annotation implmentation starts here.

class Annotation {
  constructor(id, range, parent, timestamp, author, content,
      hashtagsUsed, usersTagged, visibility, anonymity, replyRequested) {
    this.id = id
    this.range = range // null if this is a reply

    this.parent = parent // null if this is a head annotation
    this.children = []

    this.timestamp = timestamp
    this.author = author
    this.content = content

    this.hashtags = hashtagsUsed
    this.people = usersTagged

    this.visibility = visibility
    this.isAnonymous = (anonymity === 'anonymous')

    this.replyRequestedByMe = replyRequested
    this.replyRequestCount = replyRequested ? 1 : 0

    this.starredByMe = false
    this.starCount = 0

    //TODO: need field for 'seen'

    let temp = document.createElement('div')
    temp.innerHTML = content
    this.excerpt = temp.textContent // TODO: equations break, maybe use quill.getText instead?
    // TODO: do we need more fields? e.g. visibility
  }

  addChild(child) {
    this.children.push(child)
  }

  countReplies() {
    let total = this.children.length
    for (let child of this.children) {
      total += child.countReplies()
    }
    return total
  }

  countReplyRequests() {
    let total = this.replyRequestCount
    for (let child of this.children) {
      total += child.countReplyRequests()
    }
    return total
  }

  countStars() {
    let total = this.starCount
    for (let child of this.children) {
      total += child.countStars()
    }
    return total
  }

  toggleStar() {
    if (this.starredByMe) {
      this.starCount -= 1
      this.starredByMe = false
    } else {
      this.starCount += 1
      this.starredByMe = true
    }
    // TODO: Also async update backend
  }

  toggleReplyRequest() {
    if (this.replyRequestedByMe) {
      this.replyRequestCount -= 1
      this.replyRequestedByMe = false
    } else {
      this.replyRequestCount += 1
      this.replyRequestedByMe = true
    }
    // TODO: async update backend
  }

  hasText(text) {
    if (this.excerpt.includes(text)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasText(text)) {
        return true
      }
    }
    return false
  }

  hasHashtag(hashtag) {
    if (this.hashtags.includes(hashtag)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasHashtag(hashtag)) {
        return true
      }
    }
    return false
  }
}

/////////////// Annotation implmentation ends here.

/////////////// Text editor + annotation stuff starts here.

let threadPane = document.querySelector('#thread-pane')
let editorPane = document.querySelector('#editor-pane')
let editorHeader = document.querySelector(`#editor-header`) // TODO: cleaner?
editorPane.style.display = 'none' // Hidden by default.

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
userSuggestions.sort(sortByKey('value'))

let hashtagSuggestions = Object.values(hashtags)
hashtagSuggestions.sort(sortByKey('value'))

function sortByKey(key, ascending = true, func = false) {
  return function(a, b) {
    let valueA = func ? a[key]() : a[key]
    let valueB = func ? b[key]() : b[key]
    if (valueA < valueB) {
      return ascending ? -1 : 1
    }
    if (valueA > valueB) {
      return ascending ? 1 : -1
    }
    return 0
  }
}

let quill = new Quill('#text-editor', {
  modules: {
    toolbar: [
      // TODO: Which options should we include?
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [ 'bold', 'italic', 'underline', 'strike' ],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [ 'blockquote', 'code-block', 'link', 'formula' ],
      [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      [ 'clean' ]
    ],
    mention: {
      allowedChars: /^[a-zA-Z\s]*$/,
      mentionDenotationChars: ["@", "#"],
      source: handleMention,
      renderItem: renderMention
    }
  },
  placeholder: 'Include tags with @ or #',
  theme: 'snow'
})

let MAX_SUGGEST_USERS = 10

function handleMention(searchTerm, renderList, mentionChar) {
  let items
  if (mentionChar === "@") {
    items = userSuggestions
  } else { // mentionChar === "#"
    items = hashtagSuggestions
  }

  let matches = items

  if (searchTerm.length > 0) {
    let toMatch = searchTerm.toLowerCase()
    matches = items.filter(
      item => item.value.toLowerCase().includes(toMatch)
    )
  }

  if (mentionChar === "@" && matches.length > MAX_SUGGEST_USERS) {
    matches = matches.slice(0, MAX_SUGGEST_USERS)
  }

  renderList(matches, searchTerm)
}

function renderMention(item, searchTerm) {
  if (item.hasOwnProperty('emoji')) {
    return `<span>&#x${item.emoji};</span> ${item.value}`
  } else {
    return `${item.value}`
  }
}


// TODO: cleaner?
let selectVisibility = document.querySelector('#select-visibility')
let selectAnonymity = document.querySelector('#select-anonymity')
let checkboxRequestReply = document.querySelector('#checkbox-request-reply')

selectVisibility.addEventListener('change', (event) => {
  // Disable 'anonymous' and choose 'identified' unless post to entire class.
  if (event.target.value === 'everyone') {
    selectAnonymity.options[1].disabled = false //TODO: change 1 to const?
  } else {
    selectAnonymity.value = 'identified'
    selectAnonymity.options[1].disabled = true
  }
})
//TODO: if replying to private comment, should the visibility also be private?


let headAnnotations = {} // {id: Annotation()}

let listPane = new Vue({
  el: '#list-pane',
  data: {
    threadHeads: [],
    filterText: "",
    filterHashtags: [],
    sort: compareAnnotations
  },
  computed: {
    processed: function () {
      let results = this.threadHeads
      if (this.filterText !== "") {
        results = results.filter(thread => thread.hasText(this.filterText))
      }
      if (this.filterHashtags.length > 0) {
        results = results.filter(thread => {
          for (let hashtag of this.filterHashtags) {
            if (thread.hasHashtag(hashtag)) {
              return true
            }
          }
          return false
        })
      }
      return results.sort(this.sort)
    }
  },
  methods: {
    select: function(id) {
      selectAnnotation(id)
    }
  }
})

let searchBar = new Quill('#search-bar', {
  modules: {
    toolbar: false,
    mention: {
      allowedChars: /^[a-zA-Z\s]*$/,
      mentionDenotationChars: ["@", "#"],
      source: handleMention,
      renderItem: renderMention
    }
  },
  placeholder: 'Search for comments',
  theme: 'snow'
})
searchBar.on('text-change', function(delta, oldDelta, source) {
  listPane.filterText = searchBar.getText(0, searchBar.getLength() - 1)
})

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
  listPane.filterHashtags = toFilter
  console.log(toFilter)
})

// TODO: move sort-by to inside the list pane?
document.querySelector('#sort-by').addEventListener('change', (event) => {
  let value = event.target.value
  switch (value) {
    case 'position':
      listPane.sort = compareAnnotations
      break
    case 'recent':
      listPane.sort = sortByKey('timestamp', false)
      break
    case 'comment':
      listPane.sort = sortByKey('countReplies', false, true)
      break
    case 'reply_request':
      listPane.sort = sortByKey('countReplyRequests', false, true)
      break
    case 'star':
      listPane.sort = sortByKey('countStars', false, true)
      break
    default:
      // Nothing
  }
})

function submitDraft() {
  let now = Date.now()
  let hashtagsUsed = []
  let usersTagged = []

  let mentions = editorPane.getElementsByClassName('mention')
  for (let mention of mentions) {
    let tagID = mention.getAttribute('data-id')
    if (mention.getAttribute('data-denotation-char') === '@') {
      usersTagged.push(tagID)
    } else { // data-denotation-char = '#'
      hashtagsUsed.push(tagID)
    }
  }

  let annotation = new Annotation(
    now, //TODO: id
    (draftHighlight != null) ? draftHighlight.range : null, //range, null if this is reply
    replyToAnnotation, //parent, null if this is head annotation
    now, //timestamp
    '1', //TODO: author
    quill.root.innerHTML, //content (TODO: sanitize?)
    hashtagsUsed, //hashtagsUsed
    usersTagged, //usersTagged
    selectVisibility.value, //visibility (TODO: create enum?)
    selectAnonymity.value, //anonymity
    checkboxRequestReply.checked //replyRequested
  )

  resetEditorPane()

  if (replyToAnnotation) {
    replyToAnnotation.children.push(annotation)

    replyToAnnotation = null
  } else {
    draftHighlight.setAnnotationID(now)
    headAnnotations[now] = annotation
    listPane.threadHeads.push(annotation)

    draftHighlight = null
    selecting = false
  }
}

function cancelDraft() {
  resetEditorPane()

  if (draftHighlight) {
    highlights.removeHighlight(draftHighlight)

    draftHighlight = null
    selecting = false
  }
}

function resetEditorPane() {
  editorPane.style.display = 'none'
  quill.setContents([])

  selectVisibility.selectedIndex = 0
  selectAnonymity.selectedIndex = 0
  checkboxRequestReply.checked = false
}

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

Vue.component('thread-comment', {
  props: ['comment'],
  methods: {
    reply: function() {
      replyToAnnotation = this.comment
      editorHeader.textContent = `re: ${this.comment.excerpt}` // TODO: cleaner?
      editorPane.style.display = 'block'
    }
  },
  template: '\
    <div>\
      <div class="thread-row">\
        <div class="thread-row-header">\
          <span><b>{{ authorName }}</b></span> <span>{{ timeString }}</span>\
        </div>\
        <div class="thread-row-body" v-html="comment.content">\
        </div>\
        <div class="thread-row-footer">\
          <span class="tippy" data-tippy-content="reply" v-on:click="reply">\
            <i class="fas fa-reply"></i> {{ comment.countReplies() }}\
          </span> &middot;\
          <span class="tippy" data-tippy-content="give star" v-on:click="comment.toggleStar()">\
            <i class="fas fa-star" :style="starStyle"></i> {{ comment.starCount }}\
          </span> &middot;\
          <span class="tippy" data-tippy-content="request reply" v-on:click="comment.toggleReplyRequest()">\
            <i class="fas fa-question" :style="questionStyle"></i> {{ comment.replyRequestCount }}\
          </span>\
        </div>\
      </div>\
      <div class="thread-block" v-if="comment.children.length">\
        <thread-comment v-for="child in comment.children" v-bind:comment="child"></thread-comment>\
      </div>\
    </div>\
  ',
  computed: {
    authorName: function() {
      if (this.comment.isAnonymous || this.comment.author === null) {
        return 'Anonymous'
      }
      let author = users[this.comment.author]
      return `${author.name.first} ${author.name.last}`
    },
    timeString: function() {
      return moment(this.comment.timestamp).fromNow()
    },
    starStyle: function() {
      if (this.comment.starredByMe) return 'color: #1B95E0'
    },
    questionStyle: function() {
      if (this.comment.replyRequestedByMe) return 'color: #1B95E0'
    }
  },
  mounted: function() {
    tippy('.tippy', {arrow: true})
  }
  //TODO: toggle tooltip contents
})

let threadPaneVue = new Vue({
  el: '#thread-pane',
  data: {
    annotation: null
  }
})

// Render thread pane for the thread containing 'annotation'
function renderThreadPane(annotation) {
  let headAnnotation = annotation
  while (headAnnotation.parent) {
    headAnnotation = headAnnotation.parent
  }

  threadPaneVue.annotation = headAnnotation
}

function compareAnnotations(a, b) {
  if (a.range.start.isSameNode(b.range.start)) {
    // a and b have the same start
    if (a.range.end.isSameNode(b.range.end)) {
      // a and b have the same range
      return 0
    } else if (a.range.end.compareDocumentPosition(b.range.end)
        & Node.DOCUMENT_POSITION_FOLLOWING) {
      // a ends before b
      return -1
    } else {
      // b ends before a
      return 1
    }
  } else if (a.range.start.compareDocumentPosition(b.range.start)
      & Node.DOCUMENT_POSITION_FOLLOWING) {
    // a starts before b
    return -1
  } else {
    // b starts before a
    return 1
  }
}

document.querySelector('#submit-draft').addEventListener("click", submitDraft, false)
document.querySelector('#cancel-draft').addEventListener("click", cancelDraft, false)

/////////////// Text editor + annotation stuff ends here.
