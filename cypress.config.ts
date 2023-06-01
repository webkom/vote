import { defineConfig } from 'cypress';

import mongoose from 'mongoose';
import env from './env';
import cypressTasks from './cypress/config/tasks';

mongoose.connect(env.MONGO_URL, { dbName: env.MONGO_DB });

export const dropDatabase = () =>
  mongoose.connection.dropDatabase().then(() => mongoose.disconnect());

export default defineConfig({
  projectId: 'nke77g',
  env: {
    NODE_ENV: env.NODE_ENV,
  },
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', cypressTasks);
    },
  },
});
