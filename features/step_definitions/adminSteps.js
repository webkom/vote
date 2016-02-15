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

    this.Then(/^I see a list of elections$/, function(callback) {
        var alternatives = element.all(by.repeater('election in elections'));
        var election = alternatives.first();

        Bluebird.all([
            expect(election.getText()).to.eventually.equal(this.election.title),
            expect(alternatives.count()).to.eventually.equal(1)
        ]).nodeify(callback);
    });

    this.When(/^I create an election$/, function(callback) {
        // Add new alternative
        element(by.className('new-alternative')).click();

        var title = element(by.model('election.title'));
        var description = element(by.model('election.description'));
        var alternatives = element.all(by.repeater('alternative in election.alternatives'));

        title.sendKeys(newElection.title);
        description.sendKeys(newElection.description);

        var alternative;
        for (var i = 0; i < newElection.alternatives.length; i++) {
            alternative = newElection.alternatives[i];
            alternatives.get(i).element(by.css('input')).sendKeys(alternative.description);
        }

        title.submit();
        browser.waitForAngular().then(callback);
    });

    this.Then(/^The election should exist$/, function(callback) {
        Election
            .find({ title: newElection.title })
            .populate('alternatives')
            .execAsync()
            .spread(function(election) {
                expect(election.description).to.equal(newElection.description);
                election.alternatives.forEach(function(alternative, i) {
                    expect(alternative.description).to.equal(newElection.alternatives[i].description);
                });
            })
            .nodeify(callback);
    });

    this.Given(/^The election has votes$/, function(callback) {
        this.alternative.addVote(this.user).nodeify(callback);
    });

    this.Given(/^I am on the edit election page$/, function(callback) {
        browser.get('/admin/election/' + this.election.id + '/edit');
        callback();
    });

    this.Then(/^I should see votes$/, function(callback) {
        var alternatives = element.all(by.repeater('alternative in election.alternatives'));
        var alternative = alternatives.first();
        var span = alternative.element(by.tagName('span'));

        expect(span.getText()).to.eventually.equal('1 - 100 %').notify(callback);
    });

    this.When(/^I enter a new alternative "([^"]*)"$/, function(alternative, callback) {
        var input = element(by.id('new-alternative'));
        input.sendKeys(alternative);
        callback();
    });

    this.Then(/^I should see the alternative "([^"]*)"$/, function(alternativeText, callback) {
        var alternatives = element.all(
            by.repeater('alternative in election.alternatives').column('alternative.description')
        );
        expect(alternatives.getText()).to.eventually.contain(alternativeText.toUpperCase()).notify(callback);
    });

    this.When(/^I scan card key "([^"]*)"$/, function(cardKey, callback) {
        browser.executeScript('window.postMessage("' + cardKey + '", "*");');
        browser.waitForAngular().then(callback);
    });

    this.When(/^I delete users$/, function(callback) {
        var button = element(by.css('button'));

        button.click();
        button.click();
        browser.waitForAngular().then(callback);
    });

    this.Then(/^I should see ([\d]+) in "([^"]*)"$/, function(count, binding, callback) {
        var countElement = element(by.binding(binding));
        expect(countElement.getText()).to.eventually.equal(String(count)).notify(callback);
    });
};
