
module.exports = function() {

  this.World = require('../support/world').World;

  this.Given(/^There is an (in)?active election$/, function (arg, callback) {
    var active = arg != 'in';
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^I see an active election$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^I have voted on the election$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

};
