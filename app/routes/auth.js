const router = require('express-promise-router')();
const passport = require('passport');
const errors = require('../errors');
const User = require('../models/user');

router.get('/login', (req, res) => {
  const csrfToken = process.env.NODE_ENV !== 'test' ? req.csrfToken() : 'test';
  res.render('login', {
    csrfToken: csrfToken,
    feedback: req.flash('error'),
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
    failureFlash: 'Brukernavn og/eller passord er feil.',
  }),
  async (req, res) => {
    const { _id, unActivatedEmail } = req.user;
    // If they can login with an unActivatedEmail user we'll set the user's
    // unActivatedEmail to blank to show that this user has been able to login
    if (unActivatedEmail) {
      await User.findByIdAndUpdate({ _id: _id }, { unActivatedEmail: '' });
    }

    // If the user tried to access a specific page before, redirect there:
    // TODO FIXME
    //const path = req.session.originalPath || '/';
    res.redirect('/');
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return errors.handleError(res, err);
    res.redirect('/auth/login');
  });
});

module.exports = router;
