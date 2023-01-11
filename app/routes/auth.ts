import routerFactory from 'express-promise-router';
const router = routerFactory();
import passport from 'passport';
import { handleError } from '../errors';
import Register from '../models/register';

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
    // Set the Email index.user to null for the spesific email
    await Register.findOneAndUpdate({ user: req.user._id }, { user: null });
    // If the user tried to access a specific page before, redirect there:
    // TODO FIXME
    //const path = req.session.originalPath || '/';
    res.redirect('/');
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return handleError(res, err);
    res.redirect('/auth/login');
  });
});

export default router;
