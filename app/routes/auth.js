var express = require('express');
var passport = require('passport');
var user = require('../controllers/user');

var router = express.Router();

router.post('/register', user.register);

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user.getCleanUser());
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
