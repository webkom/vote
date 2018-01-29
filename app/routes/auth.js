const router = require('express-promise-router')();
const passport = require('passport');
const errors = require('../errors');

router.get('/login', (req, res) => {
  const csrfToken = process.env.NODE_ENV !== 'test' ? req.csrfToken() : 'test';
  res.render('login', {
    csrfToken: csrfToken,
    feedback: req.flash('error')
  });
});

function stripUsername(req, res, next) {
  req.body.username = req.body.username.trim();
  next();
}

router.post(
  '/login',
  stripUsername,
  passport.authenticate('local', {
    failureRedirect: '/auth/login',
    failureFlash: 'Brukernavn og/eller passord er feil.'
  }),
  (req, res) => {
    // If the user tried to access a specific page before, redirect there:
    const path = req.session.originalPath || '/';
    res.redirect(path);
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return errors.handleError(res, err);
    res.redirect('/auth/login');
  });
});

module.exports = router;
