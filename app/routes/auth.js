var express = require('express');
var passport = require('passport');

var router = express.Router();

router.post('/login', function(req, res) {
    passport.authenticate('local', function(err, user, info) {
        if (err) return res.status(500).send(err);
        if (!user) return res.send({ message: 'Incorrect password or username' });
        req.logIn(user, function(err) {
            if (err) res.send(err);
            return res.send(user);
        });
    })(req, res);
});

router.post('/isAuthenticated', function (req, res){
    if (req.user) {
        //res.status(200).send();
        res.json({isAuthenticated: 'true'});
    } else {
        //res.status(401).send();
        res.json({isAuthenticated: 'false'});
    }
     });

module.exports = router;
