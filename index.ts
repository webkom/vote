import type { HttpError } from '@sveltejs/kit';
import type { Server } from 'socket.io';
import server from './server';

server((err: Error, port) => {
  if (err) throw err;
  console.log('Listening on %d', port); // eslint-disable-line no-console
});
