var chai = require('chai');
var Bluebird = require('bluebird');
var chaiAsPromised = require('chai-as-promised');
var Vote = require('../../app/models/vote');
var expect = chai.expect;

chai.use(chaiAsPromised);

module.exports = function() {
    this.Given(/^There is an (in)?active election$/, function(arg, callback) {
        var active = arg !== 'in';
        this.election.active = active;
        this.election.save(callback);
    });

    this.Given(/^The election is (de)?activated/, function(arg, callback) {
        var active = arg !== 'de';
        this.election.active = active;
        this.election.save(callback);
    });

    this.When(/^I submit the form$/, function(callback) {
        element(by.tagName('form')).submit();
        callback();
    });

    this.Then(/^I see an active election$/, function(callback) {
        var title = element(by.binding('activeElection.title'));
        var description = element(by.binding('activeElection.description'));
        var alternatives = element.all(by.repeater('alternative in activeElection.alternatives'));

        Bluebird.all([
            expect(title.getText()).to.eventually.equal(this.election.title.toUpperCase()),
            expect(description.getText()).to.eventually.equal(this.election.description),
            expect(alternatives.count()).to.eventually.equal(1),
            expect(alternatives.first().getText()).to.eventually.contain(this.alternative.description.toUpperCase())
        ]).nodeify(callback);
    });

    function vote(callback) {
        var alternatives = element.all(by.repeater('alternative in activeElection.alternatives'));
        var alternative = alternatives.first();
        var button = element(by.css('button'));

        alternative.click();
        button.click();
        button.click();
        browser.waitForAngular().then(callback);
    }

    this.Given(/^I have voted on the election$/, vote);

    this.When(/^I vote on an election$/, vote);

    this.Then(/^I see my hash in "([^"]*)"$/, function(id, callback) {
        var input = element(by.id(id));
        Vote.findOneAsync({ alternative: this.alternative.id })
            .then(function(vote) {
                return expect(input.getAttribute('value'))
                    .to.eventually.equal(vote.hash);
            }).nodeify(callback);
    });
};
