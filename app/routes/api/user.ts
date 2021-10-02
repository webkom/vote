import routerFactory from 'express-promise-router';
const router = routerFactory();
import user from '../../controllers/user';
import { ensureModerator } from '../helpers';

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
