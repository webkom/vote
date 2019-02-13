exports.config = {
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        process.env.HEADLESS && '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ].filter(Boolean)
    }
  },
  baseUrl: 'http://localhost:3000',
  specs: ['*.feature'],
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  directConnect: true,
  cucumberOpts: {
    require: ['step_definitions/*.js', 'support/*.js'],
    backtrace: true
  }
};
