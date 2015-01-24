var express = require('express');
var user = require('../../controllers/user');

var router = express.Router();

router.get('/', user.retrieve);

router.post('/create', user.create);

module.exports = router;
