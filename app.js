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
const env = require('./env');

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', `${__dirname}/app/views`);
app.set('mongourl', env.MONGO_URL);

mongoose.Promise = Bluebird;
mongoose.connect(app.get('mongourl'), {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
});

raven.config(env.RAVEN_DSN).install();

app.use(raven.requestHandler());

if (['development', 'protractor'].includes(env.NODE_ENV)) {
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const config = require('./webpack.config');
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

if (env.NODE_ENV === 'production' && !env.COOKIE_SECRET) {
  throw 'When running in production, you need to set the COOKIE_SECRET environment variable to something secret, else your setup will be insecure';
}

app.use(
  session({
    cookie: { maxAge: 1000 * 3600 * 24 * 30 * 3 }, // Three months
    secret: env.COOKIE_SECRET || 'localsecret',
    store: new MongoStore({ mongooseConnection: mongoose.connection }), //re-use existing connection
    saveUninitialized: true,
    resave: false
  })
);
const { LOGO_SRC, NODE_ENV } = env;
app.locals = Object.assign({}, app.locals, {
  NODE_ENV,
  LOGO_SRC
});

/* istanbul ignore if */
if (env.NODE_ENV !== 'test') {
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
