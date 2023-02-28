import { Server } from 'socket.io';
import app from './app';
import env from './env';
import type { Server as HttpServer } from 'http';

app.set('port', env.PORT);

const hostname = env.HOST;
let server:
  | (HttpServer & ((handler: (err: Error, port: number) => void) => void))
  | null;
if (import.meta.env.PROD) {
  const server = app.listen(app.get('port'), hostname, () => {
    console.info(`Server listening on port ${app.get('port')}`);
  });
  app.set('io', new Server(server));
}

export const viteNodeApp = app;

export default server;
