import htmlToText from 'html-to-text'
import axios from 'axios'
import {VisibilityMap, AnonymityMap} from './enums'

class NbComment {
  constructor(id, range, parent, timestamp, author, authorName, html,
      hashtagsUsed, usersTagged, visibility, anonymity, replyRequestedByMe,
      replyRequestCount, starredByMe, starCount, seenByMe) {
    this.id = id
    this.range = range // null if this is a reply

    this.parent = parent // null if this is the head of thread

    this.children = [];
    if(this.id){
      this.loadReplies()
    }

    this.timestamp = new Date(timestamp.replace(' ', 'T'));
    this.author = author
    this.authorName = authorName
    this.instructor = true // TODO

    this.html = html

    this.hashtags = hashtagsUsed
    this.people = usersTagged

    this.visibility = visibility
    this.anonymity = anonymity

    this.replyRequestedByMe = replyRequestedByMe
    this.replyRequestCount = replyRequestCount

    this.starredByMe = starredByMe
    this.starCount = starCount

    this.seenByMe = seenByMe

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
  }

  submitAnnotation(){
    if(!this.parent){
      return axios.post('/api/annotations/annotation', {
        url: window.location.href.split('?')[0],
        content: this.html,
        range: this.range.serialize(),
        author: this.author,
        tags: this.hashtags,
        userTags: this.people,
        visibility: VisibilityMap[this.visibility],
        anonymity: AnonymityMap[this.anonymity],
        replyRequest: this.replyRequestedByMe,
        star: this.starredByMe
      }).then(res => {
        this.id = res.data.id;
        this.loadReplies();
      });
    }
    else{
      return axios.post(`/api/annotations/reply/${this.parent.id}`,{
        content: this.html,
        author: this.author,
        tags: this.hashtags,
        userTags: this.people,
        visibility: VisibilityMap[this.visibility],
        anonymity: AnonymityMap[this.anonymity],
        replyRequest: this.replyRequestedByMe,
        star: this.starredByMe
      }).then(res => {
        this.id = res.data.id;
      });
    }
  }

  loadReplies(){
    axios.get(`/api/annotations/reply/${this.id}`).then(res => {
      this.children = res.data.map(annotation => {
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
    });
  }

  countAllReplies() {
    let total = this.children.length
    for (let child of this.children) {
      total += child.countAllReplies()
    }
    return total
  }

  countAllReplyRequests() {
    let total = this.replyRequestCount
    for (let child of this.children) {
      total += child.countAllReplyRequests()
    }
    return total
  }

  countAllStars() {
    let total = this.starCount
    for (let child of this.children) {
      total += child.countAllStars()
    }
    return total
  }

  hasText(text) {
    if (this.text.includes(text)) {
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

  hasInstructorPost() {
    if (this.instructor) { return true }
    for (let child of this.children) {
      if (child.hasInstructorPost()) {
        return true
      }
    }
    return false
  }

  hasUserPost(userID) {
    if (this.author === userID) { return true }
    for (let child of this.children) {
      if (child.hasUserPost(userID)) {
        return true
      }
    }
    return false
  }

  hasReplyRequests() {
    if (this.replyRequestCount > 0) { return true }
    for (let child of this.children) {
      if (child.hasReplyRequests()) {
        return true
      }
    }
    return false
  }

  hasMyReplyRequests() {
    if (this.replyRequestedByMe) { return true }
    for (let child of this.children) {
      if (child.hasMyReplyRequests()) {
        return true
      }
    }
    return false
  }

  hasStars() {
    if (this.starCount > 0) { return true }
    for (let child of this.children) {
      if (child.hasStars()) {
        return true
      }
    }
    return false
  }

  hasMyStars() {
    if (this.starredByMe) { return true }
    for (let child of this.children) {
      if (child.hasMyStars()) {
        return true
      }
    }
    return false
  }

  isUnseen() {
    if (!this.seenByMe) { return true }
    for (let child of this.children) {
      if (child.isUnseen()) {
        return true
      }
    }
    return false
  }

  markSeenAll() { // mark this comment and all replies 'seen'
    if (!this.seenByMe) {
      this.seenByMe = true
      //TODO: Update database
    }
    for (let child of this.children) {
      child.markSeenAll()
    }
  }

  toggleStar() {
    if (this.starredByMe) {
      this.starCount -= 1
      this.starredByMe = false
    } else {
      this.starCount += 1
      this.starredByMe = true
    }
    if(this.id){
      axios.post(`/api/annotations/star/${this.id}`,{star: this.starredByMe})
    }
  }

  toggleReplyRequest() {
    if (this.replyRequestedByMe) {
      this.replyRequestCount -= 1
      this.replyRequestedByMe = false
    } else {
      this.replyRequestCount += 1
      this.replyRequestedByMe = true
    }
    if(this.id){
      axios.post(`/api/annotations/replyRequest/${this.id}`,{replyRequest: this.replyRequestedByMe})
    }
  }
}

export default NbComment
