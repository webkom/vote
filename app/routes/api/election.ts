import routerFactory from 'express-promise-router';
const router = routerFactory();
import election from '../../controllers/election';
import alternative from '../../controllers/alternative';
import helpers from '../helpers';
const ensureAdmin = helpers.ensureAdmin;
const ensureAuthenticated = helpers.ensureAuthenticated;

router
  .route('/')
  .post(ensureAdmin, election.create)
  .get(ensureAdmin, election.list);

router.get('/active', ensureAuthenticated, election.retrieveActive);

// Wraps all endpoints that use electionId in ensureAdmin
router.param('electionId', ensureAdmin);
router.param('electionId', election.load);

router.route('/:electionId').get(election.retrieve).delete(election.delete);

router.get('/:electionId/count', election.count);

router.post('/:electionId/activate', election.activate);
router.post('/:electionId/deactivate', election.deactivate);

router
  .route('/:electionId/alternatives')
  .get(alternative.list)
  .post(alternative.create);

router.get('/:electionId/votes', election.elect);

module.exports = router;
