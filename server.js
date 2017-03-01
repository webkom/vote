var socketIO = require('socket.io');
var app = require('./app');

app.set('port', process.env.PORT || 5861);

module.exports = function(callback) {
    var server = app.listen(app.get('port'), 'localhost', function(err) {
        callback(err, app.get('port'));
    });
    app.set('io', socketIO(server));
};
