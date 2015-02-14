var mongoose = require('mongoose');

/**
 * Drop the database after running all tests
 */
after(function(done) {
    mongoose.connection.db.dropDatabase(function(err) {
        if (err) return done(err);
        mongoose.connection.close(done);
    });
});
