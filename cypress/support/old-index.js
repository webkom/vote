const mongoose = require('mongoose');
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const helpers = require('../../test/helpers');
//const server = require('../../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;

const activeElectionData = {
title: 'activeElection1',
description: 'active election 1',
active: true
};

const testAlternative = {
description: 'test alternative'
};

describe('Hooks', function() {
    before(() => {
        cy.log('BEFORE, CONNECT!')
        //mongoose.connection.on('connected', () => server(callback));
    })

    after(() => {
        cy.log('AFTER, DROP!')
        //dropDatabase(callback).nodeify(callback);
    })

    beforeEach(() => {
      cy.log('I run before every test in every spec file!!!!!!')
      return clearCollections()
      .then(() => {
        const election = new Election(activeElectionData);
        return election.save();
      })
      .then(election => {
          cy.wrap(election).as('election');
        testAlternative.election = election;
        const alternative = new Alternative(testAlternative);
          cy.wrap(alternative).as('alternative');
        return election.addAlternative(alternative);
      })
      .then(() => createUsers())
      .spread((user, adminUser) => {
        cy.wrap(user).as('user');
        cy.wrap(adminUser).as('adminUser');
      })
    });
});

/*
  this.registerHandler('AfterFeatures', (event, callback) => {
    dropDatabase(callback).nodeify(callback);
  });
*/

/*
this.registerHandler('BeforeFeatures', (event, callback) => {
  mongoose.connection.on('connected', () => server(callback));
});
*/

/*
beforeEach(() => {
  cy.log('I run before every test in every spec file!!!!!!')
})
*/
