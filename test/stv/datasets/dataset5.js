import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  seats: 2,
  type: ElectionTypes.STV,
  alternatives: ['A', 'B', 'C', 'D'],
  priorities: [
    {
      priority: ['B'],
      amount: 7,
    },
    {
      priority: ['C'],
      amount: 4,
    },
    {
      priority: ['D'],
      amount: 3,
    },
    {
      priority: ['A', 'B'],
      amount: 3,
    },
    {
      priority: ['A', 'C', 'B'], // (*)
      amount: 3,
    },
    {
      priority: ['A', 'D', 'B'], // (*)
      amount: 3,
    },
  ],
};

/** This dataset is specially created in order to get floating point errors that causes
 * a candidate to not reach the quota. They are actually very common, but can be hard
 * to spot. Therefore it's important that test cases like the one above passes
 *
 * =============================================================================
 *
 * So with the test above there are 2 seats and a total of 23 votes.
 *
 * This will give a quota of Floor(23/(2+1)) + 1 which is 8
 *
 * =============================================================================
 *
 * The iterations below is what will happen if floating point errors are not handled
 *
 * ITERATION 1)
 * The counts are as follows {A: 9, B: 7, C: 4, D: 3 }
 * 'A' has a voteCount of 9.000 and will be a winner right away.
 *
 * ITERATION 2)
 * The counts are as follows { B: 7.333333333333332, C: 4.333333333333332, D: 3.3333333333333335 }
 * Looks correct? Yeah, B,C and D has gotten 1/3 of the 1 excess vote 'A' had.
 * None have reached the quota, so the candidate with the lowest score is eliminated.
 *
 * ITERATION 3)
 * The counts are now as follows { B: 7.666666666666664, C: 4.333333333333332 }
 * Again this looks correct? 'B' has gotten the 1/3 vote given from 'A' to 'D'
 * None have reached the quota, so the candidate with the lowest score is eliminated.
 *
 * ITERATION 4)
 * The counts are as follows { B: 7.9999999999999964 }
 * Hmmmmm? B gets 7.99..964. So B has gotten the final 1/3 of the excess 'A' vote.
 *
 * But B has NOT reached the quota, as the quota is 8... This is where the floating point
 * errors can cause trouble. Even tho 'A' had 1 whole excess vote it was split into tree
 * parts and given to 'B', 'C' and 'D'. As the election plays out it becomes apparent that
 * 'C' and 'D' cannot win, and that 1/3 vote passes to 'B', which is next in line (see (*))
 *
 * Summing up the votes should give (1/3 + 1/3 + 1/3) == 1 should give, but this is not the case.
 *
 * ITERATION 5)
 * Election is UNRESOLVED and end with only 'A' winning, even though 'B' also reached the quota
 *
 * =============================================================================
 *
 * Conclusion: So the iterations above will still happen with our Implementation of STV,
 * but we have countered this by using an EPSILON value with each comparison. The EPSILON
 * is a very small value, and when added or subtracted within a comparison can mitigate
 * errors caused by floating point errors.
 *
 * This means
 * we never check
 *   if ( x > y)
 * but rather check
 *   if (x > (y - EPSILON))
 */
