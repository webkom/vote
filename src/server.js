var express     = require('express');
var mongoose    = require('mongoose');

var app = express();
mongoose.connect('mongodb://localhost:27017/test');

var models = require('./models')(mongoose);

app.use(express.static(__dirname + '/public'));

require('./routes')(app, express);


require('./modules/passport')(models);


var server = app.listen(3000,() => {
    console.log(`Running on port: ${server.address().port}`);
});
