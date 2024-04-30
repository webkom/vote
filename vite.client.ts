import { sveltekit, vitePreprocess } from '@sveltejs/kit/vite';
import env from './env';
import path from 'path';
import yaml from '@rollup/plugin-yaml';

const config = {
  plugins: [sveltekit(), yaml()],
  preprocess: vitePreprocess(),
  test: {
    include: ['src/**/*.{test,spec}.{ts}'],
  },
  resolve: {
    alias: {
      $backend: path.resolve('./app'),
    },
  },
  server: {
    fs: {
      allow: ['app', 'build', 'usage.yml'],
    },
    proxy: {
      '^/$': `http://${env.HOST}:${env.PORT}/`,
      '/api': `http://${env.HOST}:${env.PORT}`,
      '/socket.io': {
        target: `ws://${env.HOST}:${env.PORT}`,
        ws: true,
      },
    },
  },
};

export default config;
