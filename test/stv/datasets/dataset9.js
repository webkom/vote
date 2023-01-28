import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
export default {
  seats: 1,
  type: ElectionTypes.STV,
  useStrict: true,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 20,
    },
    {
      priority: ['B'],
      amount: 10,
    },
  ],
};
