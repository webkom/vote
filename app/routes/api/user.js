var express = require('express');
var user = require('../../controllers/user');
var ensureAdmin = require('../helpers').ensureAdmin;

var router = express.Router();

router.route('/')
    .get(ensureAdmin, user.list)
    .post(ensureAdmin, user.create);

router.get('/count', ensureAdmin, user.count);

router.put('/:username/change_card', ensureAdmin, user.changeCard);

router.post('/:cardKey/toggle_active', ensureAdmin, user.toggleActive);

module.exports = router;
