var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var USERNAME_LENGTH = 7;
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

userSchema.methods.validPassword = function(password, cb) {
    bcrypt.compare(password, this.password, cb);
};

userSchema.statics.generateUsername = function() {
    var username = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < USERNAME_LENGTH; i++)
        username += possible.charAt(Math.floor(Math.random() * possible.length));
    return username;
};

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next) {
    var user = this;

    if (typeof user.username === 'undefined') {
        user.username = User.generateUsername();
    }

    if (typeof user.password !== 'undefined') {
        bcrypt.hash(user.password, 5, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    } else {
        next();
    }
});

module.exports = User;
