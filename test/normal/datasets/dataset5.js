const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Ja', 'Nei'],
  priorities: [
    {
      priority: ['Ja'],
      amount: 67,
    },
    {
      priority: ['Nei'],
      amount: 56,
    },
    {
      priority: [],
      amount: 10,
    },
  ],
};
