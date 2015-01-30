var errors = require('../errors');

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
