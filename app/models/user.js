var _ = require('lodash');
var Bluebird = require('bluebird');
var bcrypt = Bluebird.promisifyAll(require('bcrypt'));
var mongoose = require('mongoose');
var errors = require('../errors');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        index: true,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]{5,}$/
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

userSchema.methods.getCleanUser = function() {
    var user = _.omit(this.toObject(), 'password', 'hash');
    return user;
};

userSchema.statics.register = function(body, password) {
    if (!password) throw new errors.InvalidRegistrationError('Missing password');
    return bcrypt.genSaltAsync()
        .then(salt => bcrypt.hashAsync(password, salt))
        .then(hash => this.create(Object.assign(body, { hash })));
};

userSchema.statics.authenticate = function(username, password) {
    var _user;
    return this.findOne({ username })
        .then(user => {
            _user = user;
            return user.authenticate(password);
        })
        .then(result => {
            if (!result) {
                throw new errors.InvalidRegistrationError('Incorrect username and/or password.');
            }

            return _user;
        });
};

userSchema.methods.authenticate = function(password) {
    return bcrypt.compareAsync(password, this.hash);
};

module.exports = mongoose.model('User', userSchema);
