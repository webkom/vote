'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const isEmpty = require('lodash/isEmpty');
const types_1 = require('./types');
const winningThreshold = (votes, useStrict) => {
  if (useStrict) {
    return Math.floor((2 * votes.length) / 3) + 1;
  }
  return Math.floor(votes.length / 2 + 1);
};
const calculateWinnerUsingNormal = (inputVotes, useStrict = false) => {
  const votes = inputVotes.map((vote) => ({
    _id: String(vote._id),
    priorities: vote.priorities.map((vote) => ({
      _id: String(vote._id),
      description: vote.description,
      election: String(vote._id),
    })),
    hash: vote.hash,
  }));
  const count = votes.reduce(
    (reduced, vote) => {
      if (isEmpty(vote.priorities)) {
        reduced['blank'] += 1;
      } else {
        reduced[vote.priorities[0].description] =
          (reduced[vote.priorities[0].description] || 0) + 1;
      }
      return reduced;
    },
    { blank: 0 }
  );
  const thr = winningThreshold(votes, useStrict);
  const maxKey = Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );
  const status =
    count[maxKey] >= thr ? types_1.Status.resolved : types_1.Status.unresolved;
  const winner =
    count[maxKey] >= thr
      ? { alternative: maxKey, count: count[maxKey] }
      : undefined;
  return {
    result: {
      status,
      winner,
    },
    thr,
    voteCount: inputVotes.length,
    blankVoteCount: count['blank'],
    useStrict,
    log: count,
  };
};
exports.default = calculateWinnerUsingNormal;
//# sourceMappingURL=normal.js.map
