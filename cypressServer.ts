import { Server } from 'socket.io';
import app from './app';
import env from './env';

app.set('port', env.PORT);

const hostname = env.HOST;
const server = app.listen(app.get('port'), hostname, () => {
  console.info(`Server listening on port ${app.get('port')}`);
});

app.set('io', new Server(server));

export default server;
