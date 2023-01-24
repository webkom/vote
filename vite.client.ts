import { sveltekit } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{ts}'],
  },
};

export default config;
