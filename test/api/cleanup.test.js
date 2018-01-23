const mongoose = require('mongoose');
const helpers = require('../helpers');

before(done => {
  mongoose.connection.on('connected', done);
});

beforeEach(() => helpers.clearCollections());

/**
 * Drop the database after running all tests
 */
after(() => helpers.dropDatabase());
