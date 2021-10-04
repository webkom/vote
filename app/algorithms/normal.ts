import isEmpty = require('lodash/isEmpty');
import { Status, Vote, Result } from './types';

// This is a TypeScript file in a JavaScript project so it must be complied
// If you make changes to this file it must be recomplied using `tsc` in
// order for the changes to be reflected in the rest of the program.
//
// app/models/election .elect() is the only file that uses this function
// and importes it from normal.js, which is the compiled result of this file.
//
//
interface Normal extends Result {
  result: NormalResult;
  log: Count;
}

type NormalResult = {
  status: Status;
  winner: { alternative: string; count: number } | undefined;
};

type Count = { [key: string]: number };

/**
 * @param votes - All votes for the election
 * @param useStrict - Sets the threshold to 67%
 *
 * @return The amount votes needed to win
 */
const winningThreshold = (votes: Vote[], useStrict: boolean): number => {
  if (useStrict) {
    return Math.floor((2 * votes.length) / 3) + 1;
  }
  return Math.floor(votes.length / 2 + 1);
};

/**
 * Will calculate the election result using Single Transferable Vote
 * @param votes - All votes for the election
 * @param useStrict - This election will require a qualified majority. Default false
 *
 * @return The full election result
 */
const calculateWinnerUsingNormal = (
  inputVotes: any,
  useStrict = false
): Normal => {
  // Stringify and clean the votes
  const votes: Vote[] = inputVotes.map((vote: any) => ({
    _id: String(vote._id),
    priorities: vote.priorities.map((vote: any) => ({
      _id: String(vote._id),
      description: vote.description,
      election: String(vote._id),
    })),
    hash: vote.hash,
  }));

  // Reduce votes to the distinct counts for each alternative
  const count: Count = votes.reduce(
    (reduced: any, vote: Vote) => {
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

  // Calculate threshold and see if an alternative can be
  const thr = winningThreshold(votes, useStrict);

  // Winner key
  const maxKey: string = Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );

  // Check if we can call the vote Resolved based on
  const status = count[maxKey] >= thr ? Status.resolved : Status.unresolved;

  // Create winner object
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

export default calculateWinnerUsingNormal;
