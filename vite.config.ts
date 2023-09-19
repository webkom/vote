import { defineConfig } from 'vite';
import { VitePluginNode as vitePluginNode } from 'vite-plugin-node';
import yaml from '@rollup/plugin-yaml';
import copy from 'rollup-plugin-copy';
import { Server } from 'socket.io';
import env from './env';

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    ...vitePluginNode({
      // https://github.com/axe-me/vite-plugin-node/blob/main/packages/vite-plugin-node/src/server/express.ts
      // production's io-server is in server.ts
      adapter({ app, server, req, res }) {
        if (env.NODE_ENV !== 'production' && !app.get('io')) {
          const io = new Server(server.httpServer);
          app.set('io', io);
        }
        app(req, res);
      },
      appPath: './server.ts',
      tsCompiler: 'esbuild',
    }),
    yaml(),
    copy({
      targets: [
        { src: 'build/client', dest: 'dist/assets' },
        { src: 'app/digital/template.html', dest: 'dist/.' },
      ],
      hook: 'writeBundle',
    }),
  ],
  optimizeDeps: {
    exclude: ['nib'],
  },
});
