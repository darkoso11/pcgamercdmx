import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { readFile } from 'node:fs/promises';
import { environment } from './environments/environment';
import { buildBlogSitemap, SitemapPost } from './app/features/blog/services/blog-sitemap.utils';
import { join } from 'node:path';
import { getIndexingDirective } from './app/features/blog/services/blog-indexing.utils';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  // Traefik supplies these headers; hostname validation still uses allowedHosts.
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for', 'x-forwarded-port', 'x-forwarded-server'],
});

app.disable('x-powered-by');
app.use(compression());
app.use((request, response, next) => {
  const indexing = getIndexingDirective(request.hostname);
  if (indexing) response.setHeader('X-Robots-Tag', indexing);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  if (request.path === '/blog' || request.path.startsWith('/blog/')) response.setHeader('Cache-Control', 'no-store');
  next();
});
app.get('/healthz', (_request, response) => { response.type('text/plain').send('ok'); });
app.get(['/pc-gamer-gama-alta-cdmx', '/pc-gamer-gama-alta-cdmx/'], (request, response) => {
  const query = request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : '';
  response.redirect(301, `/pc-gamer-gama-alta${query}`);
});
app.use('/admin', (_request, response) => { response.sendStatus(404); });
app.get('/sitemap.xml', async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  const posts: SitemapPost[] = [];
  const now = new Date();
  try {
    for (let page = 0; page < 1000; page++) {
      const query = new URLSearchParams({
        'filter[published][_eq]': 'true', 'filter[published_at][_lte]': now.toISOString(),
        fields: '*', sort: 'id', limit: '100', offset: String(page * 100),
      });
      const upstream = await fetch(`${environment.directus.url}/items/pc_blog_posts?${query}`, { signal: AbortSignal.timeout(10000) });
      if (!upstream.ok) throw new Error('CMS unavailable');
      const result = await upstream.json() as { data: SitemapPost[] };
      if (!Array.isArray(result.data)) throw new Error('Invalid CMS response');
      posts.push(...result.data);
      if (result.data.length < 100) break;
      if (page === 999) throw new Error('Sitemap pagination limit exceeded');
    }
    const base = await readFile(join(browserDistFolder, 'sitemap.xml'), 'utf8');
    response.type('application/xml').send(buildBlogSitemap(base, posts, environment.siteUrl, now.getTime()));
  } catch {
    response.setHeader('Retry-After', '60');
    response.status(503).type('text/plain').send('Sitemap temporarily unavailable');
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders(response, path) {
      if (path.endsWith('.html') || path.endsWith('robots.txt')) response.setHeader('Cache-Control', 'no-cache');
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
