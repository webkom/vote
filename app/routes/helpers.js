var errors = require('../errors');

var checkAuthOrRedirect = exports.checkAuthOrRedirect = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    // Store the original path so we can redirect there after login
    req.session.originalPath = req.path;
    res.redirect('/login');
};

exports.checkAdmin = function(req, res, next) {
    checkAuthOrRedirect(req, res, function() {
        if (req.user.admin) return next();
        res.redirect('/404');
    });
};

exports.checkAdminPartial = function(req, res, next) {
    checkAuthOrRedirect(req, res, function() {
        if (req.user.admin) return next();
        res.status(404).send();
    });
};

var ensureAuthenticated = exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    var error = new errors.LoginError();
    return errors.handleError(res, error);
};

exports.ensureAdmin = function(req, res, next) {
    ensureAuthenticated(req, res, function() {
        if (!req.user.admin) {
            var error = new errors.PermissionError();
            return errors.handleError(res, error);
        }
        return next();
    });
};
