import express from 'express';
import compression from 'compression';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const host = '127.0.0.1';
const port = Number(process.env['PORT'] || 4200);
const browserRoot = fileURLToPath(
  new URL('../dist/pcgamercdmx/browser/', import.meta.url)
);
const indexPath = path.join(browserRoot, 'index.html');

await access(indexPath);

const app = express();
app.disable('x-powered-by');
app.use(compression());
// Serve each prerendered route's own index.html before falling back to the SPA shell.
// This preserves SSR content and TransferState for direct links and remote previews.
app.use(express.static(browserRoot, { index: 'index.html' }));
app.use((request, response) => {
  if (request.method !== 'GET' || !request.accepts('html')) {
    response.sendStatus(404);
    return;
  }
  response.sendFile(indexPath);
});

const server = app.listen(port, host, () => {
  console.log(`Production browser bundle available at http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
