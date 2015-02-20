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

router.route('/:electionId')
    .get(ensureAdmin, election.retrieve)
    .delete(ensureAdmin, election.delete);

router.post('/:electionId/activate', ensureAdmin, election.activate);

router.post('/:electionId/deactivate', ensureAdmin, election.deactivate);

router.route('/:electionId/alternatives')
    .get(ensureAdmin, alternative.list)
    .post(ensureAdmin, alternative.create);

router.get('/:electionId/votes', ensureAdmin, election.sumVotes);

module.exports = router;
