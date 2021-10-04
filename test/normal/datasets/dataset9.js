const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.NORMAL,
  useStrict: true,
  alternatives: ['Utvalg', 'Ikke Utvalg'],
  priorities: [
    {
      priority: ['Utvalg'],
      amount: 100,
    },
    {
      priority: ['Ikke Utvalg'],
      amount: 40,
    },
    {
      priority: [],
      amount: 10,
    },
  ],
};
