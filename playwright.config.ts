import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: 'src/test/',
  testMatch: /.*\.(spec)\.(ts|js)/,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
};

export default config;
