const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { defineSupportCode } = require('cucumber');

chai.use(chaiAsPromised);

defineSupportCode(({ Given }) => {
  Given(/^There is an (in)?active user with card key "([^"]*)"$/, function(
    active,
    cardKey
  ) {
    this.user.active = active !== 'in';
    this.user.cardKey = cardKey;
    return this.user.save();
  });
});
