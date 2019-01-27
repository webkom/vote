/*
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const User = require('../../app/models/user');
*/
const Election = require('../../../app/models/election');
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

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


Then(/^I see a list of elections$/, function() {
    console.log(this)
    const alternatives = cy.get('[ng-repeat="election in elections"]')
    const election = alternatives.first()

    alternatives.should($div => {
      expect($div).to.have.length(1);
    });

    election.contains(this.election.title);
});

When(/^I create an election$/, function() {
    //cy.get('.new-alternative').click();
    cy.find('a').contains('Lag avstemning').click();
    const title = cy.get('[ng-model="election.title"]');
    const description = cy.get('[ng-model="election.description"]');
    const alternatives = cy.get('[ng-repeat="alternative in election.alternatives"]')
    // Add new alternative
    title.type(newElection.title);
    description.type(newElection.description);
    newElection.alternatives.forEach((alternative, i) => {
      alternatives
        .get('.input')
        .type(alternative.description);
    });
    title.submit();
    /*
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
    */
});

  Then(/^The election should exist$/, function() {
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
  });

/*
Given(/^There is an (in)?active user with card key "([^"]*)"$/, (active, cardKey) => {


  Then(/^I see a list of elections$/, function() {
    const alternatives = element.all(by.repeater('election in elections'));
    const election = alternatives.first();

    Bluebird.all([
      expect(election.getText()).to.eventually.equal(this.election.title),
      expect(alternatives.count()).to.eventually.equal(1)
    ]);
  });



  Given(/^The election has votes$/, function() {
    this.alternative.addVote(this.user);
  });

  Given(/^I am on the edit election page$/, function() {
    browser.get(`/admin/election/${this.election.id}/edit`);
  });

  Then(/^I should see votes$/, () => {
    const alternatives = element.all(
      by.repeater('alternative in election.alternatives')
    );
    const alternative = alternatives.first();
    const span = alternative.element(by.tagName('span'));

    return expect(span.getText()).to.eventually.equal('1 - 100 %');
  });

  When(/^I enter a new alternative "([^"]*)"$/, alternative => {
    const input = element(by.id('new-alternative'));
    input.sendKeys(alternative);
  });

  Then(/^I should see the alternative "([^"]*)"$/, alternativeText => {
    const alternatives = element.all(
      by
        .repeater('alternative in election.alternatives')
        .column('alternative.description')
    );

    return expect(alternatives.getText()).to.eventually.contain(
      alternativeText.toUpperCase()
    );
  });

  When(/^I scan card key "([^"]*)"$/, cardKey => {
    browser.executeScript(`window.postMessage("${cardKey}", "*");`);
  });

  When(/^I delete users$/, () => {
    const button = element(by.css('button'));

    button.click();
    button.click();
  });

  Then(/^I should see ([\d]+) in "([^"]*)"$/, (count, binding) => {
    const countElement = element(by.binding(binding));
    return expect(countElement.getText()).to.eventually.equal(String(count));
  });
});
*/
