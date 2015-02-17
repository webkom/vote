var server = require('./server');

server(function(err, port) {
    if (err) throw err;
    console.log('Listening on %d', port);
});
