/** Types used in this file
 * type STV = {
 *   result: STVResult;
 *   log: STVEvent[];
 *   thr: number;
 * };
 *
 * type Alternative = {
 *   _id: string;
 *   description: string;
 *   election: string;
 * };
 *
 * type Vote = {
 *   _id: string;
 *   priorities: Alternative[];
 *   hash: string;
 *   weight: number;
 * };
 *
 * type STVEvent =
 *   | {
 *       action: 'ITERATION';
 *       iteration: number;
 *       winners: Alternative[];
 *       alternatives: Alternative[];
 *       votes: Vote[];
 *       counts: { [key: string]: number };
 *     }
 *   | {
 *       action: 'WIN';
 *       alternative: Alternative;
 *       voteCount: number;
 *     }
 *   | {
 *       action: 'ELIMINATE';
 *       alternative: Alternative;
 *       minScore: number;
 *     }
 *   | {
 *       action: 'RANDOMELIMINATE';
 *       alternative: Alternative;
 *       minScore: number;
 *     }
 *   | {
 *       action: 'TIE';
 *       description: string;
 *     };
 * type STVResult =
 *   | {
 *       status: 'RESOLVED';
 *       winners: Alternative[];
 *     }
 *   | {
 *       status: 'UNRESOLVED';
 *       winners: Alternative[];
 *     };
 */

/**
 * The Droop qouta https://en.wikipedia.org/wiki/Droop_quota
 * @param { Vote[] } votes - All votes for the election
 * @param { int } seats - The number of seats in this election
 *
 * @return { int } The amount votes needed to be elected
 */
const winningThreshold = (votes, seats) => {
  return Math.floor(votes.length / (seats + 1) + 1);
};

// Epsilon value used in comparisons of floating point errors. See dataset5.js.
const EPSILON = 0.000001;

/**
 * Will calculate the election result using Single Transferable Vote
 * @param { Vote[] } votes - All votes for the election
 * @param { Alternative[] } alternatives - All possible alternatives for the election
 * @param { int } seats - The number of seats in this election
 *
 * @return { SVT } The full election, including result, log and threshold value
 */
exports.calculateWinnerUsingSTV = (votes, alternatives, seats) => {
  // @let { SVTEvent[] } log - Will hold the log for the entire election
  let log = [];

  // Stringify and clean the votes
  votes = votes.map((vote) => ({
    _id: String(vote._id),
    priorities: JSON.parse(JSON.stringify(vote.priorities)),
    hash: vote.hash,
    weight: 1,
  }));

  // Stingify and clean the alternatives
  alternatives = JSON.parse(JSON.stringify(alternatives));

  // @const { int } thr - The threshold value needed to win
  const thr = winningThreshold(votes, seats);

  // @let { Alternative[] } winners - Winners for the election
  let winners = [];

  // @let { int } iteration - The election is a while loop, and with each iteration
  // we count the number of first place votes each candidate has.
  let iteration = 0;
  while (votes.length > 0) {
    iteration += 1;

    // Remove empty votes, this happens after the threshold is calculated
    // in order to preserve "blank votes"
    votes = votes.filter((vote) => vote.priorities.length > 0);

    // @let { [key: string]: float } counts - Dict with the counts for each candidate
    let counts = {};

    for (let i in votes) {
      // @const { Vote } vote - The vote for this loop
      const vote = JSON.parse(JSON.stringify(votes[i]));

      // @const { Alternative } currentAlternative - We always count the first value (priorities[0])
      // because there is a mutation step that removed values that are "done". These are values
      // connected to candidates that have either won or been eliminated from the election.
      const currentAlternative = JSON.parse(JSON.stringify(vote.priorities[0]));

      // Use the alternatives description as key in the counts, and add one for each count
      counts[currentAlternative.description] =
        vote.weight + (counts[currentAlternative.description] || 0);
    }

    // Push Iteration to log
    log.push({
      action: 'ITERATION',
      iteration,
      winners: winners.slice(),
      // TODO Find a better way to this, the test assertions are slow AF with this
      //alternatives: alternatives.slice(),
      //votes: votes.slice(),
      counts: handleFloatsInOutput(counts),
    });

    // @let { [key: string]: {} } roundWinner - Dict of winners
    let roundWinners = {};
    // @let { [key: string]: float } excessFractions - Dict of excess fractions per key
    let excessFractions = {};
    // @let { [key: string]: {} } doneVotes - Dict of done votes
    let doneVotes = {};

    // Loop over the different alternatives
    for (let i in alternatives) {
      // @const { Alternative } alternative - Get an alternative
      const alternative = JSON.parse(JSON.stringify(alternatives[i]));
      // @const { float } voteCount - Find the number number of votes for this alternative
      const voteCount = counts[alternative.description] || 0;

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
        log.push({
          action: 'WIN',
          alternative,
          voteCount: Number(voteCount.toFixed(4)),
        });

        // Find the done Votes
        for (let i in votes) {
          // @const { Vote } vote - The vote for this loop
          const vote = JSON.parse(JSON.stringify(votes[i]));

          // Votes that have the winning alternative as their first pick
          if (vote.priorities[0]._id === alternative._id) doneVotes[i] = {};
        }
      }
    }

    // @let { [key: string]: {} } doneAlternatives - Have won or been eliminated
    let doneAlternatives = {};

    // @let { Vote[] } nextRoundVotes - The votes that will go on to the next round
    let nextRoundVotes = [];

    // If there are new winners this round
    if (Object.keys(roundWinners).length > 0) {
      // Check STV can terminate and return the RESOLVED winners
      if (winners.length === seats) {
        return {
          result: { status: 'RESOLVED', winners },
          log,
          thr,
        };
      }

      // Set the done alternatives as the roundwinners
      doneAlternatives = roundWinners;

      // The next rounds votes are votes that are not done.
      nextRoundVotes = votes.filter((_, i) => !doneVotes[i]);

      // Go through all done votes
      for (let i in doneVotes) {
        // @const { Vote } vote - The vote for this loop
        const vote = JSON.parse(JSON.stringify(votes[i]));

        // @const { Alternative } alternative - Take the first choice of the done vote
        const alternative = JSON.parse(JSON.stringify(vote.priorities[0]));

        // @const { float } fraction - Find the excess fraction for this alternative
        const fraction = excessFractions[alternative._id] || 0;

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
      const minScore = Math.min(
        ...alternatives.map(
          (alternative) => counts[alternative.description] || 0
        )
      );

      // Find the candidates with the lowest score
      const minAlternatives = alternatives.filter(
        (alternative) =>
          (counts[alternative.description] || 0) <= minScore + EPSILON
      );

      // There is a tie for eliminating candidates. Per Scottish STV we must look at the previous rounds
      if (minAlternatives.length > 1) {
        let reverseIteration = iteration;
        log.push({
          action: 'TIE',
          description: `There are ${
            minAlternatives.length
          } candidates with a score of ${Number(
            minScore.toFixed(4)
          )} at iteration ${reverseIteration}`,
        });

        // If the minScore is 0 we eliminate a random candidate as Scottish STV specifies
        // This is only done in the low case of 0, and we would rather return an unresolved
        // election if the TIE cannot be solved by backtracking.
        if (minScore === 0) {
          const randomAlternative =
            minAlternatives[Math.floor(Math.random() * minAlternatives.length)];
          log.push({
            action: 'RANDOMELIMINATE',
            alternative: randomAlternative,
            minScore: Number(minScore.toFixed(4)),
          });
          doneAlternatives[randomAlternative._id] = {};
        } else {
          while (reverseIteration > 0) {
            // If we are at iteartion one with a tie
            if (reverseIteration === 1) {
              // There is nothing we can do
              log.push({
                action: 'TIE',
                description:
                  'The backward checking went to iteration 1 without breaking the tie',
              });
              return {
                result: { status: 'UNRESOLVED', winners },
                log,
                thr,
              };
            }
            // If we are not at iteration one we can enumerate backwards to see if we can find a diff
            else {
              reverseIteration--;
              // Find the log object for the last iteration
              const logObject = log.find(
                (entry) => entry.iteration === reverseIteration
              );

              // Find the lowest score (with regard to the alternatives in the actual iteration)
              const iterationMinScore = Math.min(
                ...minAlternatives.map((a) => logObject.counts[a.description])
              );

              // Find the candidates (in regard to the actual iteration) that has the lowest score
              const iterationMinAlternatives = minAlternatives.filter(
                (alternative) =>
                  (logObject.counts[alternative.description] || 0) <=
                  iterationMinScore + EPSILON
              );

              // If there is a tie at this iteration as well we must continue the loop
              if (iterationMinAlternatives.length > 1) continue;

              // There is only one candidate with the lowest score
              const minAlternative = iterationMinAlternatives[0];
              if (minAlternative) {
                log.push({
                  action: 'ELIMINATE',
                  alternative: minAlternative,
                  minScore: Number(iterationMinScore.toFixed(4)),
                });
                doneAlternatives[minAlternative._id] = {};
              }
              break;
            }
          }
        }
      } else {
        // There is only one candidate with the lowest score
        const minAlternative = minAlternatives[0];
        if (minAlternative) {
          log.push({
            action: 'ELIMINATE',
            alternative: minAlternative,
            minScore: Number(minScore.toFixed(4)),
          });
          doneAlternatives[minAlternative._id] = {};
        }
      }

      // ==================================================================================
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
    result: { status: 'UNRESOLVED', winners },
    log,
    thr,
  };
};

// Round floats to fixed in output
const handleFloatsInOutput = (obj) => {
  let newObj = {};
  Object.entries(obj).forEach(([k, v]) => (newObj[k] = Number(v.toFixed(4))));
  return newObj;
};
