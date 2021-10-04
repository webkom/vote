const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  seats: 1,
  type: ElectionTypes.STV,
  useStrict: true,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 11,
    },
    {
      priority: ['B'],
      amount: 10,
    },
  ],
};
