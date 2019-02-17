const socketIO = require('socket.io');
const app = require('./app');
const env = require('./env');

app.set('port', env.PORT);

module.exports = callback => {
  const hostname = env.HOST;
  const server = app.listen(app.get('port'), hostname, err => {
    callback(err, app.get('port'));
  });
  app.set('io', socketIO(server));
};
