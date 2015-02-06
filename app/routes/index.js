var express = require('express');
var apiRoutes = require('./api');
var authRoutes = require('./auth');
var helpers = require('./helpers');
var checkAuthOrRedirect = helpers.checkAuthOrRedirect;
var checkAdmin = helpers.checkAdmin;
var checkAdminPartial = helpers.checkAdminPartial;

var router = express.Router();

router.get('/admin*', checkAdmin, function(req, res) {
    res.render('index');
});

router.get('/partials/admin/*', checkAdminPartial, function(req, res) {
    res.render('partials/admin/' + req.params[0]);
});

router.get('/partials/*', checkAuthOrRedirect, function(req, res) {
    res.render('partials/' + req.params[0]);
});

router.use('/api', apiRoutes);
router.use('/auth', authRoutes);

router.get('*', checkAuthOrRedirect, function(req, res) {
    res.render('index');
});

module.exports = router;
