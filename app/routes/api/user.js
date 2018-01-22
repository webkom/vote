const express = require('express');
const user = require('../../controllers/user');
const ensureAdmin = require('../helpers').ensureAdmin;

const router = express.Router();

router.route('/')
    .get(ensureAdmin, user.list)
    .post(ensureAdmin, user.create);

router.get('/count', ensureAdmin, user.count);

router.put('/:username/change_card', ensureAdmin, user.changeCard);

router.post('/:cardKey/toggle_active', ensureAdmin, user.toggleActive);

router.post('/deactivate', ensureAdmin, user.deactivateAllNonAdmin);

module.exports = router;
