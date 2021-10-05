const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Ja', 'Nei'],
  priorities: [
    {
      priority: ['Ja'],
      amount: 10,
    },
    {
      priority: ['Nei'],
      amount: 25,
    },
  ],
};
