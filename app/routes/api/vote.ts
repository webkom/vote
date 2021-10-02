import routerFactory from 'express-promise-router';
const router = routerFactory();
import helpers from '../helpers';
const ensureAuthenticated = helpers.ensureAuthenticated;
import vote from '../../controllers/vote';

router
  .route('/')
  .get(ensureAuthenticated, vote.retrieve)
  .post(ensureAuthenticated, vote.create);

export default router;
