import type { RequestHandler } from 'express';
import routerFactory from 'express-promise-router';
const router = routerFactory();
import passport from 'passport';
import { handleError } from '../../errors';
import Register from '../../models/register';

const stripUsername: RequestHandler = (req, res, next) => {
  req.body.username = req.body.username.trim();
  next();
};

router.post(
  '/login',
  stripUsername,
  passport.authenticate('local', {}),
  async (req, res) => {
    // Set the Email index.user to null for the spesific email
    await Register.findOneAndUpdate({ user: req.user._id }, { user: null });
    // If the user tried to access a specific page before, redirect there:
    return res.status(200).json({ message: 'success' });
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return handleError(res, err);
    res.redirect('/auth/login');
  });
});

export default router;
