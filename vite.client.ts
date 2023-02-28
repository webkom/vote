import { sveltekit, vitePreprocess } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()],
  preprocess: vitePreprocess(),
  test: {
    include: ['src/**/*.{test,spec}.{ts}'],
  },
};

export default config;
