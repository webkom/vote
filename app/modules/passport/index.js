var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/user');

module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user.username); // attached to the session
    });

    passport.deserializeUser(function(user, done) {
        return User.findOneAsync({username: user.username}).nodeify(done);
    });

    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            return User.findOneAsync({username: username})
                .then(function(user) {
                    if (!user) return done(null, false, { message: 'Incorrect username.' });
                    return user.validPassword(password)
                        .then(function(res) {
                            if (!res) return done(null, false, { message: 'Incorrect password.' });
                            return user;
                        }).nodeify(done);
                });
        }
    ));
};
