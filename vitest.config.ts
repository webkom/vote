import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    include: ['**/*.test.{js,ts}'],
    testTimeout: 10000,
  },
});
