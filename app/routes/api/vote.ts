import routerFactory from 'express-promise-router';
const router = routerFactory();
import { ensureAuthenticated } from '../helpers';
import { retrieve, create } from '../../controllers/vote';

router
  .route('/')
  .get(ensureAuthenticated, retrieve)
  .post(ensureAuthenticated, create);

export default router;
