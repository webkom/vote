module.exports = {
  seats: 1,
  alternatives: ['A', 'B'],
  priorities: [
    {
      priority: ['A'],
      amount: 23,
    },
    {
      priority: ['B'],
      amount: 39,
    },
    {
      priority: ['A', 'B'],
      amount: 47,
    },
    {
      priority: ['B', 'A'],
      amount: 33,
    },
    {
      priority: [],
      amount: 11,
    },
  ],
};
