const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Election = require('../../app/models/election');
const User = require('../../app/models/user');

const expect = chai.expect;

const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'

chai.use(chaiAsPromised);

module.exports = function () {
  const newElection = {
    title: 'new election',
    description: 'new description',
    alternatives: [
      {
        description: 'alternative 1',
      },
      {
        description: 'alternative 2',
      },
    ],
  };

  this.Then(/^I see a list of elections$/, function () {
    const alternatives = element.all(by.repeater('election in elections'));
    const election = alternatives.first();

    Promise.all([
      expect(election.element(by.css('span')).getText()).to.eventually.equal(
        this.stvElection.title
      ),
      expect(alternatives.count()).to.eventually.equal(2),
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
      .spread((election) => {
        expect(election.description).to.equal(newElection.description);
        election.alternatives.forEach((alternative, i) => {
          expect(alternative.description).to.equal(
            newElection.alternatives[i].description
          );
        });
      })
  );

  this.Given(/^There are (\d+) users$/, async function (userCount) {
    this.users = await Promise.all(
      [...Array(Number(userCount)).keys()].map((i) =>
        User.create({
          username: `testuser${i}`,
          cardKey: `${i}${i}TESTCARDKEY`,
          hash,
        })
      )
    );
  });

  this.Then(
    /The election(?: "([^"]*)")? should have ([^"]*) "([^"]*)"/,
    (electionTitle, field, value) => {
      Election.find({ title: electionTitle || newElection.title })
        .exec()
        .spread((election) => {
          expect(election[field].toString()).to.equal(value);
        });
    }
  );

  this.Given(
    /^The election has "([^"]*)" (\d+)|(?:"([^"]*)")$"/,
    async function (field, num, str) {
      this.election[field] = num || str;
      await this.election.save();
    }
  );

  this.Given(/^The election has(?: (\d+))? votes$/, async function (count) {
    if (count) {
      for (let i = 0; i < count; i++) {
        await this.election.addVote(this.users[i], [this.alternatives[i]]);
      }
    } else {
      await this.election.addVote(this.user, [this.alternatives[0]]);
    }
  });

  this.Given(/^I am on the edit election page$/, function () {
    browser.get(`/admin/election/${this.election.id}/edit`);
  });

  this.Then(/^I should see the stv log$/, function () {
    const alternatives = element.all(
      by.repeater('(key, value) in elem.counts')
    );
    const alternative = alternatives.first();

    return Promise.all([
      expect(alternative.getText()).to.eventually.equal(
        `${this.alternatives[0].description} with 1 votes`
      ),
      expect(alternatives.get(1).getText()).to.eventually.equal(
        `${this.alternatives[1].description} with 1 votes`
      ),
      expect(alternatives.get(2).getText()).to.eventually.equal(
        `${this.alternatives[2].description} with 0 votes`
      ),
    ]);
  });

  this.Then(/^There should be (\d+) winners?$/, (count) => {
    const winners = element.all(
      by.repeater('winner in election.result.winners')
    );
    return expect(winners.count()).to.eventually.equal(Number(count));
  });

  this.Then(/^I should see "([^"]*)" as winner (\d+)$/, (winner, number) => {
    const winners = element.all(
      by.repeater('winner in election.result.winners')
    );

    return expect(
      winners.get(Number(number) - 1).getText()
    ).to.eventually.equal(`Vinner ${number}: ${winner}`);
  });

  this.When(/^I enter a new alternative "([^"]*)"$/, (alternative) => {
    const input = element(by.id('new-alternative'));
    input.sendKeys(alternative);
  });

  this.Then(/^I should see the alternative "([^"]*)"$/, (alternativeText) => {
    const alternatives = element.all(
      by
        .repeater('alternative in election.alternatives')
        .column('alternative.description')
    );

    return expect(alternatives.getText()).to.eventually.contain(
      alternativeText.toUpperCase()
    );
  });

  this.Then(/^I should see ([\d]+) in "([^"]*)"$/, (count, binding) => {
    const countElement = element.all(by.binding(binding)).first();
    return expect(countElement.getText()).to.eventually.equal(String(count));
  });
};
