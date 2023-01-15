import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  type: ElectionTypes.NORMAL,
  useStrict: true,
  alternatives: ['Ja', 'Nei'],
  priorities: [
    {
      priority: ['Ja'],
      amount: 117,
    },
    {
      priority: ['Nei'],
      amount: 48,
    },
    {
      priority: [],
      amount: 17,
    },
  ],
};
