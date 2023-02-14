import mongoose from 'mongoose';
import env from '../env';
import { beforeEach, afterAll } from 'vitest';
import { clearCollections, dropDatabase } from './helpers.js';

import chai from 'chai';
chai.should();

beforeEach(async () => {
  if (![1, 2].includes(mongoose.connection.readyState)) {
    await mongoose.connect(env.MONGO_URL, { dbName: env.MONGO_DB });
  }

  await clearCollections();
});

/**
 * Drop the database after running all tests
 */
afterAll(async () => {
  await dropDatabase();
});
