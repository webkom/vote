const socketIO = require('socket.io');
const app = require('./app');

app.set('port', process.env.PORT || 3000);

module.exports = callback => {
  const hostname =
    process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  const server = app.listen(app.get('port'), hostname, err => {
    callback(err, app.get('port'));
  });
  app.set('io', socketIO(server));
};
