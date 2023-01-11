import routerFactory from 'express-promise-router';
const router = routerFactory();
import apiRoutes from './api';
import authRoutes from './auth';
import {
  checkAdmin,
  checkAdminPartial,
  checkAuthOrRedirect,
  checkModerator,
  checkModeratorPartial,
} from './helpers';
let usage = { test: '2023-01-02' };
if (process.env.NODE_ENV != 'test') {
  import('../../usage.yml').then((usage_yml) => (usage = usage_yml.default));
}

// Admin users shouldn't be able to vote, so they don't need to see the election page
router.get('/', checkAuthOrRedirect, (req, res) => {
  if (req.user.admin) return res.redirect('/admin');
  if (req.user.moderator) return res.redirect('/moderator');
  res.render('index');
});

// Make sure all admin routes are secure
router.get('/admin*', checkAdmin, (req, res) => {
  res.render('adminIndex');
});

// Make sure all moderator routes are secure
router.get('/moderator*', checkModerator, (req, res) => {
  res.render('moderatorIndex');
});

// Make sure usage is a open page
router.get('/usage', (req, res) => {
  res.render('usage', { usage });
});

// Extra check in case someone tries to request an admin partial directly
router.get('/partials/admin/*', checkAdminPartial, (req, res) => {
  res.render(`partials/admin/${req.params[0]}`);
});

// Extra check in case someone tries to request an moderator partial directly
router.get('/partials/moderator/*', checkModeratorPartial, (req, res) => {
  res.render(`partials/moderator/${req.params[0]}`);
});

// Loaded by the frontend through Ajax during frontend navigation
router.get('/partials/*', checkAuthOrRedirect, (req, res) => {
  res.render(`partials/${req.params[0]}`);
});

router.use('/api', apiRoutes);
router.use('/auth', authRoutes);

router.get('/healthz', (req, res) => {
  res.send();
});

// Can be both a valid frontend route accessed directly,
// or a 404, but we let the frontend handle it
router.get('*', checkAuthOrRedirect, (req, res) => {
  res.render('index');
});

export default router;
