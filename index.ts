import server from './server';

server((err: Error, port) => {
  if (err) throw err;
  console.log('Listening on %d', port); // eslint-disable-line no-console
});
