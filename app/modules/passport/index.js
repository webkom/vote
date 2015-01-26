var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/user');

module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user.username); // attached to the session
    });

    passport.deserializeUser(function(user, done) {
        User.findOne({ username: user.username }, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username }, function(err, user) {
                if (err) return done(err);
                if (!user) return done(null, false, { message: 'Incorrect username.' });
                user.validPassword(password, function(err, res) {
                    if (!res) return done(null, false, { message: 'Incorrect password.' });
                    return done(null, user);
                });
            });
        }
    ));
};
