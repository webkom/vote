const chai = require('chai');
const Bluebird = require('bluebird');
const chaiAsPromised = require('chai-as-promised');
const Vote = require('../../app/models/vote');
const ElectionTypes = require('../../app/models/utils');
const expect = chai.expect;

chai.use(chaiAsPromised);

by.addLocator(
  'sortableListItems',
  (sortableList, opt_parentElement, opt_rootSelector) => {
    var using = opt_parentElement || document;
    return using.querySelectorAll(`[sortable-list="${sortableList}"] li`);
  }
);

module.exports = function () {
  this.Given(/^There is an (in)?active "([^"]*)" election$/, async function (
    arg,
    electionType
  ) {
    this.normalElection.active = false;
    this.stvElection.active = false;
    await this.normalElection.save();
    await this.stvElection.save();

    const active = arg !== 'in';
    if (electionType === ElectionTypes.STV) {
      this.election = this.stvElection;
    } else if (electionType === ElectionTypes.NORMAL) {
      this.election = this.normalElection;
    }
    this.election.active = active;
    return this.election.save();
  });

  this.Given(/^There is an (in)?active election$/, async function (arg) {
    const active = arg !== 'in';
    this.stvElection.active = false;
    await this.stvElection.save();
    this.election = this.normalElection;
    this.election.active = active;
    return this.election.save();
  });

  this.Given(/^The election is (de)?activated/, function (arg) {
    const active = arg !== 'de';
    this.election.active = active;
    return this.election.save();
  });

  this.When(/^I submit the form$/, () => {
    element(by.tagName('form')).submit();
  });

  this.Then(/^I see an active election$/, function () {
    const title = element(by.binding('activeElection.title'));
    const description = element(by.binding('activeElection.description'));
    const alternatives = element.all(
      by.repeater('alternative in getPossibleAlternatives()')
    );

    return Bluebird.all([
      expect(title.getText()).to.eventually.equal(
        this.election.title.toUpperCase()
      ),
      expect(description.getText()).to.eventually.equal(
        this.election.description
      ),
      expect(alternatives.count()).to.eventually.equal(
        this.alternatives.length
      ),
      expect(alternatives.first().getText()).to.eventually.contain(
        this.alternatives[0].description.toUpperCase()
      ),
    ]);
  });

  this.When(/^I select "([^"]*)"$/, function (alternative) {
    const alternatives = element.all(
      by.repeater('alternative in getPossibleAlternatives()')
    );
    const wantedAlternative = alternatives
      .filter((a) =>
        a.getText().then((text) => text === alternative.toUpperCase())
      )
      .first();

    wantedAlternative.click();
  });

  function confirmVote(confirmation) {
    const denyButton = element(by.buttonText('Avbryt'));
    const confirmButton = element(by.buttonText('Bekreft'));

    confirmation ? confirmButton.click() : denyButton.click();
  }

  this.When(/^I (deny|confirm) the vote$/, (buttonText) => {
    confirmVote(buttonText == 'confirm');
  });

  this.When(/^I submit the vote$/, () => {
    element(by.css('button')).click();
  });

  function vote(election) {
    let alternatives;
    if (election.type === ElectionTypes.STV)
      alternatives = element.all(
        by.repeater('alternative in getPossibleAlternatives()')
      );
    else if (election.type === ElectionTypes.NORMAL)
      alternatives = element.all(
        by.repeater('alternative in activeElection.alternatives')
      );
    const alternative = alternatives.first();
    const button = element(by.buttonText('Avgi stemme'));

    alternative.click();
    button.click();
  }

  this.Given(/^I have voted on the election$/, function () {
    vote(this.election);
    confirmVote(true);
  });

  this.When(/^I vote on an election$/, function () {
    vote();
    confirmVote(true);
  });

  this.Then(/^I see my hash in "([^"]*)"$/, function (name) {
    const input = element(by.name(name));
    return Vote.findOne({
      priorities: {
        $all: [this.alternatives[0]],
      },
    }).then((foundVote) =>
      expect(input.getAttribute('value')).to.eventually.equal(foundVote.hash)
    );
  });

  this.Then(/^I see "([^"]*)" as priority (\d+)$/, function (
    alternative,
    position
  ) {
    const priorities = element.all(by.sortableListItems('priorities'));

    return expect(
      priorities.get(Number(position) - 1).getText()
    ).to.eventually.contain(alternative.toUpperCase());
  });

  this.Then(
    /^I see "([^"]*)" as priority (\d+) on the confirmation ballot$/,
    function (alternative, position) {
      const priorities = element.all(by.repeater('alternative in priorities'));

      return expect(
        priorities.get(Number(position) - 1).getText()
      ).to.eventually.contain(alternative.toUpperCase());
    }
  );

  this.Then(/^I see "([^"]*)" as priority (\d+) on the receipt$/, function (
    alternative,
    position
  ) {
    const priorities = element.all(
      by.repeater('alternative in vote.priorities')
    );

    return expect(
      priorities.get(Number(position) - 1).getText()
    ).to.eventually.contain(alternative.toUpperCase());
  });
};
