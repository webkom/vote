var _ = require('lodash');
var Bluebird = require('bluebird');
var passportLocalMongoose = require('passport-local-mongoose');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        index: true,
        unique: true
    },
    password: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.getCleanUser = function() {
    var user = _.omit(this.toObject(), 'password', 'hash', 'salt');
    return user;
};

userSchema.plugin(passportLocalMongoose);

module.exports = Bluebird.promisifyAll(mongoose.model('User', userSchema));
