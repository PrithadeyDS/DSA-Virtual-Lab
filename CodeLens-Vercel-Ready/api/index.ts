/**
 * Vercel serverless entrypoint: a real Express app exported as the default
 * handler. All /api/* traffic is rewritten here by vercel.json.
 */
import express from 'express';
import cors from 'cors';
import { analyzeRequestBody } from './lib/analyze-request';

const app = express();

app.use(express.json({ limit: '1mb' }));

const configuredOrigins = (process.env['CORS_ORIGINS'] ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/healthz', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', (req: express.Request, res: express.Response) => {
  const result = analyzeRequestBody(req.body);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error, issues: result.issues });
    return;
  }
  res.json(result.data);
});

// Vercel may strip the function mount path when dispatching through /api.
// Supporting both forms keeps direct and rewritten requests equivalent.
app.post('/analyze', (req: express.Request, res: express.Response) => {
  const result = analyzeRequestBody(req.body);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error, issues: result.issues });
    return;
  }
  res.json(result.data);
});

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
