const router = require('express-promise-router')();
const helpers = require('../helpers');
const ensureAuthenticated = helpers.ensureAuthenticated;
const vote = require('../../controllers/vote');

router
  .route('/')
  .get(ensureAuthenticated, vote.retrieve)
  .post(ensureAuthenticated, vote.create);

module.exports = router;
