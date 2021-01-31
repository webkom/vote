module.exports = {
  // URL/source to the logo on all pages
  ICON_SRC: process.env.ICON_SRC || '/static/images/Abakule.jpg',
  LOGO_SRC:
    process.env.LOGO_SRC ||
    'https://abakus.no/185f9aa436cf7f5da598fd7e07700efd.png',
  // Node environment. 'development' or 'production'
  NODE_ENV: process.env.NODE_ENV || 'development',
  // This cannot be empty when running in production
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  PORT: process.env.PORT || 3000,
  // Host used when binding. Use 0.0.0.0 to bind all interfaces
  HOST: process.env.HOST || 'localhost',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/vote',
  REDIS_URL: process.env.REDIS_URL || 'localhost',
  // Mail auth
  GOOGLE_AUTH: process.env.GOOGLE_AUTH,
  GOOGLE_FROM_MAIL: process.env.GOOGLE_FROM_MAIL || '',
  // Dev mail auth
  ETHEREAL: process.env.ETHEREAL,
  //
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
