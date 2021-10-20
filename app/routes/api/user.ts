import routerFactory from 'express-promise-router';
const router = routerFactory();
import { list, create, generate, count ,changeCard, toggleActive, deactivateAllNonAdmin } from '../../controllers/user';
import { ensureModerator } from '../helpers';

router
  .route('/')
  .get(ensureModerator, list)
  .post(ensureModerator, create);

router.post('/generate', ensureModerator, generate);

router.get('/count', ensureModerator, count);

router.put('/:username/change_card', ensureModerator, changeCard);

router.post('/:cardKey/toggle_active', ensureModerator, toggleActive);

router.post('/deactivate', ensureModerator, deactivateAllNonAdmin);

export default router;
