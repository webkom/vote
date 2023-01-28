// Dataset from https://en.wikipedia.org/wiki/Single_transferable_vote
import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
export default {
  seats: 3,
  type: ElectionTypes.STV,
  alternatives: ['Orange', 'Pear', 'Chocolate', 'Strawberry', 'Hamburger'],
  priorities: [
    {
      priority: ['Orange'],
      amount: 4,
    },
    {
      priority: ['Pear', 'Orange'],
      amount: 2,
    },
    {
      priority: ['Chocolate', 'Strawberry'],
      amount: 8,
    },
    {
      priority: ['Chocolate', 'Hamburger'],
      amount: 4,
    },
    {
      priority: ['Strawberry'],
      amount: 1,
    },
    {
      priority: ['Hamburger'],
      amount: 1,
    },
  ],
};
