import routerFactory from 'express-promise-router';
import { list, deleteEntry } from '../../controllers/register';
import { ensureModerator } from '../helpers';
const router = routerFactory();

router.route('/').get(ensureModerator, list);

router.route('/:registerId').delete(ensureModerator, deleteEntry);

export default router;
