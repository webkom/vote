import { Server } from 'socket.io';
import app from './app';
import env from './env';

app.set('port', env.PORT);

export default (callback: (err: Error, port: number) => void): void => {
  const hostname = env.HOST;
  const server = app.listen(app.get('port'), hostname, () => {
    callback(undefined, app.get('port'));
  });
  app.set('io', new Server(server));
};
