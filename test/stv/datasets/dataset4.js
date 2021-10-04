// Dataset from "Created ourselves"
const ElectionTypes = require('../../../app/models/utils.js');
module.exports = {
  seats: 1,
  type: ElectionTypes.STV,
  alternatives: ['Bent Høye', 'Siv Jensen', 'Erna Solberg'],
  priorities: [
    {
      priority: ['Erna Solberg'],
      amount: 24,
    },
    {
      priority: ['Erna Solberg', 'Siv Jensen'],
      amount: 64,
    },
    {
      priority: ['Bent Høye'],
      amount: 51,
    },
    {
      priority: ['Bent Høye', 'Erna Solberg'],
      amount: 21,
    },
    {
      priority: ['Siv Jensen', 'Erna Solberg', 'Bent Høye'],
      amount: 18,
    },
    {
      priority: ['Siv Jensen', 'Erna Solberg'],
      amount: 26,
    },
  ],
};
