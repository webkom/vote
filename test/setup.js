import mongoose from 'mongoose';
import env from '../env';
import { beforeEach } from 'vitest';
import { clearCollections } from './helpers.js';

import chai from 'chai';
chai.should();

beforeEach(async () => {
  if (![1, 2].includes(mongoose.connection.readyState)) {
    await mongoose.connect(env.MONGO_URL);
  }

  await clearCollections();
});
