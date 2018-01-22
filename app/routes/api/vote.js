const express = require('express');
const helpers = require('../helpers');
const ensureAuthenticated = helpers.ensureAuthenticated;
const vote = require('../../controllers/vote');

const router = express.Router();

router.route('/')
    .get(ensureAuthenticated, vote.retrieve)
    .post(ensureAuthenticated, vote.create);

module.exports = router;
