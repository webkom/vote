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

    this.Given(/^I create an election$/, function(callback) {
        // Add new alterantive
        element(by.className('fa-plus-square')).click();

        var title = element(by.model('election.title'));
        var description = element(by.model('election.description'));
        var alternatives = element.all(by.repeater('alternative in election.alternatives'));
        var button = element(by.id('submit'));

        title.sendKeys(newElection.title);
        description.sendKeys(newElection.description);

        var alternative;
        for (var i = 0; i < newElection.alternatives.length; i++) {
            alternative = newElection.alternatives[i];
            alternatives.get(i).element(by.css('input')).sendKeys(alternative.description);
        }

        button.click().then(callback);
    });

    this.Then(/^I should be on "([^"]*)"$/, function(path, callback) {
        var re = new RegExp(path);
        expect(browser.getLocationAbsUrl()).to.eventually.match(re).notify(callback);
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
};
