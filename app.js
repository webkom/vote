var Bluebird = require('bluebird');
var express = require('express');
var app = module.exports = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local');
var csrf = require('csurf');
var flash = require('connect-flash');
var favicon = require('serve-favicon');
var raven = require('raven');
var router = require('./app/routes');
var User = require('./app/models/user');

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', __dirname + '/app/views');
app.set('mongourl', process.env.MONGO_URL || 'mongodb://localhost:27017/vote');

mongoose.Promise = Bluebird;
mongoose.connect(app.get('mongourl'));

raven
    .config(process.env.RAVEN_DSN)
    .install();

app.use(raven.requestHandler());

var store = new MongoStore({
    url: app.get('mongourl')
    // TODO: re-enable this when
    // https://github.com/jdesboeufs/connect-mongo/issues/277 is fixed:
    // mongooseConnection: mongoose.connection
});

// TODO: This can also be removed when the above is fixed:
mongoose.connection.on('disconnected', store.close.bind(store));

if (['development', 'protractor'].indexOf(process.env.NODE_ENV) !== -1) {
    var webpack = require('webpack');
    var webpackMiddleware = require('webpack-dev-middleware');
    var config = require('./webpack/dev.config');
    app.use(webpackMiddleware(webpack(config), {
        contentBase: 'public/',
        publicPath: config.output.publicPath
    }));
}

var publicPath = `${__dirname}/public`;
app.use(favicon(`${publicPath}/favicon.ico`));
app.use('/static', express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.locals.NODE_ENV = process.env.NODE_ENV || 'development';

app.use(session({
    cookie: { maxAge: 1000 * 3600 * 24 * 30 * 3 }, // Three months
    secret: process.env.COOKIE_SECRET || 'localsecret',
    store: store,
    saveUninitialized: true,
    resave: false
}));

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
    app.use(csrf());

    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
    var _user;
    User.findByUsername(username)
        .then(user => {
            if (!user) return false;
            _user = user;
            return user.authenticate(password);
        })
        .then(result => result && _user)
        .nodeify(done);
}));

passport.serializeUser((user, cb) => { cb(null, user.username); });
passport.deserializeUser((username, cb) => {
    User.findByUsername(username).exec().nodeify(cb);
});

app.use('/', router);

app.use(raven.errorHandler());
app.use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).json({
        type: 'InvalidCSRFTokenError',
        message: 'Invalid or missing CSRF token',
        status: 403
    });
});

module.exports = app;
