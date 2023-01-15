import { ElectionSystems as ElectionTypes } from '../../../app/types/types';
module.exports = {
  type: ElectionTypes.NORMAL,
  useStrict: true,
  alternatives: ['Ny Struktur', 'Gammel Struktur'],
  priorities: [
    {
      priority: ['Ny Struktur'],
      amount: 123,
    },
    {
      priority: ['Gammel Struktur'],
      amount: 40,
    },
    {
      priority: [],
      amount: 10,
    },
  ],
};
