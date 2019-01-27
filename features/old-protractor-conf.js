exports.config = {
  capabilities: {
    browserName: process.env.BROWSER || 'chrome'
  },
  baseUrl: 'http://localhost:3000',
  specs: ['*.feature'],
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  directConnect: true,
  cucumberOpts: {
    require: ['step_definitions/*.js', 'support/*.js'],
    tags: false,
    backtrace: true,
    profile: false,
    'no-source': true
  }
};
