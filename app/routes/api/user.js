var express = require('express');
var user = require('../../controllers/user');

var router = express.Router();

router.get('/', user.list);

module.exports = router;
