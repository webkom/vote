const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

module.exports = function() {
  this.Given(/^There is an (in)?active user with card key "([^"]*)"$/, function(
    active,
    cardKey
  ) {
    this.user.active = active !== 'in';
    this.user.cardKey = cardKey;
    return this.user.save();
  });
};
