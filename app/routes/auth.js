var express = require('express');
var passport = require('passport');
var errors = require('../errors');

var router = express.Router();

router.get('/login', function(req, res) {
    var csrfToken = process.env.NODE_ENV !== 'test' ? req.csrfToken() : 'test';
    res.render('login', {
        csrfToken: csrfToken,
        feedback: req.flash('error')
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login', failureFlash: true
}), function(req, res) {
    // If the user tried to access a specific page before, redirect there:
    var path = req.session.originalPath || '/';
    res.redirect(path);
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) return errors.handleError(res, err);
        res.redirect('/auth/login');
    });
});

module.exports = router;
