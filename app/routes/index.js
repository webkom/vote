const router = require('express-promise-router')();
const apiRoutes = require('./api');
const authRoutes = require('./auth');
const helpers = require('./helpers');
const checkAuthOrRedirect = helpers.checkAuthOrRedirect;
const checkAdmin = helpers.checkAdmin;
const checkModerator = helpers.checkModerator;
const checkAdminPartial = helpers.checkAdminPartial;
const checkModeratorPartial = helpers.checkModeratorPartial;

// Admin users shouldn't be able to vote, so they don't need to see the election page
router.get('/', checkAuthOrRedirect, (req, res) => {
  if (req.user.admin) return res.redirect('/admin');
  if (req.user.moderator) return res.redirect('/moderator');
  res.render('index');
});

// Return file with login info
router.get('/qr/give/me/data/from/token', (req, res) => {
  const data = 'dadasdasdsadas';
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-disposition': 'attachment;filename=AbakusVoteToken.png',
    'Content-Length': data.length
  });
  res.end(Buffer.from(data, 'binary'));
});

router.get('/qr/qr-opened', (req, res) => {
  const data = 'dadasdasdsadas';
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-disposition': 'attachment;filename=AbakusVoteToken.png',
    'Content-Length': data.length
  });
  res.end(Buffer.from(data, 'binary'));
});

// Make sure all admin routes are secure
router.get('/admin*', checkAdmin, (req, res) => {
  res.render('adminIndex');
});

// Make sure all moderator routes are secure
router.get('/moderator*', checkModerator, (req, res) => {
  res.render('moderatorIndex');
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

module.exports = router;
