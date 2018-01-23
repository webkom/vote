const chai = require('chai');
const Bluebird = require('bluebird');
const chaiAsPromised = require('chai-as-promised');
const Election = require('../../app/models/election');

const expect = chai.expect;

chai.use(chaiAsPromised);

module.exports = function() {
  const newElection = {
    title: 'new election',
    description: 'new description',
    alternatives: [
      {
        description: 'alternative 1'
      },
      {
        description: 'alternative 2'
      }
    ]
  };

  this.Then(/^I see a list of elections$/, function() {
    const alternatives = element.all(by.repeater('election in elections'));
    const election = alternatives.first();

    Bluebird.all([
      expect(election.getText()).to.eventually.equal(this.election.title),
      expect(alternatives.count()).to.eventually.equal(1)
    ]);
  });

  this.When(/^I create an election$/, () => {
    element(by.className('new-alternative')).click();
    const title = element(by.model('election.title'));
    const description = element(by.model('election.description'));
    const alternatives = element.all(
      by.repeater('alternative in election.alternatives')
    );
    // Add new alternative
    title.sendKeys(newElection.title);
    description.sendKeys(newElection.description);
    newElection.alternatives.forEach((alternative, i) => {
      alternatives
        .get(i)
        .element(by.css('input'))
        .sendKeys(alternative.description);
    });

    title.submit();
  });

  this.Then(/^The election should exist$/, () =>
    Election.find({ title: newElection.title })
      .populate('alternatives')
      .exec()
      .spread(election => {
        expect(election.description).to.equal(newElection.description);
        election.alternatives.forEach((alternative, i) => {
          expect(alternative.description).to.equal(
            newElection.alternatives[i].description
          );
        });
      })
  );

  this.Given(/^The election has votes$/, function() {
    this.alternative.addVote(this.user);
  });

  this.Given(/^I am on the edit election page$/, function() {
    browser.get(`/admin/election/${this.election.id}/edit`);
  });

  this.Then(/^I should see votes$/, () => {
    const alternatives = element.all(
      by.repeater('alternative in election.alternatives')
    );
    const alternative = alternatives.first();
    const span = alternative.element(by.tagName('span'));

    return expect(span.getText()).to.eventually.equal('1 - 100 %');
  });

  this.When(/^I enter a new alternative "([^"]*)"$/, alternative => {
    const input = element(by.id('new-alternative'));
    input.sendKeys(alternative);
  });

  this.Then(/^I should see the alternative "([^"]*)"$/, alternativeText => {
    const alternatives = element.all(
      by
        .repeater('alternative in election.alternatives')
        .column('alternative.description')
    );

    return expect(alternatives.getText()).to.eventually.contain(
      alternativeText.toUpperCase()
    );
  });

  this.When(/^I scan card key "([^"]*)"$/, cardKey => {
    browser.executeScript(`window.postMessage("${cardKey}", "*");`);
  });

  this.When(/^I delete users$/, () => {
    const button = element(by.css('button'));

    button.click();
    button.click();
  });

  this.Then(/^I should see ([\d]+) in "([^"]*)"$/, (count, binding) => {
    const countElement = element(by.binding(binding));
    return expect(countElement.getText()).to.eventually.equal(String(count));
  });
};
