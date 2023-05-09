import routerFactory from 'express-promise-router';
const router = routerFactory();
import apiRoutes from './api';
import {
  checkAdmin,
  checkAdminPartial,
  checkAuthOrRedirect,
  checkModerator,
  checkModeratorPartial,
} from './helpers';
import env from '../../env';
import QueryString from 'qs';
let usage = { test: '2023-01-02' };
if (['production', 'development'].includes(process.env.NODE_ENV)) {
  import('../../usage.yml').then((usage_yml) => (usage = usage_yml.default));
}

// Admins or moderators users shouldn't be able to vote, so they don't need to see the election page
router.get('/', checkAuthOrRedirect, (req, res, next) => {
  if (req.user.admin) return res.redirect('/admin');
  if (req.user.moderator) return res.redirect('/moderator');

  next();
});

// Make sure all admin routes are secure
router.get('/admin*', checkAdmin, (req, res, next) => {
  if (env.NODE_ENV !== 'development') {
    return res.render('adminIndex'); // Remove when migration is finished
  }
  next();
});

// Make sure all moderator routes are secure
router.get('/moderator*', checkModerator, (req, res, next) => {
  next();
});

// Make sure usage is a open page
router.get('/usage', (req, res) => {
  return res.render('usage', { usage }); // Remove when migration is finished
  // next();
});

// Extra check in case someone tries to request an admin partial directly
router.get('/partials/admin/*', checkAdminPartial, (req, res, next) => {
  return res.render(`partials/admin/${req.params[0]}`); // Remove when migration is finished
  // next();
});

// Extra check in case someone tries to request an moderator partial directly
router.get('/partials/moderator/*', checkModeratorPartial, (req, res, next) => {
  return res.render(`partials/moderator/${req.params[0]}`); // Remove when migration is finished
  // next();
});

// Loaded by the frontend through Ajax during frontend navigation
router.get('/partials/*', checkAuthOrRedirect, (req, res) => {
  return res.render(`partials/${req.params[0]}`); // Remove when migration is finished
  // next();
});

router.use('/api', apiRoutes);

router.get('/healthz', (req, res) => {
  res.send();
});

// Can be both a valid frontend route accessed directly,
// or a 404, but we let the frontend handle it
router.get('*', (req, res, next) => {
  if (env.NODE_ENV === 'development') {
    // Prevent proxy recursion
    (req.query as any).devproxy = true;
    return res.redirect(
      env.FRONTEND_URL +
        req.path +
        QueryString.stringify(req.query, { addQueryPrefix: true })
    );
  }
  next();
});

export default router;
