import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { setupAssemblyCatalog } from './support/assembly-catalog-fixtures';

async function scrollToFooter(page: Page) {
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
}

async function expectTop(page: Page) {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test.beforeEach(async ({ page }) => {
  await setupAssemblyCatalog(page);
  await page.route('**/items/pc_products?**', route => route.fulfill({ json: { data: [
    { id: 'assembly', slug: 'cpsula', title: 'CPSULA', category: 'assembled', subcategory: 'gaming', published: true, stock: 5, price: 25000 },
    { id: 'keyboard', slug: 'teclado-scroll', title: 'Teclado scroll', category: 'peripheral', subcategory: 'keyboard', published: true, stock: 5, price: 1000 },
  ] } }));
  await page.route('**/*', route => route.request().resourceType() === 'document'
    ? route.fulfill({ path: path.resolve('dist/pcgamercdmx/browser/index.csr.html'), contentType: 'text/html' })
    : route.fallback());
  await page.route('**/items/pc_blog_posts?**', async route => {
    // Exercise content arriving after navigation, as it does with the CMS.
    await new Promise(resolve => setTimeout(resolve, 200));
    await route.fulfill({ json: { data: [{
      id: 'scroll-article', slug: 'scroll-article', title: 'Scroll regression article',
      published: true, published_at: '2026-01-01T00:00:00Z',
      sections: [{ title: 'Contenido', text: '<p>Contenido de prueba.</p>', order: 0 }],
    }] } });
  });
});

for (const path of ['/productos', '/cotiza-tu-pc', '/contacto', '/blog', '/colaboradores', '/politica-privacidad', '/terminos']) {
  test(`footer navigation to ${path} starts at the top`, async ({ page }) => {
    await page.goto('/ensambles/cpsula');
    await expect(page.locator('h1')).toContainText('CPSULA');
    await scrollToFooter(page);
    await page.locator(`footer a[href="${path}"]`).first().click();
    await expect(page).toHaveURL(path);
    await expectTop(page);
  });
}

for (const [listing, detail] of [
  ['/ensambles', '/ensambles/cpsula'],
  ['/productos', '/productos/teclado-scroll'],
  ['/blog', '/blog/scroll-article'],
]) {
  test(`${detail} and browser history start at the top`, async ({ page }) => {
    await page.goto(listing);
    const link = page.locator(`a[href="${detail}"]`).first();
    await expect(link).toBeAttached();
    await scrollToFooter(page);
    // Activate the real RouterLink without Playwright scrolling it into view first.
    await link.evaluate(element => (element as HTMLElement).click());
    await expect(page).toHaveURL(detail);
    await expect(page.locator('h1')).toContainText(listing === '/blog' ? 'Scroll regression article' : listing === '/productos' ? 'Teclado scroll' : 'CPSULA');
    await expectTop(page);
    await scrollToFooter(page);
    await page.goBack();
    await expect(page).toHaveURL(listing);
    await expectTop(page);
    await scrollToFooter(page);
    await page.goForward();
    await expect(page).toHaveURL(detail);
    await expectTop(page);
    await page.reload();
    await expectTop(page);
  });
}
