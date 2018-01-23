const server = require('./server');

server((err, port) => {
  if (err) throw err;
  console.log('Listening on %d', port); // eslint-disable-line no-console
});
