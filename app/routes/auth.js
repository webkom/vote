var express = require('express');
var passport = require('passport');
var errors = require('../errors');

var router = express.Router();

router.post('/login', passport.authenticate('local'), function(req, res) {
    var path = req.session.originalPath || '/';
    res.redirect(path);
});

router.post('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) return errors.handleError(res, err);
        res.redirect('/login');
    });
});

module.exports = router;
