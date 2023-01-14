import cloneDeep from 'lodash/cloneDeep';
import { Status, Vote, Alternative, ElectionResult, Count } from './types';
import { PopulatedVote, AlternativeType } from '../../app/types/types';

enum Action {
  iteration = 'ITERATION',
  win = 'WIN',
  eliminate = 'ELIMINATE',
  multi_tie_eliminations = 'MULTI_TIE_ELIMINATIONS',
  tie = 'TIE',
}

export type STVEvent = {
  action: Action;
  iteration?: number;
  winners?: Alternative[];
  counts?: { [key: string]: number };
  alternative?: Alternative;
  alternatives?: Alternative[];
  voteCount?: number;
  minScore?: number;
  description?: string;
};

interface STVEventIteration extends STVEvent {
  action: Action.iteration;
  iteration: number;
  winners: Alternative[];
  counts: { [key: string]: number };
}

interface STVEventWin extends STVEvent {
  action: Action.win;
  alternative: Alternative;
  voteCount: number;
}

interface STVEventEliminate extends STVEvent {
  action: Action.eliminate;
  alternative: Alternative;
  minScore: number;
}

interface STVEventTie extends STVEvent {
  action: Action.tie;
  description: string;
}

interface STVEventMulti extends STVEvent {
  action: Action.multi_tie_eliminations;
  alternatives: Alternative[];
  minScore: number;
}

/**
 * The Droop qouta https://en.wikipedia.org/wiki/Droop_quota
 * @param votes - All votes for the election
 * @param seats - The number of seats in this election
 * @param useStrict - Sets the threshold to 67% no matter what
 *
 * @return The amount votes needed to be elected
 */
const winningThreshold = (
  votes: Vote[],
  seats: number,
  useStrict: boolean
): number => {
  if (useStrict) {
    return Math.floor((2 * votes.length) / 3) + 1;
  }
  return Math.floor(votes.length / (seats + 1) + 1);
};

// Epsilon value used in comparisons of floating point errors. See dataset5.js.
const EPSILON = 0.000001;

/**
 * Will calculate the election result using Single Transferable Vote
 * @param votes - All votes for the election
 * @param alternatives - All possible alternatives for the election
 * @param seats - The number of seats in this election. Default 1
 * @param useStrict - This election will require a qualified majority. Default false
 *
 * @return The full election, including result, log and threshold value
 */
const calculateWinnerUsingSTV = (
  inputVotes: PopulatedVote[],
  inputAlternatives: AlternativeType[],
  seats = 1,
  useStrict = false
): ElectionResult => {
  // Hold the log for the entire election
  const log: STVEvent[] = [];

  // Stringify and clean the votes
  let votes: Vote[] = inputVotes.map((vote) => ({
    _id: String(vote._id),
    priorities: vote.priorities.map((vote) => ({
      _id: String(vote._id),
      description: vote.description,
      election: String(vote._id),
    })),
    hash: vote.hash,
    weight: 1,
  }));

  // Stringify and clean the alternatives
  let alternatives: Alternative[] = inputAlternatives.map((alternative) => ({
    _id: String(alternative._id),
    description: alternative.description,
    election: String(alternative._id),
  }));

  // The threshold value needed to win
  const thr: number = winningThreshold(votes, seats, useStrict);

  // The number of blank votes
  const blankVoteCount = inputVotes.filter(
    (vote) => vote.priorities.length === 0
  ).length;

  // Winners for the election
  const winners: Alternative[] = [];

  // With each iteration we count the number of first place votes each candidate has.
  let iteration = 0;
  while (votes.length > 0 && iteration < 100) {
    iteration += 1;

    // Remove empty votes after threshold in order to preserve "blank votes"
    votes = votes.filter((vote: Vote) => vote.priorities.length > 0);

    // Dict with the counts for each candidate
    const counts: Count = alternatives.reduce(
      (counts: Count, alternative: Alternative) => ({
        ...counts,
        [alternative.description]: 0,
      }),
      {}
    );

    for (const i in votes) {
      // The vote for this loop
      const vote = cloneDeep(votes[i]);

      // We always count the first value (priorities[0]) because there is a mutation step
      // that removes values that are "done". These are values connected to candidates
      // that have either won or been eliminated from the election.
      const currentAlternative = cloneDeep(vote.priorities[0]);

      // Use the alternatives description as key in the counts, and add one for each count
      counts[currentAlternative.description] =
        vote.weight + (counts[currentAlternative.description] || 0);
    }

    // Push Iteration to log
    const iterationLog: STVEventIteration = {
      action: Action.iteration,
      iteration,
      winners: winners.slice(),
      counts: handleFloatsInOutput(counts),
    };
    log.push(iterationLog);

    // Dict of winners
    const roundWinners: { [key: string]: Record<string, never> } = {};
    // Dict of excess fractions per key
    const excessFractions: { [key: string]: number } = {};
    // Dict of done votes
    const doneVotes: { [key: number]: Record<string, never> } = {};

    // Loop over the different alternatives
    for (const i in alternatives) {
      // Get an alternative
      const alternative: Alternative = cloneDeep(alternatives[i]);
      // Find the number of votes for this alternative
      const voteCount: number = counts[alternative.description] || 0;

      // If an alternative has enough votes, add them as round winner
      // Due to JavaScript float precision errors this voteCount is checked with a range
      if (voteCount >= thr - EPSILON) {
        // Calculate the excess fraction of votes, above the threshold
        excessFractions[alternative._id] = (voteCount - thr) / voteCount;

        // Add the alternatives ID to the dict of winners this round
        roundWinners[alternative._id] = {};

        // Push the whole alternative to the list of new winners
        winners.push(alternative);

        // Add the WIN action to the iteration log
        const winLog: STVEventWin = {
          action: Action.win,
          alternative,
          voteCount: Number(voteCount.toFixed(4)),
        };
        log.push(winLog);

        // Find the done Votes
        for (const i in votes) {
          // The vote for this loop
          const vote: Vote = cloneDeep(votes[i]);

          // Votes that have the winning alternative as their first pick
          if (vote.priorities[0]._id === alternative._id) doneVotes[i] = {};
        }
      }
    }

    // Have won or been eliminated
    let doneAlternatives: { [key: string]: Record<string, never> } = {};

    // The votes that will go on to the next round
    let nextRoundVotes: Vote[] = [];

    // If there are new winners this round
    if (Object.keys(roundWinners).length > 0) {
      // Check STV can terminate and return the RESOLVED winners
      if (winners.length === seats) {
        return {
          result: { status: Status.resolved, winners },
          log,
          thr,
          seats,
          voteCount: inputVotes.length,
          blankVoteCount,
          useStrict,
        };
      }

      // Set the done alternatives as the roundwinners
      doneAlternatives = roundWinners;

      // The next rounds votes are votes that are not done.
      nextRoundVotes = votes.filter((_, i) => !doneVotes[i]);

      // Go through all done votes
      for (const i in doneVotes) {
        // The vote for this loop
        const vote: Vote = cloneDeep(votes[i]);

        // Take the first choice of the done vote
        const alternative: Alternative = cloneDeep(vote.priorities[0]);

        // Find the excess fraction for this alternative
        const fraction: number = excessFractions[alternative._id] || 0;

        // If the fraction is 0 (meaning no votes should be transferred) or if the vote
        // has no more priorities (meaning it's exhausted) we can continue without transfer
        if (fraction === 0 || vote.priorities.length === 1) continue;

        // Fractional transfer. We mutate the weight for these votes by a fraction
        vote['weight'] = vote.weight * fraction;
        // Push the mutated votes to the list of votes to be processed in the next iteration
        nextRoundVotes.push(vote);
      }
    } else {
      // Find the lowest score
      const minScore: number = Math.min(
        ...alternatives.map(
          (alternative) => counts[alternative.description] || 0
        )
      );

      // Find the candidates with the lowest score
      const minAlternatives: Alternative[] = alternatives.filter(
        (alternative) =>
          (counts[alternative.description] || 0) <= minScore + EPSILON
      );

      // There is a tie for eliminating candidates. Per Scottish STV we must look at the previous rounds
      if (minAlternatives.length > 1) {
        let reverseIteration = iteration;

        // Log the Tie
        const tieObject: STVEventTie = {
          action: Action.tie,
          description: `There are ${
            minAlternatives.length
          } candidates with a score of ${Number(
            minScore.toFixed(4)
          )} at iteration ${reverseIteration}`,
        };
        log.push(tieObject);

        // As long as the reverseIteration is larger than 1 we can look further back
        while (reverseIteration >= 1) {
          // Find the log object for the last iteration
          const logObject: STVEvent = log.find(
            (entry: STVEventIteration) => entry.iteration === reverseIteration
          );

          // Find the lowest score (with regard to the alternatives in the actual iteration)
          const iterationMinScore = Math.min(
            ...minAlternatives.map((a) => logObject.counts[a.description] || 0)
          );

          // Find the candidates (in regard to the actual iteration) that has the lowest score
          const iterationMinAlternatives = minAlternatives.filter(
            (alternative: Alternative) =>
              (logObject.counts[alternative.description] || 0) <=
              iterationMinScore + EPSILON
          );

          // If we are at iteration lvl 1 and there is still a tie we cannot do anything
          if (reverseIteration === 1 && iterationMinAlternatives.length > 1) {
            const backTrackFailed: STVEventTie = {
              action: Action.tie,
              description:
                'The backward checking went to iteration 1 without breaking the tie',
            };
            log.push(backTrackFailed);

            // Eliminate all candidates that are in the last iterationMinAlternatives
            const multiTieElem: STVEventMulti = {
              action: Action.multi_tie_eliminations,
              alternatives: iterationMinAlternatives,
              minScore: Number(minScore.toFixed(4)),
            };
            log.push(multiTieElem);
            iterationMinAlternatives.forEach(
              (alternative) => (doneAlternatives[alternative._id] = {})
            );
            break;
          }

          reverseIteration--;
          // If there is a tie at this iteration as well we must continue the loop
          if (iterationMinAlternatives.length > 1) continue;
          // There is only one candidate with the lowest score
          const minAlternative = iterationMinAlternatives[0];
          if (minAlternative) {
            const elem: STVEventEliminate = {
              action: Action.eliminate,
              alternative: minAlternative,
              minScore: Number(iterationMinScore.toFixed(4)),
            };
            log.push(elem);
            doneAlternatives[minAlternative._id] = {};
          }
          break;
        }
      } else {
        // There is only one candidate with the lowest score
        const minAlternative = minAlternatives[0];
        if (minAlternative) {
          const elemLowest: STVEventEliminate = {
            action: Action.eliminate,
            alternative: minAlternative,
            minScore: Number(minScore.toFixed(4)),
          };
          log.push(elemLowest);
          doneAlternatives[minAlternative._id] = {};
        }
      }
      nextRoundVotes = votes;
    }

    // We filter out the alternatives of the doneAlternatives from the list of nextRoundVotes
    votes = nextRoundVotes.map((vote) => {
      vote['priorities'] = vote.priorities.filter(
        (alternative) => !doneAlternatives[alternative._id]
      );
      return vote;
    });
    // Remove the alternatives that are done
    alternatives = alternatives.filter(
      (alternative) => !doneAlternatives[alternative._id]
    );
  }
  return {
    result: { status: Status.unresolved, winners },
    log,
    thr,
    seats,
    voteCount: inputVotes.length,
    blankVoteCount,
    useStrict,
  };
};

// Round floats to fixed in output
const handleFloatsInOutput = (obj: unknown) => {
  const newObj = {};
  Object.entries(obj).forEach(([k, v]) => (newObj[k] = Number(v.toFixed(4))));
  return newObj;
};

export default calculateWinnerUsingSTV;
