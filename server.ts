import { Server } from 'socket.io';
import http from 'http';
import app from './app';
import env from './env';

const server = http.createServer(app);
app.set('port', env.PORT);
app.set('io', new Server(server));

const hostname = env.HOST;
if (import.meta.env.PROD) {
  app.listen(app.get('port'), hostname);
}

export const viteNodeApp = app;
