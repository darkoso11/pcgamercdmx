import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const publicRoutes = [
  '/',
  '/ensambles',
  '/contacto',
  '/colaboradores',
  '/productos',
  '/productos/perifericos',
  '/productos/hardware-accesorios',
  '/nosotros',
  '/galeria',
  '/sorteos',
  '/servicios',
  '/cotiza-tu-pc',
  '/politica-privacidad',
  '/terminos',
  '/blog',
];

async function expectNoHorizontalOverflow(page: Page, location: string): Promise<void> {
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    overflowing: Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 ||
          rect.right > document.documentElement.clientWidth + 1 ||
          element.scrollWidth > element.clientWidth + 1;
      })
      .slice(0, 5)
      .map(element => ({
        tag: element.tagName.toLowerCase(),
        className: element.className,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
  }));

  expect(
    widths.content,
    `horizontal overflow on ${location}: ${JSON.stringify(widths.overflowing)}`
  ).toBeLessThanOrEqual(widths.viewport + 1);
}

for (const route of publicRoutes) {
  test(`${route} renders without runtime or layout errors`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

    expect(response?.ok(), `HTTP response for ${route}`).toBe(true);
    await expect(page.locator('app-root')).toBeVisible();
    expect((await page.locator('body').innerText()).trim().length).toBeGreaterThan(20);
    expect(await page.title()).not.toBe('');
    expect(
      await page.locator('img:not([alt])').count(),
      `images without alt text on ${route}`
    ).toBe(0);

    await expectNoHorizontalOverflow(page, route);
    expect(runtimeErrors).toEqual([]);
  });
}

test('mobile navigation opens, routes and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const menu = page.locator('#mobile-navigation');
  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Contacto' }).click();

  await expect(page).toHaveURL(/\/contacto$/);
  await expect(menu).toBeHidden();
});

test('mobile navigation icons use portable SVG attributes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const menuIcon = page.locator('button[aria-controls="mobile-navigation"] path');
  await expect(menuIcon).toHaveAttribute('stroke-linecap', 'round');
  await expect(menuIcon).toHaveAttribute('stroke-linejoin', 'round');
  await expect(menuIcon).toHaveAttribute('stroke-width', '2');
});

test('public site degrades safely when Web Storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    };
    Storage.prototype.getItem = blocked;
    Storage.prototype.setItem = blocked;
    Storage.prototype.removeItem = blocked;
  });

  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('app-root')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('public site remains usable when third-party assets fail', async ({ page }) => {
  await page.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)\//, route =>
    route.abort()
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Productos', exact: true }).first()).toBeVisible();
});

test('key pages remain usable in a mobile landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });

  for (const route of ['/', '/productos', '/nosotros']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('app-root')).toBeVisible();
    await expectNoHorizontalOverflow(page, `${route} in landscape`);
  }
});
