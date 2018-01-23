const _ = require('lodash');
const Bluebird = require('bluebird');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const errors = require('../errors');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    index: true,
    required: true,
    unique: true,
    match: /^\w{5,}$/
  },
  hash: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  cardKey: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.pre('save', function(next) {
  // Usernames are case-insensitive, so store them
  // in lowercase:
  this.username = this.username.toLowerCase();
  next();
});

userSchema.methods.getCleanUser = function() {
  const user = _.omit(this.toObject(), 'password', 'hash');
  return user;
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.register = function(body, password) {
  if (!password) throw new errors.InvalidRegistrationError('Missing password');
  // The controller expects a Bluebird promise, so we wrap it in resolve:
  return Bluebird.resolve(bcrypt.genSalt())
    .then(salt => bcrypt.hash(password, salt))
    .then(hash => this.create(Object.assign(body, { hash })));
};

userSchema.statics.authenticate = function(username, password) {
  let _user;
  return this.findOne({ username })
    .then(user => {
      _user = user;
      return user.authenticate(password);
    })
    .then(result => {
      if (!result) {
        throw new errors.InvalidRegistrationError(
          'Incorrect username and/or password.'
        );
      }

      return _user;
    });
};

userSchema.methods.authenticate = function(password) {
  // The controller expects a Bluebird promise, so we wrap it in resolve:
  return Bluebird.resolve(bcrypt.compare(password, this.hash));
};

module.exports = mongoose.model('User', userSchema);
