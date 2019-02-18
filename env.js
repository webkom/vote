module.exports = {
  // URL/source to the logo on all pages
  LOGO_SRC: process.env.LOGO_SRC || '/static/images/Abakule.jpg',
  // Node environment. 'development' or 'production'
  NODE_ENV: process.env.NODE_ENV || 'development',
  // This cannot be empty when running in production
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  PORT: process.env.PORT || 3000,
  // Host used when binding. Use 0.0.0.0 to bind all interfaces
  HOST: process.env.HOST || 'localhost',
  // DSN url for reporting errors to sentry
  RAVEN_DSN: process.env.RAVEN_DSN,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/vote',
  REDIS_URL: process.env.REDIS_URL || 'localhost'
};
