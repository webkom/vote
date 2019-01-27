const helpers = require('../helpers');

module.exports = [
  refs => ({
    model: () => require('../../app/models/user'),
    refName: 'users',
    entities: [{
      refName: 'primary',
      data: helpers.testUser
    }, {
      refName: 'primary',
      data: helpers.adminUser
    }]
  })
];
