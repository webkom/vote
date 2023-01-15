import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  seats: 1,
  type: ElectionTypes.STV,
  useStrict: true,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 10,
    },
    {
      priority: ['B'],
      amount: 10,
    },
  ],
};
