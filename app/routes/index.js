var express = require('express');
var apiRoutes = require('./api');
var authRoutes = require('./auth');

var router = express.Router();

router.use('/api', apiRoutes);
router.use('/auth', authRoutes);

module.exports = router;
