var express         = require('express');
var app             = module.exports = express();
var mongoose        = require('mongoose');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var MongoStore      = require('connect-mongo')(session);
var passport        = require('passport');
var csrf            = require('csurf');
var flash           = require('connect-flash');
var router          = require('./app/routes');
var User            = require('./app/models/user');

app.disable('x-powered-by');
app.set('view engine', 'jade');
app.set('views', __dirname + '/app/views');
app.set('mongourl', process.env.MONGO_URL || 'mongodb://localhost:27017/vote');

mongoose.connect(app.get('mongourl'), function(err) {
    if (err) throw err;
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.locals.NODE_ENV = process.env.NODE_ENV || 'development';

app.use(session({
    cookie: { maxAge : 1000*3600*24*30*3 }, // Three months
    secret: process.env.COOKIE_SECRET || 'localsecret',
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    saveUninitialized: true,
    resave: false
}));

if (process.env.NODE_ENV == 'production') {
  var raven = require('raven');
  app.use(raven.middleware.express(process.env.RAVEN_DSN));
}

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
    app.use(csrf());

    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });

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

module.exports = app;
