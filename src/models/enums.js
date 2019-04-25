const CommentVisibility = Object.freeze({
  EVERYONE: 0,
  INSTRUCTORS: 1,
  MYSELF: 2
});

const CommentAnonymity = Object.freeze({
  IDENTIFIED: 0,
  ANONYMOUS: 1
});

const VisibilityMap = Object.freeze({
  0: 'EVERYONE',
  1: 'INSTRUCTORS',
  2: 'MYSELF'
});

const AnonymityMap = Object.freeze({
  0: 'IDENTIFIED',
  1: 'ANONYMOUS'
});

export {
  CommentVisibility,
  CommentAnonymity,
  VisibilityMap,
  AnonymityMap
}
