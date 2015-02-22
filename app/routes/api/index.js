var express = require('express');
var electionRoutes = require('./election');
var userRoutes = require('./user');
var voteRoutes = require('./vote');
var errors = require('../../errors');

var router = express.Router();

router.use('/election', electionRoutes);
router.use('/user', userRoutes);
router.use('/alternative', electionRoutes);
router.use('/vote', voteRoutes);

router.use(function(err, res, res, next) {
    errors.handleError(res, err);
});

module.exports = router;
