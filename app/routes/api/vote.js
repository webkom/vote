var express = require('express');
var ensureAuthenticated = require('../helpers').ensureAuthenticated;
var vote = require('../../controllers/vote');

var router = express.Router();

router.route('/:alternativeId')
    .get(vote.list)
    .post(ensureAuthenticated, vote.create);

module.exports = router;
