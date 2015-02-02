var express = require('express');
var passport = require('passport');
var errors = require('../errors');

var router = express.Router();

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user.getCleanUser());
});

router.post('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) return errors.handleError(res, err);
        res.status(200).json({
            message: 'Successfully logged out.',
            status: 200
        });
    });
});

module.exports = router;
