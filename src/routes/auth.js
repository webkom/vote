var passport    = require('../modules/passport');

module.exports = (app, express) => {
    var router = express.Router();

    router.post('/login', (res, req) => {
        console.log(req.post);
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.send('NEI'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.send('HEI');
            });
        })
    });

    app.use('/auth', router);


};
