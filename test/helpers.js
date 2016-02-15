var _ = require('lodash');
var Bluebird = require('bluebird');
var mongoose = require('mongoose');

exports.dropDatabase = function(done) {
    mongoose.connection.db.dropDatabase(function(err) {
        if (err) return done(err);
        mongoose.connection.close(done);
    });
};

exports.clearCollections = function() {
    var collections = _.values(mongoose.connection.collections);
    return Bluebird.map(collections, function(collection) {
        return collection.remove();
    });
};
