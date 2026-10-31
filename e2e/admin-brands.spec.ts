import { expect, test, Page } from '@playwright/test';

const admin = '/control-pcg-cdmx-2026';

async function setupBrands(page: Page) {
  const brands = [{ id: '1', name: 'ASUS', key: 'asus', logo: 'assets/img/marcas/asuspng.png', aliases: [] as string[] }];
  const writes: { path: string; payload: any }[] = [];
  await page.addInitScript(() => localStorage.setItem('pcgamercdmx_directus_access_token', 'test-brand-session'));
  await page.route('https://cms.test.pcgamercdmx.com/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    let data: unknown = [];
    if (path === '/users/me') data = { id: 'test-editor' };
    if (path === '/items/pc_brands' && method === 'GET') data = brands;
    if (path.startsWith('/items/pc_brands') && ['POST', 'PATCH'].includes(method)) {
      const payload = route.request().postDataJSON();
      const brand = { ...payload, id: method === 'POST' ? String(brands.length + 1) : path.split('/').pop() };
      const index = brands.findIndex(item => item.id === brand.id);
      if (index < 0) brands.push(brand); else brands[index] = brand;
      writes.push({ path, payload });
      data = brand;
    }
    if (path === '/items/pc_categories') data = [{ id: 2, name: 'Componentes', slug: 'componentes', published: true }];
    if (path === '/items/pc_subcategories') data = [
      { id: 5, name: 'Procesadores', slug: 'componentes-cpu', category_id: 2, published: true },
      { id: 25, name: 'ASUS', slug: 'componentes-asus', category_id: 2, published: true },
      { id: 26, name: 'Marca Nueva', slug: 'componentes-marca-nueva', category_id: 2, published: true },
    ];
    if (path === '/items/pc_products/product-1') data = {
      id: 'product-1', title: 'Producto de prueba', slug: 'producto-prueba', category: 'component', subcategory: '5',
      description: 'Descripción del producto', price: 100, image: 'assets/img/marcas/asuspng.png',
      specifications: { admin: { categoryId: '2', subcategoryId: '5', brand: 'ASUS' } },
    };
    if (path === '/items/pc_products/assembly-1') data = {
      id: 'assembly-1', title: 'Ensamble de prueba', slug: 'ensamble-prueba', category: 'assembled', price: 200,
      image: 'assets/img/marcas/asuspng.png', brand_logos: [{ alt: 'ASUS', src: 'assets/img/marcas/asuspng.png' }],
    };
    if (path.startsWith('/items/pc_products/') && method === 'PATCH') {
      const payload = route.request().postDataJSON();
      writes.push({ path, payload });
      data = { ...payload, id: path.split('/').pop() };
    }
    await route.fulfill({ json: { data }, headers: { 'access-control-allow-origin': '*' } });
  });
  return { brands, writes };
}

test('creates and edits shared brands without leaking manufacturers into taxonomy', async ({ page }) => {
  const { brands, writes } = await setupBrands(page);
  await page.goto(`${admin}/brands`);
  await page.getByLabel('Nombre *', { exact: true }).fill('Marca Nueva');
  await page.getByRole('button', { name: 'Guardar marca', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Marca creada');
  expect(brands).toHaveLength(2);

  await page.getByLabel('Nombre *', { exact: true }).fill('MÁRCA   NUEVA');
  await page.getByRole('button', { name: 'Guardar marca', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('ya existe');
  expect(writes).toHaveLength(1);

  await page.getByRole('button', { name: 'Editar ASUS', exact: true }).click();
  await page.getByLabel('Nombre *', { exact: true }).fill('ASUS Actualizada');
  await page.getByRole('button', { name: 'Guardar marca', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Marca actualizada');
  expect(brands[0].id).toBe('1');
  expect(brands[0].aliases).toContain('ASUS');

  await page.goto(`${admin}/products/product-1/edit`);
  await expect(page.getByLabel('Marca', { exact: true })).toHaveValue('ASUS Actualizada');
  await expect(page.getByLabel('Marca', { exact: true }).locator('option')).toContainText(['Selecciona', 'ASUS Actualizada', 'Marca Nueva']);
  const subcategories = page.locator('select[formcontrolname="subcategoryId"]');
  await expect(subcategories.locator('option')).toHaveText(['-- Selecciona una subcategoría --', 'Procesadores']);
  await page.getByLabel('Marca', { exact: true }).selectOption('Marca Nueva');
  await page.getByRole('button', { name: /Guardar Privado/ }).first().click();
  await expect.poll(() => writes.some(write => write.path.endsWith('product-1'))).toBe(true);
  expect(writes.find(write => write.path.endsWith('product-1'))!.payload.specifications.admin.brandId).toBe('2');

  await page.goto(`${admin}/assemblies/assembly-1/edit`);
  await expect(page.getByRole('checkbox', { name: 'Seleccionar marca ASUS Actualizada', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Seleccionar marca Marca Nueva', exact: true }).check();
  await page.getByRole('button', { name: /Guardar como Borrador/ }).first().click();
  await expect.poll(() => writes.some(write => write.path.endsWith('assembly-1'))).toBe(true);
  expect(writes.find(write => write.path.endsWith('assembly-1'))!.payload.brand_logos).toContainEqual({ brandId: '2', src: '', alt: 'Marca Nueva' });
});

test('shows failed saves, preserves the draft and retries without reporting success', async ({ page }) => {
  await setupBrands(page);
  await page.route('**/items/pc_brands', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    await route.fulfill({ status: 403, json: { errors: [{ message: 'Forbidden' }] } });
  });
  await page.goto(`${admin}/brands`);
  await page.getByLabel('Nombre *', { exact: true }).fill('Marca Pendiente');
  await page.getByRole('button', { name: 'Guardar marca', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('Marca Pendiente');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guardar marca', exact: true })).toBeEnabled();
});

test('brand manager fits a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupBrands(page);
  await page.goto(`${admin}/brands`);
  await expect(page.getByRole('button', { name: 'Editar ASUS', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/brands-mobile.png', fullPage: true });
});
