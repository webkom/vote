import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './server.ts',
      tsCompiler: 'esbuild',
    }),
    yaml(),
  ],
  optimizeDeps: {
    exclude: ['nib'],
  },
});
