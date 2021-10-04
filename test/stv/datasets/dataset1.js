// Dataset from https://en.wikipedia.org/wiki/Droop_quota
const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  seats: 2,
  type: ElectionTypes.STV,
  alternatives: ['Andrea', 'Carter', 'Brad'],
  priorities: [
    {
      priority: ['Andrea', 'Carter'],
      amount: 45,
    },
    {
      priority: ['Carter'],
      amount: 25,
    },
    {
      priority: ['Brad'],
      amount: 30,
    },
  ],
};
