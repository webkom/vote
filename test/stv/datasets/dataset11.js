const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.STV,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 10,
    },
    {
      priority: ['B'],
      amount: 7,
    },
    {
      priority: [],
      amount: 7,
    },
  ],
};
