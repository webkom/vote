const ElectionTypes = require('../../../app/models/utils');
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Ja', 'Nei'],
  priorities: [
    {
      priority: ['Ja'],
      amount: 87,
    },
    {
      priority: ['Nei'],
      amount: 45,
    },
    {
      priority: [],
      amount: 12,
    },
  ],
};
