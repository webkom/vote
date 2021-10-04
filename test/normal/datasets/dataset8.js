const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  type: ElectionTypes.NORMAL,
  useStrict: true,
  alternatives: ['Ny Struktur', 'Gammel Struktur'],
  priorities: [
    {
      priority: ['Ny Struktur'],
      amount: 123,
    },
    {
      priority: ['Gammel Struktur'],
      amount: 40,
    },
    {
      priority: [],
      amount: 10,
    },
  ],
};
