import mongoose from 'mongoose';
import { clearCollections, dropDatabase } from '../helpers.js';

before((done) => {
  mongoose.connection.on('connected', done);
});

beforeEach(() => {
  clearCollections();
});

/**
 * Drop the database after running all tests
 */
after(() => dropDatabase());
