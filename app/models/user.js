var bcrypt = require('bcryptjs');
var async = require('async');

var SALT_ROUNDS = 8;
var USERNAME_LENGTH = 7;

module.exports = function (collection, mongoose) {
    var schema = mongoose.Schema({
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
            default: false
        },
        admin:{
            type: Boolean,
            default: false
        }

    });


    schema.pre('save', function (next){
        var user = this;

        if(typeof user.username == "undefined"){
            user.username = mongoose.model('user').generateUsername();
        }
        if(typeof user.password != "undefined"){
            bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    user.password = hash;
                    next();
                });
            });
        }
        else{
            next();
        }
    });

    schema.methods.validPassword = function (password, cb) {
        bcrypt.compare(password, this.password ,function (err, res) {
            return cb(err, res);
        });
    };

    schema.statics.generateUsername = function(){
        var username = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < USERNAME_LENGTH; i++ )
            username += possible.charAt(Math.floor(Math.random() * possible.length));
        return username;

    };

    return mongoose.model(collection, schema);

};