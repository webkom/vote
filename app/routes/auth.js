var express = require('express');
var passport = require('passport');
var user = require('../controllers/user');

var router = express.Router();

router.post('/register', user.register);

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user.getCleanUser());
});

router.post('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        message: 'Successfully logged out.',
        status: 200
    });
});

module.exports = router;
