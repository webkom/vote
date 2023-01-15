import type { RequestHandler } from 'express';
import errors, { handleError } from '../errors';

export const checkAuthOrRedirect: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  // Store the original path so we can redirect there after login
  req.session.originalPath = req.path;
  res.redirect('/auth/login');
};

export const checkAdmin: RequestHandler = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.admin) return next();
    res.redirect('/404');
  });
};

export const checkAdminPartial: RequestHandler = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.admin) return next();
    res.status(404).send();
  });
};

export const ensureAdmin: RequestHandler = (req, res, next) => {
  ensureAuthenticated(req, res, () => {
    if (!req.user.admin) {
      const error = new errors.PermissionError();
      return next(error);
    }
    return next();
  });
};

export const checkModerator: RequestHandler = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.moderator) return next();
    res.redirect('/404');
  });
};

export const checkModeratorPartial: RequestHandler = (req, res, next) => {
  checkAuthOrRedirect(req, res, () => {
    if (req.user.moderator) return next();
    res.status(404).send();
  });
};

export const ensureModerator: RequestHandler = (req, res, next) => {
  ensureAuthenticated(req, res, () => {
    if (!req.user.moderator) {
      const error = new errors.PermissionError();
      return next(error);
    }
    return next();
  });
};

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  const error = new errors.LoginError();
  return handleError(res, error);
};
