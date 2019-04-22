class NbComment {
  constructor(id, range, parent, timestamp, author, authorName, html,
      hashtagsUsed, usersTagged, visibility, anonymity, replyRequestedByMe,
      replyRequestCount, starredByMe, starCount, seenByMe) {
    this.id = id
    this.range = range // null if this is a reply

    this.parent = parent // null if this is the head of thread
    this.children = []

    this.timestamp = timestamp
    this.author = author
    this.authorName = authorName

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

    // TODO: for now work around to generate plain text, formula breaks
    let temp = document.createElement('div')
    temp.innerHTML = this.html
    this.text = temp.textContent
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
}

export default NbComment
