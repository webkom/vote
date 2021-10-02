import routerFactory from 'express-promise-router';
const router = routerFactory();
import register from '../../controllers/register';
import { ensureModerator } from '../helpers';

router.route('/').get(ensureModerator, register.list);

router.route('/:registerId').delete(ensureModerator, register.delete);

module.exports = router;
