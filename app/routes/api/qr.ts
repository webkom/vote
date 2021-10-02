const router = require('express-promise-router')();
const app = require('../../../app');

// Notify moderator that user successfully has scanned qr
router.get('/open/', (req, res) => {
  const io = app.get('io');
  io.emit('qr-opened', req.query.code);
  res.status(200).send();
});

module.exports = router;
