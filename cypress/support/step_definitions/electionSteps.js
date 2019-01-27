import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

Given(/^There is an (in)?active election$/, function(arg) {
  const active = arg !== 'in';
  this.election.active = active;
  // return this.election.save();
});

/*const chai = require('chai');
const Bluebird = require('bluebird');
const chaiAsPromised = require('chai-as-promised');
const { defineSupportCode } = require('cucumber');
const Vote = require('../../app/models/vote');
const expect = chai.expect;

chai.use(chaiAsPromised);

defineSupportCode(({ Given, When, Then }) => {
  Given(/^There is an (in)?active election$/, function(arg) {
    const active = arg !== 'in';
    this.election.active = active;
    return this.election.save();
  });

  When(/^I submit the form$/, () => {
    element(by.tagName('form')).submit();
  });

  Then(/^I see an active election$/, function() {
    const title = element(by.binding('activeElection.title'));
    const description = element(by.binding('activeElection.description'));
    const alternatives = element.all(
      by.repeater('alternative in activeElection.alternatives')
    );

    return Bluebird.all([
      expect(title.getText()).to.eventually.equal(
        this.election.title.toUpperCase()
      ),
      expect(description.getText()).to.eventually.equal(
        this.election.description
      ),
      expect(alternatives.count()).to.eventually.equal(1),
      expect(alternatives.first().getText()).to.eventually.contain(
        this.alternative.description.toUpperCase()
      )
    ]);
  });

  function vote() {
    const alternatives = element.all(
      by.repeater('alternative in activeElection.alternatives')
    );
    const alternative = alternatives.first();
    const button = element(by.css('button'));

    alternative.click();
    button.click();
    button.click();
  }

  Given(/^I have voted on the election$/, vote);

  When(/^I vote on an election$/, vote);

  Then(/^I see my hash in "([^"]*)"$/, function(name) {
    const input = element(by.name(name));
    return Vote.findOne({ alternative: this.alternative.id }).then(foundVote =>
      expect(input.getAttribute('value')).to.eventually.equal(foundVote.hash)
    );
  });
});
*/
