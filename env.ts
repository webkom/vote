const env = {
  // URL/source to the logo on all pages
  ICON_SRC: process.env.ICON_SRC || '/static/images/Abakule.jpg',
  // Node environment. 'development', 'test' or 'production'
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Vote release version
  RELEASE: process.env.RELEASE || 'latest',
  // This cannot be empty when running in production
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  PORT: process.env.PORT || 3000,
  // Host used when binding. Use 0.0.0.0 to bind all interfaces
  HOST: process.env.HOST || 'localhost',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/vote',
  MONGO_DB:
    process.env.NODE_ENV == 'test' && process.env.VITEST_WORKER_ID
      ? `vote-test-${process.env.VITEST_WORKER_ID}`
      : null,
  REDIS_URL: process.env.REDIS_URL || 'localhost',
  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    (!process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : 'http://localhost:3000'),

  // Mail settings
  FROM: process.env.FROM || 'Abakus',
  FROM_MAIL: process.env.FROM_MAIL || 'admin@abakus.no',
  // Use one of the below
  GOOGLE_AUTH: process.env.GOOGLE_AUTH,
  SMTP_URL: process.env.SMTP_URL,

  // TODO FIXME
  RAVEN_DSN: '',
};

export default env;
