const router = require('express-promise-router')();
const election = require('../../controllers/election');
const alternative = require('../../controllers/alternative');
const helpers = require('../helpers');
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

router
  .route('/:electionId')
  .get(election.retrieve)
  .delete(election.delete);

router.get('/:electionId/count', election.count);

router.post('/:electionId/activate', election.activate);
router.post('/:electionId/deactivate', election.deactivate);

router
  .route('/:electionId/alternatives')
  .get(alternative.list)
  .post(alternative.create);

router.get('/:electionId/votes', election.sumVotes);

module.exports = router;
