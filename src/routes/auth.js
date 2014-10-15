var passport = require('passport');

module.exports = (app, express) => {
    var router = express.Router();

    router.post('/login', (req, res) => {
        passport.authenticate('local', (err, user, info) =>{
            if (err) return res.send(err);
            if (!user) return res.send({message: 'Incorrect password or username'});
            req.logIn(user, err => {
                if (err) return res.send(err);
                return res.send(user);
            });
        })(req, res);
    });

    app.use('/auth', router);


};
