var passport = require('passport');

module.exports = function (app, express) {
    var router = express.Router();

    router.post('/login', function (req, res){
        passport.authenticate('local', function (err, user, info){
            if (err) return res.send(err);
            if (!user) return res.send({message: 'Incorrect password or username'});
            req.logIn(user, function (err) { if (err) res.send(err) });
            return res.send(user);
        })(req, res);
    });

    router.post('/isAuthenticated', function (req, res){
        if (req.user) {
            res.json({isAuthenticated: "true"});
        } else {
            res.json({isAuthenticated: "false"});
        }
         });

    app.use('/auth', router);


};
