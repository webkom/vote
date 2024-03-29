import type { Request, Response, NextFunction } from 'express';
import routerFactory from 'express-promise-router';
const router = routerFactory();
import authRoutes from './auth';
import electionRoutes from './election';
import userRoutes from './user';
import voteRoutes from './vote';
import qrRoutes from './qr';
import registerRoutes from './register';
import errors, { handleError, HTTPError } from '../../errors';

router.use('/auth', authRoutes);
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

router.use(
  (err: HTTPError, req: Request, res: Response, next: NextFunction) => {
    handleError(res, err);
  }
);

export default router;
