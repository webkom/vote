import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    globalSetup: ['./test/cleanup.js'],
    testTimeout: 20000,
  },
});
