var LocalStrategy   = require('passport-local').Strategy;

exports = module.exports = (passport,models) => {


    passport.serializeUser((user, done) => {
        done(null, user.username); // attached to the session
    });

    passport.deserializeUser((username, done) => {
        models.User.findOne({ username: username},(err, user) =>{
            done(err, user);
        });
    });

    passport.use('local', new LocalStrategy(
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