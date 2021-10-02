const router = require('express-promise-router')();
const user = require('../../controllers/user');
const ensureModerator = require('../helpers').ensureModerator;

router
  .route('/')
  .get(ensureModerator, user.list)
  .post(ensureModerator, user.create);

router.post('/generate', ensureModerator, user.generate);

router.get('/count', ensureModerator, user.count);

router.put('/:username/change_card', ensureModerator, user.changeCard);

router.post('/:cardKey/toggle_active', ensureModerator, user.toggleActive);

router.post('/deactivate', ensureModerator, user.deactivateAllNonAdmin);

module.exports = router;
