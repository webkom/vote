const ElectionTypes = require('../../../app/models/utils');
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Andrea', 'Carter', 'Brad'],
  priorities: [
    {
      priority: ['Andrea'],
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
    {
      priority: [],
      amount: 15,
    },
  ],
};
