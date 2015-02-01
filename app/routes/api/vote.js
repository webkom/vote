var express = require('express');
var helpers = require('../helpers');
var ensureAuthenticated = helpers.ensureAuthenticated;
var vote = require('../../controllers/vote');

var router = express.Router();

router.post('/', ensureAuthenticated, vote.create);
router.get('/:electionId', ensureAuthenticated, vote.retrieve);

module.exports = router;
