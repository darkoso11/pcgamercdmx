import { test, expect, Page } from '@playwright/test';
const admin = '/control-pcg-cdmx-2026/gallery';
async function setup(page: Page) {
  const images: any[] = [{ id: 1, src: '/assets/img/leon.png', title: 'Original', alt: 'PC original', description: 'Descripción', category: 'custom', tags: ['rgb'], author: 'Taller', date: null, published: true, sort_order: 0 }];
  let settings: any = { heading: 'Galería Cyber', subtitle: 'Creaciones', seo_title: 'Galería de prueba', seo_description: 'Creaciones personalizadas', social_image_id: 1 };
  const writes: any[] = [];
  await page.addInitScript(() => localStorage.setItem('pcgamercdmx_directus_access_token', 'gallery-test'));
  await page.route('https://cms.test.pcgamercdmx.com/**', async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const payload = ['POST', 'PATCH'].includes(method) && !url.pathname.endsWith('/files') ? route.request().postDataJSON() : null;
    let data: any = [];
    if (url.pathname === '/users/me') data = { id: 'editor' };
    if (url.pathname.startsWith('/items/pc_gallery_images')) {
      const id = Number(url.pathname.split('/').pop());
      if (method === 'GET') data = url.searchParams.has('filter[published][_eq]') ? images.filter(x => x.published) : images;
      if (method === 'POST') { data = { ...payload, id: 2 }; images.push(data); }
      if (method === 'PATCH') { data = { ...payload, id }; images.splice(images.findIndex(x => x.id === id), 1, data); }
      if (method === 'DELETE') images.splice(images.findIndex(x => x.id === id), 1);
      if (method !== 'GET') writes.push({ method, payload });
    }
    if (url.pathname === '/files') data = { id: 'uploaded-image' };
    if (url.pathname.startsWith('/items/pc_gallery_settings')) {
      if (method === 'PATCH') settings = payload;
      data = settings;
    }
    await route.fulfill({ json: { data } });
  });
  return { images, writes };
}

test('edits existing CMS images, persists tags and deletes without restoring defaults', async ({ page }) => {
  const { images } = await setup(page);
  await page.goto(admin);
  await page.getByRole('button', { name: 'Editar Original', exact: true }).click();
  await page.getByLabel('Título *', { exact: true }).fill('Ensamble editado');
  await page.getByLabel('Etiquetas', { exact: true }).fill('RGB, mod, rgb');
  await page.getByRole('button', { name: 'Guardar imagen', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Imagen guardada');
  expect(images[0].tags).toEqual(['rgb', 'mod']);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Editar Ensamble editado', exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar Ensamble editado', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Imagen eliminada');
  await page.goto('/galeria');
  await expect(page.getByText('No hay imágenes publicadas.')).toBeVisible();
  expect(images).toHaveLength(0);
});

test('uploads a draft and only shows it publicly after publication; applies SEO and filters', async ({ page }) => {
  const { images } = await setup(page);
  await page.goto(admin);
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2; canvas.height = 2;
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Subir imagen').setInputFiles({ name: 'pc.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.getByLabel('Título *', { exact: true }).fill('PC nueva');
  await page.getByLabel('Texto alternativo *', { exact: true }).fill('PC con luces azules');
  await page.getByLabel('Categoría *', { exact: true }).fill('ensambles');
  await page.getByLabel('Etiquetas', { exact: true }).fill('azul');
  await page.getByRole('button', { name: 'Guardar imagen', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Imagen guardada');
  expect(images[1].src).toContain('/assets/uploaded-image');
  expect(images[1].published).toBe(false);
  await page.goto('/galeria');
  await expect(page.getByRole('button', { name: 'Abrir PC nueva', exact: true })).toHaveCount(0);
  await page.goto(admin);
  await page.getByRole('button', { name: 'Editar PC nueva', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Publicada', exact: true }).check();
  await page.getByRole('button', { name: 'Guardar imagen', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Imagen guardada');
  await page.getByRole('button', { name: 'Página y SEO', exact: true }).click();
  await page.getByLabel('Título SEO *', { exact: true }).fill('Nuestros ensambles | PC Gamer');
  await page.getByRole('button', { name: 'Guardar página', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Página guardada');
  await page.goto('/galeria');
  await expect(page).toHaveTitle('Nuestros ensambles | PC Gamer');
  await page.getByLabel('Filtrar por etiqueta').selectOption('azul');
  await expect(page.getByRole('button', { name: 'Abrir PC nueva', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir Original', exact: true })).toHaveCount(0);
  expect(await page.locator('script#gallery-schema').evaluate(el => JSON.parse(el.textContent || '{}')['@type'])).toBe('ImageGallery');
});

test('keeps edits after a failed save and validates uploads', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto(admin);
  await page.getByLabel('Subir imagen').setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('alert')).toContainText('JPG, PNG, WebP o AVIF');
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Editar Original', exact: true }).click();
  await page.getByLabel('Título *', { exact: true }).fill('Cambio pendiente');
  await page.route('**/items/pc_gallery_images/1', route => route.fulfill({ status: 503, json: {} }));
  await page.getByRole('button', { name: 'Guardar imagen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(page.getByLabel('Título *', { exact: true })).toHaveValue('Cambio pendiente');
});

test('fits a narrow viewport and protects unsaved navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto(admin);
  await page.getByRole('button', { name: '+ Nueva imagen', exact: true }).click();
  const editorHeading = await page.getByRole('heading', { name: 'Nueva imagen', exact: true }).boundingBox();
  const adminHeader = await page.locator('app-admin-header > div').boundingBox();
  expect(editorHeading!.y).toBeGreaterThanOrEqual(adminHeader!.height);
  await page.getByLabel('Título *', { exact: true }).fill('Pendiente');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('link', { name: 'Ver galería pública' }).click();
  await expect(page).toHaveURL(new RegExp(admin));
});

test('shows a recoverable public error instead of fallback images', async ({ page }) => {
  await setup(page);
  await page.route('**/items/pc_gallery_images?*', route => route.fulfill({ status: 503, json: {} }));
  await page.goto('/galeria');
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar');
  await expect(page.getByRole('button', { name: /^Abrir / })).toHaveCount(0);
  await page.unroute('**/items/pc_gallery_images?*');
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir Original', exact: true })).toBeVisible();
});

test('brings mobile validation errors into view without saving invalid tags', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { writes } = await setup(page);
  await page.goto(admin);
  await page.getByRole('button', { name: 'Editar Original', exact: true }).click();
  await page.getByLabel('Etiquetas', { exact: true }).fill(Array.from({ length: 21 }, (_, i) => 'tag' + i).join(','));
  await page.getByRole('button', { name: 'Guardar imagen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('hasta 20 etiquetas');
  await expect(page.getByRole('alert')).toBeInViewport();
  expect(writes).toHaveLength(0);
});
