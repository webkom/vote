var chai = require('chai');
var Bluebird = require('bluebird');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;

chai.use(chaiAsPromised);

module.exports = function() {
    this.Then(/^I see a list of elections$/, function(callback) {
        var alternatives = element.all(by.repeater('election in elections'));
        var election = alternatives.first();

        Bluebird.all([
            expect(election.getText()).to.eventually.equal(this.election.title),
            expect(alternatives.count()).to.eventually.equal(1)
        ]).nodeify(callback);
    });
};
