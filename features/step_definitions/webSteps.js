module.exports = function() {

  this.World = require('../support/world').World;

  this.Given(/^I am logged in$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^I am on page "([^"]*)"$/, function (path, callback) {
    this.visit(path, callback);
  });

  this.Then(/^I see "([^"]*)"$/, function (text, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

};
