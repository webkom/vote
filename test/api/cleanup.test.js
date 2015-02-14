var mongoose = require('mongoose');
var helpers = require('./helpers');

before(function(done) {
    mongoose.connection.on('connected', done);
});

beforeEach(function() {
    return helpers.clearCollections();
});

/**
 * Drop the database after running all tests
 */
after(function(done) {
    helpers.dropDatabase(done);
});
