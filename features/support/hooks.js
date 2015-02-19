var mongoose = require('mongoose');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');
var helpers = require('../../test/helpers');
var server = require('../../server');
var apiHelpers = require('../../test/api/helpers');
var createUsers = apiHelpers.createUsers;
var clearCollections = helpers.clearCollections;
var dropDatabase = helpers.dropDatabase;

module.exports = function() {
    var activeElectionData = {
        title: 'activeElection1',
        description: 'active election 1',
        active: true
    };

    var testAlternative = {
        description: 'test alternative'
    };

    this.BeforeFeatures(function(e, callback) {
        mongoose.connection.on('connected', function() {
            server(callback);
        });
    });

    this.Before(function(callback) {
        return clearCollections().bind(this)
            .then(function() {
                var election = new Election(activeElectionData);
                return election.saveAsync();
            })
            .spread(function(election) {
                this.election = election;
                testAlternative.election = election;
                this.alternative = new Alternative(testAlternative);
                return election.addAlternative(this.alternative);
            })
            .then(function() {
                return createUsers();
            })
            .spread(function(user, adminUser) {
                this.user = user;
                this.adminUser = adminUser;
                return browser.manage().deleteAllCookies();
            }).then(callback).catch(callback);
    });

    this.AfterFeatures(function(e, callback) {
        dropDatabase(callback);
    });
};
