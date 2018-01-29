const mongoose = require('mongoose');
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const helpers = require('../../test/helpers');
const server = require('../../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;

module.exports = function() {
  const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true
  };

  const testAlternative = {
    description: 'test alternative'
  };

  this.Before(function() {
    return clearCollections()
      .bind(this)
      .then(() => {
        const election = new Election(activeElectionData);
        return election.save();
      })
      .then(function(election) {
        this.election = election;
        testAlternative.election = election;
        this.alternative = new Alternative(testAlternative);
        return election.addAlternative(this.alternative);
      })
      .then(() => createUsers())
      .spread(function(user, adminUser) {
        this.user = user;
        this.adminUser = adminUser;
      });
  });

  this.registerHandler('BeforeFeatures', (event, callback) => {
    mongoose.connection.on('connected', () => server(callback));
  });

  this.registerHandler('AfterStep', (
    event,
    callback // To make sure all tests run correctly we force
  ) =>
    // waiting for Angular after each step.

    browser.waitForAngular().then(callback, err => {
      const message = err.message || err;
      if (message.includes('window.angular')) callback();
      else callback(err);
    })
  );

  this.registerHandler('AfterFeatures', (event, callback) => {
    dropDatabase(callback).nodeify(callback);
  });
};
