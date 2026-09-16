import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import apiRouter from './server/routes.ts';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      const apiApp = express();
      apiApp.use((req, _res, next) => {
        if (req.url?.startsWith('/stripe/webhook') || req.originalUrl?.startsWith('/api/stripe/webhook')) {
          next();
        } else {
          express.json()(req, _res, next);
        }
      });
      apiApp.use('/api', apiRouter);
      server.middlewares.use(apiApp);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
