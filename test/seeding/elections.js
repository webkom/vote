module.exports = [
  () => ({
    model: () => require('../../app/models/election'),
    refName: 'elections',
    entities: [{
      refName: 'primary',
      data: {
        title: 'activeElection1',
        description: 'active election 1',
        active: true
      }
    }]
  })
];
