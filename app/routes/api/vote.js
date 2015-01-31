var express = require('express');
var helpers = require('../helpers');
var ensureAuthenticated = helpers.ensureAuthenticated;
var ensureAdmin = helpers.ensureAdmin;
var vote = require('../../controllers/vote');

var router = express.Router();

router.route('/:alternativeId')
    .get(ensureAdmin, vote.list)
    .post(ensureAuthenticated, vote.create);

module.exports = router;
