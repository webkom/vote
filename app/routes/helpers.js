const errors = require('../errors');

const checkAuthOrRedirect = (exports.checkAuthOrRedirect = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  // Store the original path so we can redirect there after login
  req.session.originalPath = req.path;
  res.redirect('/auth/login');
});

exports.checkAdmin = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.admin) return next();
    res.redirect('/404');
  });
};

exports.checkAdminPartial = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.admin) return next();
    res.status(404).send();
  });
};

const ensureAuthenticated = (exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  const error = new errors.LoginError();
  return errors.handleError(res, error);
});

exports.ensureAdmin = (req, res, next) => {
  ensureAuthenticated(req, res, () => {
    if (!req.user.admin) {
      const error = new errors.PermissionError();
      return next(error);
    }
    return next();
  });
};
