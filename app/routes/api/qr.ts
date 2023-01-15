import routerFactory from 'express-promise-router';
const router = routerFactory();
import app from '../../../app';
import { Server } from 'socket.io';

// Notify moderator that user successfully has scanned qr
router.get('/open/', (req, res) => {
  const io: Server = app.get('io');
  io.emit('qr-opened', req.query.code);
  res.status(200).send();
});

export default router;
