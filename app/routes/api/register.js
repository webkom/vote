const router = require('express-promise-router')();
const register = require('../../controllers/register');
const ensureModerator = require('../helpers').ensureModerator;

router.route('/').get(ensureModerator, register.list);

router.route('/:registerId').delete(ensureModerator, register.delete);

module.exports = router;
