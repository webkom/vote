// Dataset created to show floating point errors
import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
export default {
  seats: 2,
  type: ElectionTypes.STV,
  alternatives: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  priorities: [
    {
      priority: ['B'],
      amount: 40,
    },
    {
      priority: ['C'],
      amount: 40,
    },
    {
      priority: ['D'],
      amount: 40,
    },
    {
      priority: ['A', 'B'],
      amount: 30,
    },
    {
      priority: ['A', 'C'],
      amount: 30,
    },
    {
      priority: ['A', 'E', 'D'],
      amount: 17,
    },
    {
      priority: ['A', 'F', 'D', 'G'],
      amount: 6,
    },
    {
      priority: ['A', 'F', 'D', 'H'],
      amount: 7,
    },
  ],
};

/** This dataset is specially created in order to get floating point errors that causes
 * two candidates to have the same low value.
 *
 * =============================================================================
 *
 * So with the test above there are 2 seats and a total of 210 votes.
 *
 * This will give a quota of Floor(210/(2+1)) + 1 which is 71
 *
 * =============================================================================
 *
 * When adding up the multiple fractions created above the result should be that the
 * 3 bottom candidates 'B', 'C' and 'D' at some point should have 46.33333333333326
 *
 * Therefore it's important that this case ensures that all 3 candidates are treated
 * equal at this iteration.
 *
 * At the point above (iteration 5), all candidates have the same score, and we
 * must issue a "TIE". But before we abort the election and return UNRESOLVED we
 * can use backtracking to check if the election ever had a state where the
 * candidates had unequal score. This is the Scottish STV method for breaking TIES.
 *
 * In this case we iterate backward and find that one iteration back the score
 * looked like this:
    counts: {
      B: 46.3333,
      C: 46.3333,
      D: 42.7444,
      E: 3.5889,
    },
 * Therefore, according to the algorithm, D can be eliminated with a score of 42.7
 */
