var LocalStrategy   = require('passport-local').Strategy;
var auth            = require('./auth');
var passport        = require("passport");
var LocalStrategy   = require('passport-local').Strategy;

exports = module.exports = (models) => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // attached to the session
    });

    passport.deserializeUser((id, done) => {
        models.User.findById(id,(err, user) =>{
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
    }, auth.locallogin));

};