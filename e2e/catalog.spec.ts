import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CATALOG_CATEGORIES, catalogCategoryPath } from '../src/app/features/products/catalog-categories';

test('catalog navigation, URL state, history and detail preserve the document', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/productos');
  await expect(page.locator('[data-catalog] article').first()).toBeVisible();
  await expect(page).toHaveURL(/\/productos\/?$/);
  await expect(page.getByRole('heading', { name: 'Todos los productos', exact: true })).toBeVisible();
  await expect(page.locator('app-catalog button.search-button')).not.toHaveAttribute('jsaction', /.+/);
  await expect(page.getByText('Cargando productos…', { exact: true })).toHaveCount(0);
  await page.evaluate(() => (window as any).__catalogDocument = 'same');
  await page.getByRole('navigation', { name: 'Categorías de productos', exact: true }).getByRole('link', { name: 'Teclados' }).click();
  await expect(page).toHaveURL(/\/productos\/perifericos\/keyboard$/);
  await expect(page.locator('[aria-current="page"]')).toContainText('Teclados');
  const count = await page.locator('[data-catalog] article').count();
  expect(count).toBeGreaterThan(0);
  await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('zzznothingmatches');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No hay productos con esos filtros' })).toBeVisible();
  await expect(page).toHaveURL(/q=zzznothingmatches/);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('zzznothingmatches');
  await expect(page.getByRole('heading', { name: 'No hay productos con esos filtros' })).toBeVisible();
  await page.evaluate(() => (window as any).__catalogDocument = 'same');
  await page.getByRole('button', { name: 'Limpiar filtros y búsqueda' }).click();
  await expect(page.locator('[data-catalog] article')).toHaveCount(count);
  await page.goBack();
  await expect(page.getByRole('searchbox')).toHaveValue('zzznothingmatches');
  await page.goForward();
  await expect(page.locator('[data-catalog] article')).toHaveCount(count);
  expect(await page.evaluate(() => (window as any).__catalogDocument)).toBe('same');
  const detail = page.locator('[data-catalog] article a').first();
  const href = await detail.getAttribute('href');
  await detail.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator('[data-catalog]')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('filters combine, preserve the category and support keyboard closing', async ({ page }) => {
  await page.goto('/productos/perifericos/keyboard');
  await expect(page.locator('[data-catalog] article').first()).toBeVisible();
  const toggle = page.getByRole('button', { name: 'Filtros', exact: true });
  // Wait for Angular to finish replaying early events before asserting focus.
  await expect(toggle).not.toHaveAttribute('jsaction', /.+/);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#catalog-filters')).toBeVisible();
  await page.getByLabel('Precio mínimo (MXN)').fill('9999999');
  await page.getByLabel('Precio mínimo (MXN)').press('Tab');
  await expect(page.getByRole('heading', { name: 'No hay productos con esos filtros' })).toBeVisible();
  await page.getByLabel('Precio máximo (MXN)').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#catalog-filters')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Filtros (1)' })).toBeFocused();
  await page.getByRole('button', { name: 'Limpiar filtros y búsqueda' }).click();
  await expect(page).toHaveURL(/\/productos\/perifericos\/keyboard\/?$/);
  await expect(page.locator('[data-catalog] article').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('[aria-current="page"]')).toContainText('Teclados');
});

for (const width of [360, 768, 1440]) {
  test(`catalog is accessible without page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/productos/hardware-accesorios/ram');
    await expect(page.locator('[data-catalog] article').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const active = page.locator('[aria-current="page"]');
    await expect(active).toBeInViewport({ ratio: 1 });
    const box = await active.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    const audit = await new AxeBuilder({ page }).include('[data-catalog]').analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({ path: `test-results/catalog-${width}.png`, fullPage: true });
  });
}

test('every catalog route has initial HTML and its own metadata', async ({ request }) => {
  const paths = ['productos', 'productos/perifericos', 'productos/hardware-accesorios', ...CATALOG_CATEGORIES.map(catalogCategoryPath)];
  for (const path of paths) {
    const response = await request.get(`/${path}/`);
    expect(response.ok(), path).toBe(true);
    const html = await response.text();
    expect(html, path).toContain('data-catalog');
    expect(html, path).toContain(`href="https://pcgamercdmx.com/${path}"`);
    expect(html, path).toMatch(/<meta name="description" content="[^"]+"/);
    if (path === 'productos' || path.endsWith('/keyboard') || path.endsWith('/ram')) expect(html, path).toContain('<article');
    const category = CATALOG_CATEGORIES.find(item => catalogCategoryPath(item) === path);
    if (category) expect(html, path).toContain(`<title>${category.label} | PC Gamer CDMX</title>`);
  }
});

test('CMS aliases retain grouped products and canonical metadata', async ({ page, request }) => {
  const response = await request.get('/productos/perifericos/perifericos-teclados/');
  const html = await response.text();
  expect(html).toContain('href="https://pcgamercdmx.com/productos/perifericos/keyboard"');
  expect(html).toContain('<article');
  await page.goto('/productos/perifericos/perifericos-teclados');
  await expect(page.locator('[aria-current="page"]')).toContainText('Teclados');
  await expect(page.locator('.category-chips').getByRole('link', { name: 'Teclados', exact: true })).toHaveCount(1);
  await expect(page.locator('[data-catalog] article').first()).toBeVisible();
  const cmsResponse = await request.get('/productos/perifericos/perifericos-capturadora/');
  expect(await cmsResponse.text()).toContain('<title>Capturadora | PC Gamer CDMX</title>');
});

test('brand and product type combine and survive reload and history', async ({ page }) => {
  await page.goto('/productos?brand=gigabyte&type=motherboard');
  const cards = page.locator('[data-catalog] article');
  await expect(cards.first()).toBeVisible();
  await expect(page.getByLabel('Tipo de producto', { exact: true })).toHaveValue('motherboard');
  await expect(page.locator('app-catalog button.search-button')).not.toHaveAttribute('jsaction', /.+/);
  const count = await cards.count();
  const title = await cards.first().locator('h3').innerText();
  const words = title.trim().split(/\s+/);
  await page.getByRole('searchbox').fill(`${words.at(-1)} ${words[0]}`);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(cards.first()).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Tipo de producto', { exact: true })).toHaveValue('motherboard');
  await expect(cards.first()).toBeVisible();
  await page.getByLabel('Tipo de producto', { exact: true }).selectOption('keyboard');
  await expect(page).toHaveURL(/type=keyboard/);
  await page.goBack();
  await expect(page.getByLabel('Tipo de producto', { exact: true })).toHaveValue('motherboard');
  expect(await cards.count()).toBeLessThanOrEqual(count);
});

test('brand category aliases point to the stable generic canonical', async ({ request }) => {
  for (const [brand, alias] of [
    ['amd', 'componentes-amd-tarjeta-grafica'], ['asus', 'componentes-asus-tarjeta-madre'],
    ['msi', 'componentes-msi-tarjeta-madre'], ['gigabyte', 'componentes-gigabyte-tarjeta-madre'],
  ]) {
    const response = await request.get(`/productos/hardware-accesorios/${alias}/`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(`href="https://pcgamercdmx.com/productos/hardware-accesorios/componentes-${brand}"`);
  }
});
