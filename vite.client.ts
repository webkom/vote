import { sveltekit, vitePreprocess } from '@sveltejs/kit/vite';
import env from './env';

const config = {
  plugins: [sveltekit()],
  preprocess: vitePreprocess(),
  test: {
    include: ['src/**/*.{test,spec}.{ts}'],
  },
  server: {
    proxy: {
      '^/$': `http://${env.HOST}:${env.PORT}/`,
      '/api': `http://${env.HOST}:${env.PORT}/`,
    },
  },
};

export default config;
