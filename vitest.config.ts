import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    globalSetup: ['./test/cleanup.js'],
    // Our test setup is not thread safe atm
    maxThreads: 1,
    minThreads: 1,
  },
});
