var express = require('express');
var user = require('../../controllers/user');
var ensureAdmin = require('../helpers').ensureAdmin;

var router = express.Router();

router.route('/')
    .get(ensureAdmin, user.list)
    .post(ensureAdmin, user.create);

router.get('/count', ensureAdmin, user.count);

router.route('/:cardKey/toggle_active')
    .post(ensureAdmin, user.toggleActive);

module.exports = router;
