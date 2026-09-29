import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.AUGUST_BASE_URL || 'http://127.0.0.1:4266';
const paths = ['computadora-para-diseno-grafico', 'pc-gamer-gama-media', 'pc-gamer-gama-alta'];
await mkdir('test-results/august', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Inspect initialization without sending local test traffic to the real property.
  await page.route('**/www.googletagmanager.com/gtag/js?*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      const response = await page.goto(`${base}/${path}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const html = await response.text();
      const head = html.split('</head>')[0];
      assert.match(head, /google-tag-loader/);
      assert.match(head, /gtag\('config', 'G-1RE1CQG7LC'\)/);
      assert.ok(html.includes(path === 'pc-gamer-gama-alta' ? 'CollectionPage' : 'FAQPage'), 'prerendered structured data');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://pcgamercdmx.com/${path}`);
      await expect(page.locator('head script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
      const configs = await page.evaluate(() => window.dataLayer.filter(entry => entry[0] === 'config' && entry[1] === 'G-1RE1CQG7LC').length);
      assert.equal(configs, 1, 'one initialization after hydration');
      if (path !== 'pc-gamer-gama-alta') {
        await expect(page.locator('[data-product-card]')).toHaveCount(6);
        await expect(page.locator('.assembly-specs')).toHaveCount(6);
      }
      const root = path === 'pc-gamer-gama-alta' ? '.high-end-page' : 'app-commercial-page';
      for (const img of await page.locator(`${root} img`).all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.locator('summary').first().click();
      await expect(page.locator('details').first()).toHaveAttribute('open', '');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `test-results/august/${path}-${width}.png`, fullPage: true });
      console.log(`${width}px ${path}: prerender, head, GA initialization, images and layout OK`);
    }
  }
  const redirect = await page.request.get(`${base}/pc-gamer-gama-alta-cdmx?utm_source=august`, { maxRedirects: 0 });
  assert.equal(redirect.status(), 301);
  assert.equal(redirect.headers().location, '/pc-gamer-gama-alta?utm_source=august');
  await page.goto(`${base}/pc-gamer-gama-alta-cdmx?utm_source=august`);
  await expect(page).toHaveURL(/\/pc-gamer-gama-alta\/?\?utm_source=august$/);
  await page.goto(`${base}/productos`, { waitUntil: 'networkidle' });
  for (const path of paths) {
    const nav = page.locator('nav[aria-label="Computadoras y componentes por uso"]');
    await nav.locator(`a[href="/${path}"]`).click();
    await expect(page).toHaveURL(new RegExp('/' + path + '$'));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('head #google-tag-loader')).toHaveCount(1);
    await page.goBack();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
