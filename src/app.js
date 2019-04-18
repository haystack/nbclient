// TODO: Follow the JS doc style
import Vue from 'vue'
import Quill from 'quill'
import 'quill-mention'
import { createNbRange, deserializeNbRange } from './nbrange.js'
import Highlights from './highlighter.js'
import Annotation from "./annotation.js"
import ThreadComment from './ThreadComment.vue'

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

/////////////// Text editor + annotation stuff starts here.

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

let headAnnotations = {} // {id: Annotation()}

let threadPane = document.querySelector('#thread-pane')
let editorPane = document.querySelector('#editor-pane')
let editorHeader = document.querySelector(`#editor-header`) // TODO: cleaner?
editorPane.style.display = 'none' // Hidden by default.

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

let listPane = new Vue({
  el: '#list-pane',
  data: {
    threadHeads: [],
    filterText: "",
    filterHashtags: [],
    sort: compareAnnotationPositons
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
      listPane.sort = sortByKey('countAllReplies', false, true)
      break
    case 'reply_request':
      listPane.sort = sortByKey('countAllReplyRequests', false, true)
      break
    case 'star':
      listPane.sort = sortByKey('countAllStars', false, true)
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
    (draftHighlight !== null) ? draftHighlight.range : null, //range, null if this is reply
    replyToAnnotation, //parent, null if this is head annotation
    now, //timestamp
    '1', //TODO: author
    `${users['1'].name.first} ${users['1'].name.last}`, //TODO: authorName
    quill.root.innerHTML, //content (TODO: sanitize?)
    hashtagsUsed, //hashtagsUsed
    usersTagged, //usersTagged
    selectVisibility.value, //visibility (TODO: create enum?)
    selectAnonymity.value, //anonymity
    checkboxRequestReply.checked, //replyRequestedByMe
    checkboxRequestReply.checked ? 1 : 0, //replyRequestCount
    false, //starredByMe
    0, //starCount
    true //seenByMe
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


let threadPaneVue = new Vue({
  el: '#thread-pane',
  data: {
    annotation: null
  },
  methods: {
    draftReply: function(comment) {
      replyToAnnotation = comment
      editorHeader.textContent = `re: ${comment.excerpt}` // TODO: cleaner?
      editorPane.style.display = 'block'
    },
    toggleStar: function(comment) {
      comment.toggleStar()
    },
    toggleReplyRequest: function(comment) {
      comment.toggleReplyRequest()
    }
  },
  components: {
    ThreadComment
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

function compareAnnotationPositons(a, b) {
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
