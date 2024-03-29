import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { csrfSync } from 'csrf-sync';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import flash from 'connect-flash';
import favicon from 'serve-favicon';
import raven from 'raven';
import router from './app/routes';
import User from './app/models/user';
import env from './env';
import path from 'path';
import { fileURLToPath } from 'url';
import type { HTTPError } from './app/errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Put whatever the type of our sessionData is here
// declare module 'express-session' {}

const app = express();

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', `./app/views`);
app.set('mongourl', env.MONGO_URL);

mongoose.set('strictQuery', true);
mongoose.connect(app.get('mongourl'), { dbName: env.MONGO_DB });

if (env.NODE_ENV == 'production') {
  raven.config(env.RAVEN_DSN).install();
  app.use(raven.requestHandler());
}

if (['development', 'protractor'].includes(env.NODE_ENV)) {
  const webpack = await import('webpack');
  const webpackMiddleware = await import('webpack-dev-middleware');
  // eslint-disable-next-line
  // @ts-ignore
  const config = await import('./webpack.config.ts');

  app.use(
    webpackMiddleware.default(webpack.default(config.default), {
      publicPath: config.default.output.publicPath,
    })
  );
}

const publicPath = `${__dirname}/public`;
app.use(favicon(`${publicPath}/favicon.ico`));
app.use('/static', express.static(publicPath));

app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(express.urlencoded({ extended: true }));

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

const { csrfSynchronisedProtection, invalidCsrfTokenError } = csrfSync({
  getTokenFromRequest: (req) => req.header('X-XSRF-TOKEN'),
});

/* istanbul ignore if */
if (env.NODE_ENV !== 'test') {
  app.use(csrfSynchronisedProtection);

  // Only used by old frontend
  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
}

const { ICON_SRC, NODE_ENV, RELEASE } = env;
app.locals = Object.assign({}, app.locals, {
  NODE_ENV,
  ICON_SRC,
  RELEASE,
});

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

if (env.NODE_ENV !== 'development') {
  // eslint-disable-next-line
  // @ts-ignore
  const { handler } = await import('./build/handler');
  app.use(handler);
}

app.use(raven.errorHandler());

app.use((err: HTTPError, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== invalidCsrfTokenError.code) return next(err);
  res.status(403).json({
    type: 'InvalidCSRFTokenError',
    message: 'Invalid or missing CSRF token',
    status: 403,
  });
});

export default app;
