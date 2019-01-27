module.exports = [
  refs => ({
    model: () => require('../../app/models/alternative'),
    refName: 'alternatives',
    entities: [{
      refName: 'primary',
      data: {
        description: 'test alternative',
        election: refs.elections.primary._id,
      }
    }]
  })
];
