import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('high-end landing exposes editorial cards, advisor links and accessible FAQ', async ({ page }) => {
  await page.goto('/pc-gamer-gama-alta-cdmx', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { level: 1, name: /PC Gamer Gama Alta en CDMX/i })).toBeVisible();
  await expect(page.locator('[data-assembly-card]')).toHaveCount(6);
  await expect(page.getByText('El catálogo activo no está disponible por el momento.')).toHaveCount(0);
  await expect(page.locator('[data-editorial-card]')).toHaveCount(2);
  await expect(page.locator('[data-editorial-card] a[href="/contacto"]')).toHaveCount(2);
  await expect(page.locator('[data-all-assemblies-cta]')).toHaveAttribute('href', '/ensambles');
  await expect(page.locator('[data-build-pc-cta]')).toHaveAttribute('href', '/contacto');
  await expect(page.locator('[data-contact-cta]')).toHaveAttribute('href', '/contacto');
  await expect(page.locator('.assembly-card__scanline')).toHaveCount(0);
  await expect(page.locator('details')).toHaveCount(4);

  const sharkCard = page.locator('[data-assembly-card]').filter({ hasText: 'SHARK' });
  const robotCard = page.locator('[data-assembly-card]').filter({ hasText: 'ROBOT' });
  const sharkDescription = sharkCard.locator('[data-assembly-description]');
  const descriptionToggle = sharkCard.locator('[data-description-toggle]');
  await expect(robotCard.locator('[data-description-toggle]')).toHaveCount(0);
  const cardHeights = await page.locator('[data-assembly-card]').evaluateAll((cards) =>
    cards.map((card) => Math.round(card.getBoundingClientRect().height))
  );
  expect(new Set(cardHeights).size).toBe(1);
  await expect(descriptionToggle).toHaveText('Ver más');
  await expect(descriptionToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sharkDescription).toHaveCSS('-webkit-line-clamp', '4');
  await descriptionToggle.click();
  await expect(descriptionToggle).toHaveText('Ver menos');
  await expect(descriptionToggle).toHaveAttribute('aria-expanded', 'true');

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', 'https://pcgamercdmx.com/pc-gamer-gama-alta-cdmx');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /PC Gamer gama alta en CDMX/i);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('high-end structured products never invent Hyperion or Workstation catalog entries', async ({ page }) => {
  await page.goto('/pc-gamer-gama-alta-cdmx', { waitUntil: 'networkidle' });

  const jsonLd = await page.locator('script[data-seo-schema="page"]').allTextContents();
  const itemList = jsonLd.find((value) => value.includes('ItemList')) ?? '';
  expect(itemList).not.toContain('HYPERION');
  expect(itemList).not.toContain('WORKSTATION');
});

test('SPA navigation keeps landing schemas and clears them when leaving', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Explorar PC Gamer gama alta' }).click();
  await expect(page).toHaveURL(/\/pc-gamer-gama-alta-cdmx$/);
  await expect(page.locator('script[data-seo-schema="page"]')).toHaveCount(3);

  await page.locator('a[href="/"]:visible').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('script[data-seo-schema="page"]')).toHaveCount(0);
});

test('landing is responsive, loads images and honors reduced motion', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800, columns: 2 },
    { width: 390, height: 844, columns: 1 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/pc-gamer-gama-alta-cdmx', { waitUntil: 'networkidle' });

    const images = page.locator('.high-end-page img');
    for (let index = 0; index < await images.count(); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
      expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    }

    const layout = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>('.assembly-grid');
      const columns = grid
        ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
        : 0;
      return {
        columns,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    expect(layout.columns).toBe(viewport.columns);
    expect(layout.hasHorizontalOverflow).toBe(false);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.signal-glitch--hero')).toHaveCSS('animation-name', 'none');
});
