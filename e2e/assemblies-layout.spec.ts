import { expect, test } from '@playwright/test';

test('loaded assembly cards fit the viewport with long specifications', async ({ page }) => {
  await page.route('**/items/pc_offers?*', route => route.fulfill({ json: { data: [] } }));
  await page.route('**/items/pc_products?*', route => route.fulfill({ json: { data: [{
    id: 999999, title: 'Ensamble de prueba con especificaciones extensas',
    slug: 'ensamble-prueba', category: 'assembled', price: 62000, stock: 1, published: true,
    image: '/assets/img/leon.png', description: 'Equipo de prueba para comprobar el ancho de las tarjetas.',
    specifications: {
      processor: 'AMD RYZEN 7 9700X', graphicsCard: 'ASUS DUAL GEFORCE RTX 5070 12 GB',
      ram: '64 GB DDR5', storage: 'UnidadNVMeConIdentificadorDeModeloExtensoSinEspacios1234567890',
    },
  }] } }));
  await page.route('**/www.googletagmanager.com/gtag/js?*', route => route.fulfill({ body: '', contentType: 'application/javascript' }));

  for (const width of [320, 390, 768, 890, 1000, 1280, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ensambles');
    const card = page.locator('app-packages article').filter({ hasText: 'Ensamble de prueba' });
    await expect(card).toHaveCount(1);
    await expect(page.locator('app-assemblies .pc-hero-bg img')).toHaveCount(0);
    await expect(page.locator('.assembly-filters img')).toHaveCount(0);
    await page.getByRole('combobox', { name: 'Procesador', exact: true }).selectOption('amd');
    await page.getByRole('combobox', { name: 'Tarjeta gráfica', exact: true }).selectOption({ label: 'NVIDIA' });
    await expect(card).toHaveCount(1);
    await expect(page.getByRole('combobox', { name: 'Procesador', exact: true })).toHaveValue('amd');
    await page.getByRole('combobox', { name: 'Precio en MXN', exact: true }).selectOption('under15');
    await expect(page.getByRole('button', { name: 'Quitar filtro de procesador AMD', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Quitar filtro de procesador AMD', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Procesador', exact: true })).toHaveValue('all');
    await expect(page.getByRole('button', { name: 'Quitar filtro NVIDIA', exact: true })).toBeVisible();
    await expect(card).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'No encontramos ensambles con esos filtros' })).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).first().click();
    await expect(card).toHaveCount(1);
    await expect(page.getByRole('combobox', { name: 'Procesador', exact: true })).toHaveValue('all');
    if (width < 1024) {
      const rail = page.getByRole('region', { name: 'Filtros de ensambles' });
      await rail.scrollIntoViewIfNeeded();
      await rail.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      await expect(page.getByRole('combobox', { name: 'Tarjeta gráfica', exact: true })).toBeInViewport();
      await rail.evaluate(element => { element.scrollLeft = 0; });
    }

    await expect(card.getByRole('link', { name: 'Ver detalle', exact: true })).toBeVisible();
    await expect(card).not.toContainText('Equipo de prueba para comprobar el ancho de las tarjetas.');
    const layout = await card.evaluate(element => {
      const image = element.querySelector('.assembly-image')!.getBoundingClientRect();
      const title = element.querySelector('h3')!.getBoundingClientRect();
      return { imageBottom: image.bottom, titleTop: title.top,
        columns: getComputedStyle(element.parentElement!).gridTemplateColumns.split(' ').length };
    });
    expect(layout.columns).toBe(width >= 890 ? 4 : 2);
    expect(layout.imageBottom).toBeLessThanOrEqual(layout.titleTop);

    const bounds = await card.evaluate(element => ({
      right: element.getBoundingClientRect().right,
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(bounds.right).toBeLessThanOrEqual(width);
    expect(bounds.content).toBeLessThanOrEqual(bounds.viewport + 1);
  }
});
