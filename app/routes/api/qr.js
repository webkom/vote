const router = require('express-promise-router')();
const text2png = require('text2png');
const app = require('../../../app');

router.get('/download-file/', (req, res) => {
  const [username, password] = req.query.token.split(':');
  const data = text2png(
    `\tVOTE\n\nUsername: ${username}\nPassword: ${password}`,
    {
      font: '80px Futura',
      color: 'red',
      backgroundColor: 'linen',
      lineSpacing: 10,
      output: 'buffer',
      padding: 20
    }
  );
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-disposition': 'attachment;filename=AbakusVoteToken.png',
    'Content-Length': data.length
  });
  res.end(Buffer.from(data, 'binary'));
});

router.get('/open/', (req, res) => {
  const io = app.get('io');
  io.emit('qr-opened', req.query.code);
  res.status(200).send();
});

module.exports = router;
