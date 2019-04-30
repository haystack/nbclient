const CommentVisibility = Object.freeze({
  EVERYONE: 'EVERYONE',
  INSTRUCTORS: 'INSTRUCTORS',
  MYSELF: 'MYSELF'
});

const CommentAnonymity = Object.freeze({
  IDENTIFIED: 'IDENTIFIED',
  ANONYMOUS: 'ANONYMOUS'
});

const VisibilityMap = Object.freeze({
  EVERYONE: 'EVERYONE',
  INSTRUCTORS: 'INSTRUCTORS',
  MYSELF: 'MYSELF'
});

const AnonymityMap = Object.freeze({
  IDENTIFIED: 'IDENTIFIED',
  ANONYMOUS: 'ANONYMOUS'
});

export {
  CommentVisibility,
  CommentAnonymity,
  VisibilityMap,
  AnonymityMap
}
