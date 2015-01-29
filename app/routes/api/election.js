var express = require('express');
var election = require('../../controllers/election');
var alternative = require('../../controllers/alternative');

var router = express.Router();

router.route('/')
    .post(election.create)
    .get(election.list);

router.route('/:electionId')
    .get(election.retrieve);

router.route('/:electionId/alternatives')
    .get(alternative.list)
    .post(alternative.create);

router.post('/:electionId/activate', election.activate);

router.post('/:electionId/deactivate', election.deactivate);

module.exports = router;
