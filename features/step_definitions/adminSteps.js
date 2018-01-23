var chai = require('chai');
var Bluebird = require('bluebird');
var chaiAsPromised = require('chai-as-promised');
var Election = require('../../app/models/election');

var expect = chai.expect;

chai.use(chaiAsPromised);

module.exports = function() {
  var newElection = {
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
    var alternatives = element.all(by.repeater('election in elections'));
    var election = alternatives.first();

    Bluebird.all([
      expect(election.getText()).to.eventually.equal(this.election.title),
      expect(alternatives.count()).to.eventually.equal(1)
    ]);
  });

  this.When(/^I create an election$/, function() {
    element(by.className('new-alternative')).click();
    var title = element(by.model('election.title'));
    var description = element(by.model('election.description'));
    var alternatives = element.all(
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

  this.Then(/^The election should exist$/, function() {
    return Election.find({ title: newElection.title })
      .populate('alternatives')
      .exec()
      .spread(function(election) {
        expect(election.description).to.equal(newElection.description);
        election.alternatives.forEach(function(alternative, i) {
          expect(alternative.description).to.equal(
            newElection.alternatives[i].description
          );
        });
      });
  });

  this.Given(/^The election has votes$/, function() {
    this.alternative.addVote(this.user);
  });

  this.Given(/^I am on the edit election page$/, function() {
    browser.get('/admin/election/' + this.election.id + '/edit');
  });

  this.Then(/^I should see votes$/, function() {
    var alternatives = element.all(
      by.repeater('alternative in election.alternatives')
    );
    var alternative = alternatives.first();
    var span = alternative.element(by.tagName('span'));

    return expect(span.getText()).to.eventually.equal('1 - 100 %');
  });

  this.When(/^I enter a new alternative "([^"]*)"$/, function(alternative) {
    var input = element(by.id('new-alternative'));
    input.sendKeys(alternative);
  });

  this.Then(/^I should see the alternative "([^"]*)"$/, function(
    alternativeText
  ) {
    var alternatives = element.all(
      by
        .repeater('alternative in election.alternatives')
        .column('alternative.description')
    );

    return expect(alternatives.getText()).to.eventually.contain(
      alternativeText.toUpperCase()
    );
  });

  this.When(/^I scan card key "([^"]*)"$/, function(cardKey) {
    browser.executeScript('window.postMessage("' + cardKey + '", "*");');
  });

  this.When(/^I delete users$/, function() {
    var button = element(by.css('button'));

    button.click();
    button.click();
  });

  this.Then(/^I should see ([\d]+) in "([^"]*)"$/, function(count, binding) {
    var countElement = element(by.binding(binding));
    return expect(countElement.getText()).to.eventually.equal(String(count));
  });
};
