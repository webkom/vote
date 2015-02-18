var express = require('express');
var apiRoutes = require('./api');
var authRoutes = require('./auth');
var helpers = require('./helpers');
var checkAuthOrRedirect = helpers.checkAuthOrRedirect;
var checkAdmin = helpers.checkAdmin;
var checkAdminPartial = helpers.checkAdminPartial;

var router = express.Router();

// Admin users shouldn't be able to vote, so they don't need to see the election page
router.get('/', checkAuthOrRedirect, function(req, res) {
    if (req.user.admin) return res.redirect('/admin');
    res.render('index');
});

// Make sure all admin routes are secure
router.get('/admin*', checkAdmin, function(req, res) {
    res.render('adminIndex');
});

// Extra check in case someone tries to request an admin partial directly
router.get('/partials/admin/*', checkAdminPartial, function(req, res) {
    res.render('partials/admin/' + req.params[0]);
});

// Loaded by the frontend through Ajax during frontend navigation
router.get('/partials/*', checkAuthOrRedirect, function(req, res) {
    res.render('partials/' + req.params[0]);
});

router.use('/api', apiRoutes);
router.use('/auth', authRoutes);

// Can be both a valid frontend route accessed directly,
// or a 404, but we let the frontend handle it
router.get('*', checkAuthOrRedirect, function(req, res) {
    res.render('index');
});

module.exports = router;
