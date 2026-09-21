import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.SEPTEMBER_BASE_URL || 'http://127.0.0.1:4266';
const paths = ['pc-para-edicion-de-audio-y-video', 'workstation', 'streaming-pc', 'componentes-para-pc-gamer'];
await mkdir('test-results/september', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      const response = await page.goto(`${base}/${path}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      // Verify that source HTML already contains the page content and metadata.
      const html = await response.text();
      assert.match(html, /commercial-faq-schema/);
      assert.match(html, /data-product-card/);
      assert.equal(await page.locator('app-commercial-page h1').count(), 1);
      assert.equal(await page.locator('app-commercial-page details').count(), 4);
      assert.equal(await page.locator('[data-product-card]').count(), path.startsWith('componentes') ? 14 : 6);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://pcgamercdmx.com/${path}`);
      assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
      assert.equal(await page.locator('app-commercial-page a[href="/ensambles/hyperion"], app-commercial-page a[href="/ensambles/workstation"]').count(), 0);
      for (const img of await page.locator('app-commercial-page img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
        assert.ok(await img.getAttribute('alt'));
        assert.ok(await img.getAttribute('title'));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path}: horizontal overflow at ${width}`);
      await page.locator('app-commercial-page summary').first().click();
      assert.ok(await page.locator('app-commercial-page details').first().getAttribute('open') !== null);
      await page.locator('app-commercial-page summary').first().click();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `test-results/september/${path}-${width}.png`, fullPage: true });
      console.log(`${width}px ${path}: HTML, SEO, cards, images, FAQ, overflow OK`);
    }
  }
  // Exercise client navigation through the actual related-page links.
  await page.locator('app-commercial-page .related a[href="/streaming-pc"]').click();
  await expect(page.locator('app-commercial-page h1')).toHaveText('PC para streaming de alto rendimiento');
  assert.equal(await page.locator('#commercial-faq-schema').count(), 1);
  assert.match(await page.locator('#commercial-faq-schema').textContent(), /streaming PC/);
  await page.goto(`${base}/productos/perifericos`, { waitUntil: 'domcontentloaded' });
  assert.match(page.url(), /productos\/perifericos/);
  await expect(page.locator('nav[aria-label="Computadoras y componentes por uso"] a')).toHaveCount(4);
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
