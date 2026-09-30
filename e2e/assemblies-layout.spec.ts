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

  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ensambles');
    const card = page.locator('app-packages article').filter({ hasText: 'Ensamble de prueba' });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('link', { name: 'Ver detalle', exact: true })).toBeVisible();
    const bounds = await card.evaluate(element => ({
      right: element.getBoundingClientRect().right,
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(bounds.right).toBeLessThanOrEqual(width);
    expect(bounds.content).toBeLessThanOrEqual(bounds.viewport + 1);
  }
});
