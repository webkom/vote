import isEmpty from 'lodash/isEmpty';
import { Status, Vote, Alternative, ElectionResult, Count } from './types';

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
  inputAlternatives: any,
  seats = 1,
  useStrict = false
): ElectionResult => {
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

  // Stringify and clean the alternatives
  const alternatives: Alternative[] = inputAlternatives.map(
    (alternative: any) => ({
      _id: String(alternative._id),
      description: alternative.description,
      election: String(alternative._id),
    })
  );

  // Reduce votes to the distinct counts for each alternative
  const count: Count = votes.reduce(
    (reduced: Count, vote: Vote) => {
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

  // Create winner alternative from maxKey
  const winner =
    count[maxKey] >= thr
      ? {
          ...alternatives.find((a) => a.description === maxKey),
          count: count[maxKey],
        }
      : undefined;

  return {
    result: {
      status,
      winners: winner ? [winner] : undefined,
    },
    thr,
    seats,
    voteCount: inputVotes.length,
    blankVoteCount: count['blank'],
    useStrict,
    log: count,
  };
};

export default calculateWinnerUsingNormal;
