var express         = require('express');
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var passport        = require('passport');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');

var app = express();
mongoose.connect('mongodb://localhost:27017/test');

var models = require('./models')(mongoose);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({secret: 'AIDS is the real name for ADS'}));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
require('./modules/passport')(passport,models);

require('./routes')(app, express, models);


var server = app.listen(3000,() => {
    console.log(`Running on port: ${server.address().port}`);
});
