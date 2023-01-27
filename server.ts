import { Server } from 'socket.io';
import http from 'http';
import app from './app';
import env from './env';

app.set('port', env.PORT);

const hostname = env.HOST;
if (import.meta.env.PROD) {
  const server = app.listen(app.get('port'), hostname);
  app.set('io', new Server(server));
}

export const viteNodeApp = app;
