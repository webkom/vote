import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
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
