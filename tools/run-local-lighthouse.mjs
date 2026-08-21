import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const port = 4200;
const url = `http://127.0.0.1:${port}/`;
const outputDirectory = new URL('../test-results/lighthouse/', import.meta.url);
const outputFile = new URL('mobile.json', outputDirectory);

const server = spawn(process.execPath, ['tools/serve-browser-build.mjs'], {
  cwd: new URL('../', import.meta.url),
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

let chrome;

try {
  await waitForServer(url, 30_000);
  chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
  });

  if (!result) {
    throw new Error('Lighthouse did not return a result.');
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputFile, result.report, 'utf8');

  const categories = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([id, category]) => [
      id,
      Math.round((category.score ?? 0) * 100),
    ])
  );
  const metrics = Object.fromEntries(
    [
      'first-contentful-paint',
      'largest-contentful-paint',
      'total-blocking-time',
      'cumulative-layout-shift',
      'speed-index',
    ].map((id) => [id, result.lhr.audits[id]?.displayValue ?? 'n/a'])
  );

  console.log(JSON.stringify({ categories, metrics, report: outputFile.pathname }, null, 2));
} finally {
  await chrome?.kill();
  server.kill();
}

async function waitForServer(target, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(target);
      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for ${target}`);
}
