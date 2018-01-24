const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const Alternative = require('../app/models/alternative');
const Election = require('../app/models/election');
const Vote = require('../app/models/vote');
const User = require('../app/models/user');

exports.dropDatabase = () =>
  mongoose.connection.dropDatabase().then(() => mongoose.disconnect());

exports.clearCollections = () =>
  Bluebird.map([Alternative, Election, Vote, User], collection =>
    collection.remove()
  );
