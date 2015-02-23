var express = require('express');
var election = require('../../controllers/election');
var alternative = require('../../controllers/alternative');
var helpers = require('../helpers');
var ensureAdmin = helpers.ensureAdmin;
var ensureAuthenticated = helpers.ensureAuthenticated;

var router = express.Router();

router.route('/')
    .post(ensureAdmin, election.create)
    .get(ensureAdmin, election.list);

router.get('/active', ensureAuthenticated, election.retrieveActive);

// Wraps all endpoints that use electionId in ensureAdmin
router.param('electionId', ensureAdmin);
router.param('electionId', election.load);

router.route('/:electionId')
    .get(election.retrieve)
    .delete(election.delete);

router.get('/:electionId/count', election.count);

router.post('/:electionId/activate', election.activate);
router.post('/:electionId/deactivate', election.deactivate);

router.route('/:electionId/alternatives')
    .get(alternative.list)
    .post(alternative.create);

router.get('/:electionId/votes', election.sumVotes);

module.exports = router;
