import { defineConfig } from 'vite';
import { VitePluginNode as vitePluginNode } from 'vite-plugin-node';
import yaml from '@rollup/plugin-yaml';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    ...vitePluginNode({
      adapter: 'express',
      appPath: './server.ts',
      tsCompiler: 'esbuild',
    }),
    yaml(),
    copy({
      targets: [{ src: 'build/client', dest: 'dist/assets' }],
      hook: 'writeBundle',
    }),
  ],
  optimizeDeps: {
    exclude: ['nib'],
  },
});
