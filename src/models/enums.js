/**
 * Enumeration of who can view the comment.
 * @constant
 * @type {Object}
 * @property {String} EVERYONE - all students and instructors
 * @property {String} INSTRUCTORS - only instructors
 * @property {String} MYSELF - only myself (the author)
 */
const CommentVisibility = Object.freeze({
  EVERYONE: 'EVERYONE',
  INSTRUCTORS: 'INSTRUCTORS',
  MYSELF: 'MYSELF'
})

/**
 * Enumeration of who can identity the comment's author.
 * @constant
 * @type {Object}
 * @property {String} IDENTIFIED - identified by students and instructors
 * @property {String} ANONYMOUS - anonymous to students, identified by instructors
 */
const CommentAnonymity = Object.freeze({
  IDENTIFIED: 'IDENTIFIED',
  ANONYMOUS: 'ANONYMOUS'
})

export {
  CommentVisibility,
  CommentAnonymity
}
