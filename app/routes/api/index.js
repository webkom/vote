var express = require('express');
var electionRoutes = require('./election');
var userRoutes = require('./user');
var voteRoutes = require('./vote');

var router = express.Router();

router.use('/election', electionRoutes);
router.use('/user', userRoutes);
router.use('/alternative', electionRoutes);
router.use('/vote', voteRoutes);

module.exports = router;
