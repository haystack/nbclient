const CriteriaTypes = ["COMMENT", "HASHTAGS", "WORDS", "CHARACTERS"]

class Criterion {
  constructor(id, type) {
    this.id = id
    this.type = type
    this.label = 'Total ' +
      type.charAt(0).toUpperCase() +
      type.slice(1).toLowerCase()
  }
}

class CustomCriterion extends Criterion {
  constructor(id, label) {
    super(id, "COMMENTS")
    this.label = label
    this.filters = {}
  }
  // E.g. Only count COMMENTS with at least *20* WORDS and *2* HASHTAGS each.
  // => this.type = COMMENTS, this.filters = { WORDS: 20, HASHTAGS: 2 }

  setFilter(type, number) {
    this.filters[type] = number
  }

  removeFilter(type) {
    delete this.filters[type]
  }
}

class Grade {
  constructor(id, label, points) {
    this.id = id
    this.label = label
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
  CriteriaTypes,
  Criterion,
  CustomCriterion,
  Grade
}
