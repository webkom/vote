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
    browserName: process.env.BROWSER || 'chrome',
    specs: '*.feature',
    tags: false,
    backtrace: true,
    profile: false,
    'no-source': true
  }
};
