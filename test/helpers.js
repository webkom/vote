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

const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
const testUser = (exports.testUser = {
  username: 'testuser',
  cardKey: '99TESTCARDKEY',
  hash
});

const adminUser = (exports.adminUser = {
  username: 'admin',
  admin: true,
  cardKey: '55TESTCARDKEY',
  hash
});

exports.createUsers = () => User.create([testUser, adminUser]);
