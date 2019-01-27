module.exports.config = {
  baseUrl: 'http://localhost:3000',
  specs: ['*.feature'],
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  cucumberOpts: {
    format: ['json:example.json'],
    require: ['step_definitions/*.js', 'support/*.js'],
    strict: true
  },

  capabilities: {
    browserName: process.env.BROWSER,
    chromeOptions: {
      args: [
        process.env.HEADLESS && '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ].filter(Boolean)
    }
    specs: '*.feature',
    tags: false,
    backtrace: true,
    profile: false,
    'no-source': true
  }
};
