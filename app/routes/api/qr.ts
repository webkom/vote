import routerFactory from 'express-promise-router';
const router = routerFactory();
import app from '../../../app';

// Notify moderator that user successfully has scanned qr
router.get('/open/', (req, res) => {
  const io = app.get('io');
  io.emit('qr-opened', req.query.code);
  res.status(200).send();
});

export default router;
