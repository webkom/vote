var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');

var app = express();
mongoose.connect('mongodb://localhost:27017/test');

var models = require('./models')(mongoose);

app.use(express.static(__dirname + '/public'));
// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

require('./routes')(app, express, models);

require('./modules/passport')(models);

var server = app.listen(3000,() => {
    console.log(`Running on port: ${server.address().port}`);
});
