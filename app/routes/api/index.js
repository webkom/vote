const router = require('express-promise-router')();
const electionRoutes = require('./election');
const userRoutes = require('./user');
const voteRoutes = require('./vote');
const qrRoutes = require('./qr');
const registerRoutes = require('./register');
const errors = require('../../errors');

router.use('/election', electionRoutes);
router.use('/user', userRoutes);
router.use('/alternative', electionRoutes);
router.use('/vote', voteRoutes);
router.use('/qr', qrRoutes);
router.use('/register', registerRoutes);

router.use((req, res, next) => {
  const error = new errors.NotFoundError(req.originalUrl);
  next(error);
});

router.use((err, req, res, next) => {
  errors.handleError(res, err);
});

module.exports = router;
