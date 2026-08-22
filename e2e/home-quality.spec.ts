import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home defers every non-critical image', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto('/', { waitUntil: 'networkidle' });
  if (await page.locator('[data-home-deferred-placeholder]').count()) {
    await page.locator('[data-home-deferred-placeholder]').scrollIntoViewIfNeeded();
  }
  await expect(page.locator('app-products-slider')).toBeVisible();

  const images = page.locator(
    'app-home img:not(.pc-ensamble-img):not([src*="leon-"]):not([src$="/leon.png"]):not([src$="assets/img/leon.png"])'
  );
  expect(await images.count()).toBeGreaterThan(10);

  for (let index = 0; index < await images.count(); index += 1) {
    await expect(images.nth(index), `home image ${index}`).toHaveAttribute('loading', 'lazy');
    await expect(images.nth(index), `home image ${index}`).toHaveAttribute('decoding', 'async');
  }
});

test('initial HTML preloads the LCP image without blocking on third-party styles', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();
  const scriptEnabledHtml = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');

  expect(html).toContain(
    '<link rel="preload" as="image" href="assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01-480.webp"'
  );
  expect(html).toContain('imagesrcset="assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01-480.webp 480w');
  expect(html).toContain('Sitio recien publicado');
  expect(html).not.toContain('<app-products-slider');
  expect(scriptEnabledHtml).not.toMatch(/<link\s+rel="stylesheet"\s+href="https:\/\//);
  expect(scriptEnabledHtml).not.toMatch(/<link rel="stylesheet" href="styles-[^"]+\.css">/);
  expect(html).toMatch(/<link rel="stylesheet" href="styles-[^"]+\.css" media="print"/);
  expect(html).not.toContain('fonts.googleapis.com/icon?family=Material+Icons');
});

test('home loads the Orbitron display font from a local WOFF2 asset', async ({ page, request }) => {
  const fontResponse = await request.get('/assets/fonts/orbitron-latin.woff2');

  expect(fontResponse.ok()).toBe(true);
  expect(fontResponse.headers()['content-type']).toMatch(/font\/woff2|application\/font-woff2/);

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('app-home h1')).toHaveCSS('font-family', /Orbitron/);
  const fontRequests = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.includes('font'))
  );

  expect(fontRequests).toContainEqual(expect.stringContaining('/assets/fonts/orbitron-latin.woff2'));
  expect(fontRequests.some((url) => url.includes('fonts.gstatic.com'))).toBe(false);
});

test('keyboard arrows control only the focused carousel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  if (await page.locator('[data-home-deferred-placeholder]').count()) {
    await page.locator('[data-home-deferred-placeholder]').scrollIntoViewIfNeeded();
  }
  await expect(page.locator('app-products-slider')).toBeVisible();

  const hero = page.getByRole('region', { name: 'Promociones destacadas' });
  const banners = page.getByRole('region', { name: 'Banners promocionales' });
  const heroImage = hero.locator('img');
  const bannerTrack = banners.locator('.will-change-transform');

  await hero.focus();
  const firstHeroImage = await heroImage.getAttribute('src');
  const initialBannerTransform = await bannerTrack.getAttribute('style');
  await page.keyboard.press('ArrowRight');

  expect(await heroImage.getAttribute('src')).not.toBe(firstHeroImage);
  expect(await bannerTrack.getAttribute('style')).toBe(initialBannerTransform);

  const selectedHeroImage = await heroImage.getAttribute('src');
  await banners.focus();
  await page.keyboard.press('ArrowRight');

  expect(await bannerTrack.getAttribute('style')).not.toBe(initialBannerTransform);
  expect(await heroImage.getAttribute('src')).toBe(selectedHeroImage);
});

test('home has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  if (await page.locator('[data-home-deferred-placeholder]').count()) {
    await page.locator('[data-home-deferred-placeholder]').scrollIntoViewIfNeeded();
  }
  await expect(page.locator('app-products-slider')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test('crawler files are valid and reference the production origin', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  const sitemap = await (await request.get('/sitemap.xml')).text();

  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Sitemap: https://pcgamercdmx.com/sitemap.xml');
  expect(robots).not.toContain('<!doctype html>');
  expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(sitemap).toContain('<loc>https://pcgamercdmx.com/</loc>');
});

test('catalog data does not compete with the initial hero render', async ({ page }) => {
  const catalogRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/items/pc_products')) catalogRequests.push(request.url());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1_000);

  expect(catalogRequests).toEqual([]);
});
