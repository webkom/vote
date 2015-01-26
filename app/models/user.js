var Bluebird = require('bluebird');
var bcrypt = Bluebird.promisifyAll(require('bcryptjs'));
var mongoose = Bluebird.promisifyAll(require('mongoose'));
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

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareAsync(password, this.password);
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
    if (!this.username) {
        this.username = User.generateUsername();
    }

    if (this.password) {
        return bcrypt.hashAsync(this.password, 5).bind(this)
            .then(function(hash) {
                this.password = hash;
            })
            .nodeify(next);
    } else {
        next();
    }
});

module.exports = User;
