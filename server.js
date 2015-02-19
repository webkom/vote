var socketIO = require('socket.io');
var app = require('./app');

app.set('port', process.env.PORT || 3000);

module.exports = function(callback) {
    var server = app.listen(app.get('port'), '0.0.0.0', function(err) {
        callback(err, app.get('port'));
    });
    app.set('io', socketIO(server));
};
