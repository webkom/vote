const mongoose = require('mongoose');
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const helpers = require('../../test/helpers');
const server = require('../../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;

module.exports = function () {
  const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true,
  };

  const testAlternative = {
    description: 'test alternative',
  };
  const testAlternative2 = {
    description: 'another test alternative',
  };
  const testAlternative3 = {
    description: 'last test alternative',
  };

  const alternatives = [testAlternative, testAlternative2, testAlternative3];

  this.Before(async function () {
    await clearCollections();
    const election = await new Election(activeElectionData);
    this.election = election;
    this.alternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );

    for (let i = 0; i < alternatives.length; i++) {
      await election.addAlternative(this.alternatives[i]);
    }

    await createUsers().spread((user, adminUser) => {
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

    browser.waitForAngular().then(callback, (err) => {
      const message = err.message || err;
      if (message.includes('window.angular')) callback();
      else callback(err);
    })
  );

  this.registerHandler('AfterFeatures', (event, callback) => {
    dropDatabase(callback).nodeify(callback);
  });
};
