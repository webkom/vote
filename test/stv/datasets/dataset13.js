module.exports = {
  alternatives: ['Bytte', 'Fjerne'],
  useStrict: true,
  priorities: [
    {
      priority: ['Bytte'],
      amount: 28,
    },
    {
      priority: ['Fjerne'],
      amount: 56,
    },
    {
      priority: ['Bytte', 'Fjerne'],
      amount: 11,
    },
    {
      priority: ['Fjerne', 'Bytte'],
      amount: 37,
    },
    {
      priority: [],
      amount: 23,
    },
  ],
};
