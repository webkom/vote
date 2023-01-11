import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import csrf from 'csurf';
import flash from 'connect-flash';
import favicon from 'serve-favicon';
import raven from 'raven';
import router from './app/routes';
import User from './app/models/user';
import env from './env';
const app = express();

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', `${__dirname}/app/views`);
app.set('mongourl', env.MONGO_URL);

mongoose.connect(app.get('mongourl'));

raven.config(env.RAVEN_DSN).install();

app.use(raven.requestHandler());

if (['development', 'protractor'].includes(env.NODE_ENV)) {
  const webpack = import('webpack');
  const webpackMiddleware = import('webpack-dev-middleware');
  const config = import('./webpack.config.js');

  Promise.all([webpack, webpackMiddleware, config]).then(
    ([webpack, webpackMiddleware, config]) => {
      app.use(
        webpackMiddleware.default(webpack.default(config.default), {
          publicPath: config.output.publicPath,
        })
      );
    }
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
    store: MongoStore.create({ mongoUrl: app.get('mongourl') }),
    saveUninitialized: true,
    resave: false,
  })
);
const { ICON_SRC, NODE_ENV, RELEASE } = env;
app.locals = Object.assign({}, app.locals, {
  NODE_ENV,
  ICON_SRC,
  RELEASE,
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
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findByUsername(username);
      if (!user) return done(null, false);

      const result = await user.authenticate(password);

      return done(null, result && user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser<string>((user, cb) => {
  cb(null, user.username);
});
passport.deserializeUser<string>(async (username, cb) => {
  const user = await User.findByUsername(username);
  cb(null, user);
});

app.use('/', router);

app.use(raven.errorHandler());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({
    type: 'InvalidCSRFTokenError',
    message: 'Invalid or missing CSRF token',
    status: 403,
  });
});

export default app;
