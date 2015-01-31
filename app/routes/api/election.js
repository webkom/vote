var express = require('express');
var election = require('../../controllers/election');
var alternative = require('../../controllers/alternative');
var helpers = require('../helpers');
var ensureAdmin = helpers.ensureAdmin;

var router = express.Router();

router.route('/')
    .post(election.create)
    .get(election.list);

router.route('/:electionId')
    .get(election.retrieve);

router.post('/:electionId/activate', election.activate);

router.post('/:electionId/deactivate', election.deactivate);

router.route('/:electionId/alternatives')
    .get(alternative.list)
    .post(alternative.create);

router.get('/:electionId/votes', ensureAdmin, election.sumVotes);

module.exports = router;
