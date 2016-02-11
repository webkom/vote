var _ = require('lodash');
var Bluebird = require('bluebird');
var passportLocalMongoose = require('passport-local-mongoose');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        index: true,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9]{5,}$/
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
    var user = _.omit(this.toObject(), 'password', 'hash', 'salt');
    return user;
};

var options = {
    usernameLowerCase: true
};

/* istanbul ignore else */
if (['test', 'development'].indexOf(process.env.NODE_ENV) !== -1) {
    userSchema.plugin(passportLocalMongoose, _.extend(options, {
        iterations: 1
    }));
} else {
    userSchema.plugin(passportLocalMongoose, options);
}

// passport-local-mongoose doesn't provide a Promise interface yet, so we
// need to make one ourself:
userSchema.statics.register = Bluebird.promisify(userSchema.statics.register);
userSchema.methods.authenticate = Bluebird.promisify(userSchema.methods.authenticate);

module.exports = mongoose.model('User', userSchema);
