import routerFactory from 'express-promise-router';
import user from '../../controllers/user';
import { ensureModerator } from '../helpers';
const router = routerFactory();

router
  .route('/')
  .get(ensureModerator, user.list)
  .post(ensureModerator, user.create);

router.post('/generate', ensureModerator, user.generate);

router.get('/count', ensureModerator, user.count);

router.put('/:username/change_card', ensureModerator, user.changeCard);

router.post('/:cardKey/toggle_active', ensureModerator, user.toggleActive);

router.post('/deactivate', ensureModerator, user.deactivateAllNonAdmin);

export default router;
