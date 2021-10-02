import socketIO from 'socket.io';
import app from './app';
import env from './env';

app.set('port', env.PORT);

module.exports = (callback) => {
  const hostname = env.HOST;
  const server = app.listen(app.get('port'), hostname, (err) => {
    callback(err, app.get('port'));
  });
  app.set('io', socketIO(server));
};
