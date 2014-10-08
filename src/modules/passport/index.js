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

    passport.use(new LocalStrategy(
        (username, password, done) => {
            models.User.findOne({ username: username }, (err, user)=> {
                if (err) return done(err);
                if (!user) return done(null, false, { message: 'Incorrect username.' });
                user.validPassword(password, (err, res)=>{
                    if (!res) return done(null, false, { message: 'Incorrect password.' });
                    return done(null, user);
                });
            });
        }
    ));

};