import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
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
