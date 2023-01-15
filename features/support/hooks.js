import mongoose from 'mongoose';
import Election from '../../app/models/election';
import { ElectionSystems as ElectionTypes } from '../../app/types/types';
import Alternative from '../../app/models/alternative';
import {
  createUsers,
  clearCollections,
  dropDatabase,
} from '../../test/helpers';
import server from '../../server';

module.exports = function () {
  const activeSTVElectionData = {
    title: 'activeElectionSTV',
    type: ElectionTypes.STV,
    description: 'active election STV',
    active: true,
  };

  const activeNormalElectionData = {
    title: 'activeElection NORMAL',
    type: ElectionTypes.NORMAL,
    description: 'active election NORMAL',
    active: false,
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
    const stvElection = await new Election(activeSTVElectionData);
    this.stvElection = stvElection;
    this.election = stvElection;

    const normalElection = await new Election(activeNormalElectionData);
    this.normalElection = normalElection;

    this.alternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );

    this.stvAlternatives = await Promise.all(
      alternatives.map((alternative) => new Alternative(alternative))
    );

    for (let i = 0; i < alternatives.length; i++) {
      await stvElection.addAlternative(this.stvAlternatives[i]);
      await normalElection.addAlternative(this.alternatives[i]);
    }

    await createUsers().then(([user, adminUser]) => {
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

  this.registerHandler('AfterFeatures', async (event, callback) => {
    await dropDatabase(callback);
    callback();
  });
};
