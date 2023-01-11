import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
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
