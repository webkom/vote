var express         = require('express');
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var passport        = require('passport');

var app = express();
mongoose.connect('mongodb://127.0.0.1:27017/test');

var models = require('./models')(mongoose);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
require('./modules/passport')(passport,models);

require('./routes')(app, express, models);


var server = app.listen(3000, function () {
    console.log("Running on port:" + server.address().port);
});

new models.User().save();
new models.User().save();
new models.User().save();


module.exports.app = app;
module.exports.db = models;

