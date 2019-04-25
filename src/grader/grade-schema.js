let CriteriaTypes = ["COMMENT", "HASHTAGS", "WORDS", "CHARACTERS"]

class DefaultCriterion {
  constructor(type) {
    this.type = type
  }

  getID() {
    return this.type // type as unique ID b/c only one criterion of each type
  }

  getType() {
    return this.type
  }

  getLabel() {
    return 'Total ' + this.type.charAt(0).toUpperCase()
      + this.type.slice(1).toLowerCase()
  }
}

class CustomCriterion {
  constructor(id, label) {
    this.id = id
    this.label = label
    this.filters = {
      "HASHTAGS": 0,
      "WORDS": 0,
      "CHARACTERS": 0
    }
  }
  // E.g. Only count COMMENTS with at least *20* WORDS and *2* HASHTAGS each.
  // => this.type = COMMENTS, this.filters = { WORDS: 20, HASHTAGS: 2 }

  getID() {
    return this.id
  }

  getType() {
    return "CUSTOM_COMMENTS"
  }

  getLabel() {
    return this.label
  }

  getFilter(type) {
    return this.filters[type]
  }

  setFilter(type, number) {
    this.filters[type] = number
  }

  removeFilter(type) {
    this.filters[type] = 0
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
  // A = { type : COMMETNS }, B = { type : WORDS }
  // Give *4* points to students who wrote at least
  // *3* comments and *60* words total.
  // => this.points = 4, this.thresholds = { A.id : 3,  B.id : 60 }

  getThreshold(id) {
    return (id in this.thresholds) ? this.thresholds[id] : 0
  }

  setThreshold(id, number) {
    this.thresholds[id] = number
  }

  removeThreshold(id) {
    delete this.thresholds[id]
  }
}

export {
  CriteriaTypes,
  DefaultCriterion,
  CustomCriterion,
  Grade
}
