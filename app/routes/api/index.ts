import routerFactory from 'express-promise-router';
const router = routerFactory();
import electionRoutes from './election';
import userRoutes from './user';
import voteRoutes from './vote';
import qrRoutes from './qr';
import registerRoutes from './register';
import errors from '../../errors';

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
