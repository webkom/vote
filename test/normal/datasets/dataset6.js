import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  type: ElectionTypes.NORMAL,
  alternatives: ['Ja', 'Nei'],
  priorities: [
    {
      priority: ['Ja'],
      amount: 65,
    },
    {
      priority: ['Nei'],
      amount: 53,
    },
    {
      priority: [],
      amount: 12,
    },
  ],
};
