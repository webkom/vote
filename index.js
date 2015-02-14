var socketIO = require('socket.io');
var app = require('./app');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Listening on %d', app.get('port'));
});

app.set('io', socketIO(server));
