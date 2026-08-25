import { expect, test } from '@playwright/test';

const assemblyPath = '/ensambles/cpsula';

test('assembly detail keeps power certification in one accessible place', async ({ page }) => {
  await page.goto(assemblyPath, { waitUntil: 'domcontentloaded' });

  const sourceCard = page.locator('.spec-item', {
    has: page.locator('.spec-label', { hasText: 'Fuente' }),
  });
  await expect(sourceCard).toBeVisible();
  await expect(sourceCard).toHaveCount(1);
  await expect(page.locator('.info-box')).toHaveCount(0);
  await expect(page.getByText('Potencia y certificación', { exact: true })).toHaveCount(0);

  const certification = sourceCard.locator('.spec-certification-image');
  await expect(certification).toBeVisible();
  await expect(certification).toHaveAttribute('alt', '80+ Gold · 750W');
  await expect(certification).toHaveAttribute('loading', 'lazy');
  await expect(certification).toHaveAttribute('decoding', 'async');
  await expect(certification).toHaveAttribute('width', '42');
  await expect(certification).toHaveAttribute('height', '56');
});

test('detail navigation and footer provide mobile-sized touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(assemblyPath, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.spec-label', { hasText: 'Fuente' })).toBeVisible();

  const undersizedTargets = await page.locator('.breadcrumb a, footer a').evaluateAll(elements =>
    elements
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent?.trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
  );

  expect(undersizedTargets).toEqual([]);
});
