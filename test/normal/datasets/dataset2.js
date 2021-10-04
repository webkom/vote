const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Lisa', 'Bob'],
  priorities: [
    {
      priority: ['Lisa'],
      amount: 80,
    },
    {
      priority: ['Bob'],
      amount: 45,
    },
    {
      priority: [],
      amount: 30,
    },
  ],
};
