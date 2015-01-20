var LocalStrategy   = require('passport-local').Strategy;

exports = module.exports = function (passport,models) {


    passport.serializeUser(function (user, done){
        done(null, user.username); // attached to the session
    });

    passport.deserializeUser(function (user, done) {
        models.User.findOne({ username: user.username },function (err, user) {
            done(err, user);
        });
    });

    passport.use('local', new LocalStrategy(
        function (username, password, done) {
            models.User.findOne({ username: username }, function (err, user) {
                if (err) return done(err);
                if (!user) return done(null, false, { message: 'Incorrect username.' });
                user.validPassword(password, function (err, res){
                    if (!res) return done(null, false, { message: 'Incorrect password.' });
                    return done(null, user);
                });
            });
        }
    ));




};