const Bluebird = require('bluebird');
const express = require('express');
const app = (module.exports = express());
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local');
const csrf = require('csurf');
const flash = require('connect-flash');
const favicon = require('serve-favicon');
const raven = require('raven');
const router = require('./app/routes');
const User = require('./app/models/user');

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', `${__dirname}/app/views`);
app.set('mongourl', process.env.MONGO_URL || 'mongodb://localhost:27017/vote');

mongoose.Promise = Bluebird;
mongoose.connect(app.get('mongourl'));

raven.config(process.env.RAVEN_DSN).install();

app.use(raven.requestHandler());

const store = new MongoStore({
  url: app.get('mongourl')
  // TODO: re-enable this when
  // https://github.com/jdesboeufs/connect-mongo/issues/277 is fixed:
  // mongooseConnection: mongoose.connection
});

// TODO: This can also be removed when the above is fixed:
mongoose.connection.on('disconnected', store.close.bind(store));

if (['development', 'protractor'].includes(process.env.NODE_ENV)) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const config = require('./webpack/dev.config');
  app.use(
    webpackMiddleware(webpack(config), {
      contentBase: 'public/',
      publicPath: config.output.publicPath
    })
  );
}

const publicPath = `${__dirname}/public`;
app.use(favicon(`${publicPath}/favicon.ico`));
app.use('/static', express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.locals.NODE_ENV = process.env.NODE_ENV || 'development';

app.use(
  session({
    cookie: { maxAge: 1000 * 3600 * 24 * 30 * 3 }, // Three months
    secret: process.env.COOKIE_SECRET || 'localsecret',
    store,
    saveUninitialized: true,
    resave: false
  })
);

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(csrf());

  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    let _user;
    User.findByUsername(username)
      .then(user => {
        if (!user) return false;
        _user = user;
        return user.authenticate(password);
      })
      .then(result => result && _user)
      .nodeify(done);
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.username);
});
passport.deserializeUser((username, cb) => {
  User.findByUsername(username)
    .exec()
    .nodeify(cb);
});

app.use('/', router);

app.use(raven.errorHandler());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({
    type: 'InvalidCSRFTokenError',
    message: 'Invalid or missing CSRF token',
    status: 403
  });
});

module.exports = app;
