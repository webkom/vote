var Bluebird = require('bluebird');
var mongoose = require('mongoose');
var Alternative = require('../app/models/alternative');
var Election = require('../app/models/election');
var Vote = require('../app/models/vote');
var User = require('../app/models/user');

exports.dropDatabase = function() {
    return mongoose.connection.dropDatabase()
      .then(function() {
          return mongoose.disconnect();
      });
};

exports.clearCollections = function() {
    return Bluebird.map([Alternative, Election, Vote, User], function(collection) {
        return collection.remove();
    });
};
