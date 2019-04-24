const CriteriaType = Object.freeze({
  CHARS: 0,
  WORDS: 1,
  HASHTAGS: 2,
  COMMENTS: 3
})

class Criterion {
  constructor(id, nickname, type) {
    this.id = id
    this.nickname = nickname
    this.type = type
    this.filters = {}
  }
  // E.g. Only count COMMENTS with at least *20* WORDS and *2* HASHTAGS each.
  // => this.type = COMMENTS, this.filters = { WORDS: 20, HASHTAGS: 2 }

  setFilter(type, number) {
    this.filters[type] = number
  }
}

class Grade {
  constructor(id, nickname, points) {
    this.id = id
    this.nickname = nickname
    this.points = points
    this.thresholds = {}
  }
  // E.g. There are two criteria A and B:
  // A = { type: COMMENTS, filters: {} }, B = { type: WORDS, filters: {} }
  // Give *4* points to students who wrote at least
  // *3* comments and *60* words total.
  // => this.points = 4, this.thresholds = { A: 3,  B: 60 }

  setThreshold(id, number) {
    this.thresholds[id] = number
  }

  getThreshold(id) {
    return (id in this.thresholds) ? this.thresholds[id] : 0
  }

  removeThreshold(id) {
    delete this.thresholds[id]
  }
}

export {
  CriteriaType,
  Criterion,
  Grade
}
