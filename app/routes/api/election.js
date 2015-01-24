var express = require('express');
var election = require('../../controllers/election');
var alternative = require('../../controllers/alternative');

var router = express.Router();

router.route('/')
    .post(election.create)
    .get(election.list);

router.route('/:election_id')
    .get(election.retrieve);

router.route('/:election_id/alternatives')
    .get(alternative.list)
    .post(alternative.create);

module.exports = router;
