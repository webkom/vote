var Bluebird = require('bluebird');
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

    this.Before(function() {
        return clearCollections().bind(this)
            .then(function() {
                var election = new Election(activeElectionData);
                return election.save();
            })
            .then(function(election) {
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
            });
    });

    this.registerHandler('BeforeFeatures', function(event, callback) {
        mongoose.connection.on('connected', () => server(callback));
    });

    this.registerHandler('AfterStep', function(event, callback) {
        // To make sure all tests run correctly we force
        // waiting for Angular after each step.
        // However, we don't want to do it after a step
        // that doesn't even use Angular (e.g. the login page)
        // so this is a decently ugly hack to get around that:
        browser.ignoreSynchronization = true;
        browser.getPageSource()
            .then(source => {
                browser.ignoreSynchronization = false;
                return source.includes('angular')
                    ? browser.waitForAngular() : Bluebird.resolve();
            })
            .then(callback, callback);
    });

    this.registerHandler('AfterFeatures', function(event, callback) {
        dropDatabase(callback);
    });
};
