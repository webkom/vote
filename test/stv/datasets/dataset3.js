// Dataset from https://www.iiconsortium.org/Single_Transferable_Vote.pdf
import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  seats: 5,
  type: ElectionTypes.STV,
  alternatives: [
    'STEWART',
    'VINE',
    'AUGUSTINE',
    'COHEN',
    'LENNON',
    'EVANS',
    'WILCOCKS',
    'HARLEY',
    'PEARSON',
  ],
  priorities: [
    {
      priority: ['STEWART', 'AUGUSTINE'],
      amount: 66,
    },
    {
      priority: ['VINE'],
      amount: 48,
    },
    {
      priority: ['AUGUSTINE'],
      amount: 95,
    },
    {
      priority: ['COHEN'],
      amount: 55,
    },
    {
      priority: ['LENNON'],
      amount: 4,
    },
    {
      priority: ['LENNON', 'STEWART', 'AUGUSTINE'],
      amount: 46,
    },
    {
      priority: ['LENNON', 'VINE'],
      amount: 6,
    },
    {
      priority: ['LENNON', 'COHEN'],
      amount: 2,
    },
    {
      priority: ['EVANS', 'VINE'],
      amount: 80,
    },
    {
      priority: ['EVANS', 'COHEN'],
      amount: 36,
    },
    {
      priority: ['EVANS', 'PEARSON', 'VINE'],
      amount: 16,
    },
    {
      priority: ['EVANS', 'STEWART', 'AUGUSTINE'],
      amount: 8,
    },
    {
      priority: ['EVANS', 'HARLEY'],
      amount: 4,
    },
    {
      priority: ['WILCOCKS'],
      amount: 5,
    },
    {
      priority: ['WILCOCKS', 'AUGUSTINE'],
      amount: 32,
    },
    {
      priority: ['WILCOCKS', 'HARLEY'],
      amount: 15,
    },
    {
      priority: ['WILCOCKS', 'VINE'],
      amount: 7,
    },
    {
      priority: ['WILCOCKS', 'COHEN'],
      amount: 1,
    },
    {
      priority: ['HARLEY'],
      amount: 91,
    },
    {
      priority: ['PEARSON'],
      amount: 3,
    },
    {
      priority: ['PEARSON', 'STEWART', 'AUGUSTINE'],
      amount: 1,
    },
    {
      priority: ['PEARSON', 'VINE'],
      amount: 19,
    },
    {
      priority: ['PEARSON', 'AUGUSTINE'],
      amount: 1,
    },
    {
      priority: ['PEARSON', 'COHEN'],
      amount: 5,
    },
    {
      priority: ['PEARSON', 'HARLEY'],
      amount: 1,
    },
  ],
};
