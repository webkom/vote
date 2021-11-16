const ElectionTypes = require('../../../app/models/utils');
module.exports = {
  seats: 1,
  type: ElectionTypes.STV,
  useStrict: true,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 21,
    },
    {
      priority: ['B'],
      amount: 10,
    },
  ],
};
