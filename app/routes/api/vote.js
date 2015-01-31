var express = require('express');
var helpers = require('../helpers');
var ensureAuthenticated = helpers.ensureAuthenticated;
var vote = require('../../controllers/vote');

var router = express.Router();

router.route('/')
    .get(ensureAuthenticated, vote.retrieve)
    .post(ensureAuthenticated, vote.create);

module.exports = router;
