var chai = require('chai');
var Bluebird = require('bluebird');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);

module.exports = function() {
    this.Given(/^There is an (in)?active election$/, function(arg, callback) {
        var active = arg !== 'in';
        this.election.active = active;
        this.election.save(callback);
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
};
