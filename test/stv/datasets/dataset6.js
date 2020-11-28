// Dataset created to show floating point errors
module.exports = {
  seats: 2,
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
 * So with the test above there are 2 seats and a total of 21 votes.
 *
 * This will give a quota of Floor(21/(2+1)) + 1 which is 8
 *
 * =============================================================================
 *
 * When adding up the multiple fractions creaded above the result should be that the
 * 3 bottom candidates 'B', 'C' and 'D' at some point should have 46.33333333333326
 *
 * Therefore it's important that this case ensures that all 3 candidates are treated
 * equal at this point in the iterations.
 */
