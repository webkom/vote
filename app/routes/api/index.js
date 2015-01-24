var express = require('express');
var electionRoutes = require('./election');
var userRoutes = require('./user');

var router = express.Router();

router.use('/election', electionRoutes);
router.use('/user', userRoutes);

module.exports = router;
