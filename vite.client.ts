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
      '^/$': {
        target: `http://${env.HOST}:${env.PORT}/`,
        changeOrigin: false,
      },
      '/api': {
        target: `http://${env.HOST}:${env.PORT}`,
        changeOrigin: false,
      },
      '/socket.io': {
        target: `ws://${env.HOST}:${env.PORT}`,
        ws: true,
        changeOrigin: false,
      },
    },
  },
};

export default config;
