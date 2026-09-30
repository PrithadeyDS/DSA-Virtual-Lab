import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { analyzeRequestBody } from './api/lib/analyze-request';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'codelens-local-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'GET' && (req.url === '/api/health' || req.url === '/api/healthz')) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'ok' }));
            return;
          }

          if (req.method !== 'POST' || req.url !== '/api/analyze') {
            next();
            return;
          }

          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
              const result = analyzeRequestBody(body);
              res.statusCode = result.ok ? 200 : result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.ok ? result.data : { error: result.error, issues: result.issues }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Request body must be valid JSON.', issues: [] }));
            }
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
