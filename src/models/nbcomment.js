import htmlToText from 'html-to-text'
import axios from 'axios'
import { CommentVisibility, CommentAnonymity } from './enums.js'
import { compare } from '../utils/compare-util.js'

class NbComment {
  constructor (data) {
    this.id = data.id
    this.range = data.range // null if this is a reply

    this.parent = data.parent // null if this is the head of thread

    this.children = []
    if (this.id) {
      this.loadReplies()
    }

    if (data.timestamp) {
      let date = new Date(data.timestamp.replace(' ', 'T'))
      this.timestamp = date.getTime()
    } else {
      this.timestamp = Date.now()
    }
    this.author = data.author
    this.authorName = data.authorName
    this.instructor = data.instructor

    this.html = data.html

    this.hashtags = data.hashtags
    this.people = data.people

    this.visibility = data.visibility
    this.anonymity = data.anonymity

    this.replyRequestedByMe = data.replyRequestedByMe
    this.replyRequestCount = data.replyRequestCount

    this.upvotedByMe = data.starredByMe
    this.upvoteCount = data.starCount

    this.seenByMe = data.seenByMe
    this.bookmarked = data.bookmarked

    this.setText() // populate this.text and this.wordCount from this.html
  }

  setText () {
    if (this.html.includes('ql-formula')) { // work around for latex formula
      let temp = document.createElement('div')
      temp.innerHTML = this.html
      for (let formula of temp.querySelectorAll('span.ql-formula')) {
        let span = document.createElement('span')
        span.textContent = formula.getAttribute('data-value')
        formula.parentNode.replaceChild(span, formula)
      }
      this.text = temp.textContent
    } else {
      this.text = htmlToText.fromString(this.html, { wordwrap: false })
    }
    this.wordCount = this.text.split(' ').length
  }

  submitAnnotation () {
    if (!this.parent) {
      return axios.post('/api/annotations/annotation', {
        url: window.location.href.split('?')[0],
        content: this.html,
        range: this.range.serialize(),
        author: this.author,
        tags: this.hashtags,
        userTags: this.people,
        visibility: CommentVisibility[this.visibility],
        anonymity: CommentAnonymity[this.anonymity],
        replyRequest: this.replyRequestedByMe,
        star: this.upvotedByMe,
        bookmark: this.bookmarked
      }).then(res => {
        this.id = res.data.id
        this.loadReplies()
      })
    } else {
      return axios.post(`/api/annotations/reply/${this.parent.id}`, {
        content: this.html,
        author: this.author,
        tags: this.hashtags,
        userTags: this.people,
        visibility: CommentVisibility[this.visibility],
        anonymity: CommentAnonymity[this.anonymity],
        replyRequest: this.replyRequestedByMe,
        star: this.upvotedByMe,
        bookmark: this.bookmarked
      }).then(res => {
        this.id = res.data.id
      })
    }
  }

  loadReplies () {
    axios.get(`/api/annotations/reply/${this.id}`).then(res => {
      this.children = res.data.map(item => {
        item.parent = this
        return new NbComment(item)
      })
      this.children.sort(compare('timestamp'))
    })
  }

  countAllReplies () {
    let total = this.children.length
    for (let child of this.children) {
      total += child.countAllReplies()
    }
    return total
  }

  countAllReplyReqs () {
    let total = this.replyRequestCount
    for (let child of this.children) {
      total += child.countAllReplyReqs()
    }
    return total
  }

  countAllUpvotes () {
    let total = this.upvoteCount
    for (let child of this.children) {
      total += child.countAllUpvotes()
    }
    return total
  }

  hasText (text) {
    if (this.text.toLowerCase().includes(text.toLowerCase())) {
      return true
    }
    for (let child of this.children) {
      if (child.hasText(text)) {
        return true
      }
    }
    return false
  }

  hasAuthor (text) {
    let searchText = text.toLowerCase()
    if (searchText.length > 1 && searchText.charAt(0) === '@') {
      // for autocompleted name
      searchText = searchText.substring(1)
    }
    if (this.authorName.toLowerCase().includes(searchText)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasAuthor(text)) {
        return true
      }
    }
    return false
  }

  hasBookmarks () {
    if (this.bookmarked) {
      return true
    }
    for (let child of this.children) {
      if (child.hasBookmarks()) {
        return true
      }
    }
    return false
  }

  hasHashtag (hashtag) {
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

  hasUserTag (userID) {
    if (this.people.includes(userID)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasUserTag(userID)) {
        return true
      }
    }
    return false
  }

  hasInstructorPost () {
    if (this.instructor) { return true }
    for (let child of this.children) {
      if (child.hasInstructorPost()) {
        return true
      }
    }
    return false
  }

  hasUserPost (userID) {
    if (this.author === userID) { return true }
    for (let child of this.children) {
      if (child.hasUserPost(userID)) {
        return true
      }
    }
    return false
  }

  hasReplyRequests () {
    if (this.replyRequestCount > 0) { return true }
    for (let child of this.children) {
      if (child.hasReplyRequests()) {
        return true
      }
    }
    return false
  }

  hasMyReplyRequests () {
    if (this.replyRequestedByMe) { return true }
    for (let child of this.children) {
      if (child.hasMyReplyRequests()) {
        return true
      }
    }
    return false
  }

  hasUpvotes () {
    if (this.upvoteCount > 0) { return true }
    for (let child of this.children) {
      if (child.hasUpvotes()) {
        return true
      }
    }
    return false
  }

  hasMyUpvotes () {
    if (this.upvotedByMe) { return true }
    for (let child of this.children) {
      if (child.hasMyUpvotes()) {
        return true
      }
    }
    return false
  }

  isUnseen () {
    if (!this.seenByMe) { return true }
    for (let child of this.children) {
      if (child.isUnseen()) {
        return true
      }
    }
    return false
  }

  markSeenAll () { // mark this comment and all replies 'seen'
    if (!this.seenByMe) {
      this.seenByMe = true
      axios.post(`/api/annotations/seen/${this.id}`)
    }
    for (let child of this.children) {
      child.markSeenAll()
    }
  }

  toggleUpvote () {
    if (this.upvotedByMe) {
      this.upvoteCount -= 1
      this.upvotedByMe = false
    } else {
      this.upvoteCount += 1
      this.upvotedByMe = true
    }
    if (this.id) {
      axios.post(`/api/annotations/star/${this.id}`, { star: this.upvotedByMe })
    }
  }

  toggleReplyRequest () {
    if (this.replyRequestedByMe) {
      this.replyRequestCount -= 1
      this.replyRequestedByMe = false
    } else {
      this.replyRequestCount += 1
      this.replyRequestedByMe = true
    }
    if (this.id) {
      axios.post(`/api/annotations/replyRequest/${this.id}`, { replyRequest: this.replyRequestedByMe })
    }
  }

  toggleBookmark () {
    this.bookmarked = !this.bookmarked
    if (this.id) {
      axios.post(`/api/annotations/bookmark/${this.id}`, { bookmark: this.bookmarked })
    }
  }

  saveUpdates (data) {
    this.timestamp = data.timestamp
    this.html = data.html
    this.hashtags = data.mentions.hashtags
    this.people = data.mentions.users
    this.visibility = data.visibility
    this.anonymity = data.anonymity
    if (this.replyRequestedByMe !== data.replyRequested) {
      this.replyRequestedByMe = data.replyRequested
      this.replyRequestCount += data.replyRequested ? 1 : -1
    }
    this.setText()
    return axios.put(`/api/annotations/annotation/${this.id}`, {
      content: this.html,
      tags: this.hashtags,
      userTags: this.people,
      visibility: CommentVisibility[this.visibility],
      anonymity: CommentAnonymity[this.anonymity],
      replyRequest: this.replyRequestedByMe
    })
  }

  removeChild (child) {
    let idx = this.children.indexOf(child)
    if (idx >= 0) {
      this.children.splice(idx, 1)
      if (child.id) {
        axios.delete(`/api/annotations/annotation/${child.id}`)
      }
    }
  }
}

export default NbComment
