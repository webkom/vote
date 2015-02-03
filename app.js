var express         = require('express');
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var MongoStore      = require('connect-mongo')(session);
var passport        = require('passport');
var path            = require('path');
var csrf            = require('csurf');
var router          = require('./app/routes');
var User            = require('./app/models/user');

var app = express();

app.set('mongourl', process.env.MONGO_URL || 'mongodb://localhost:27017/ads');

mongoose.connect(app.get('mongourl'), function(err) {
  if (err) throw err;
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  cookie: { maxAge : 1000*3600*24*30*3 }, // Three months
  secret: process.env.COOKIE_SECRET || 'localsecret',
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  saveUninitialized: true,
  resave: false
}));

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
    app.use(csrf({
        cookie: {
            key: 'XSRF-TOKEN'
        }
    }));

    app.use(function(err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN') return next(err);
        res.status(403).json({
            type: 'InvalidCSRFTokenError',
            message: 'Invalid or missing CSRF token',
            status: 403
        });
    });
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', router);

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

module.exports = app;
