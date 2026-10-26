import { expect, test } from '@playwright/test';

test('recovers an incomplete local draft after reload without writing to the CMS', async ({ page }) => {
  let writes = 0;
  await setupMockEditor(page, () => writes++);
  await page.goto('/control-pcg-cdmx-2026/blog/1/edit');
  const title = page.getByPlaceholder('Ej: Mi primer artículo');
  await expect(title).toHaveValue('Versión actual');
  await title.fill('Edición local pendiente');
  await expect(page.getByText('Copia local:', { exact: false })).toBeVisible();
  await expect(page.getByText('Copia local pendiente…', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Recuperar copia local', exact: true })).toBeVisible();
  await expect(title).toHaveValue('Versión actual');
  await page.getByRole('button', { name: 'Recuperar copia local', exact: true }).click();
  await expect(title).toHaveValue('Edición local pendiente');
  expect(writes).toBe(0);
});

test('opens history locally and keeps the current URL', async ({ page }) => {
  let writes = 0;
  await setupMockEditor(page, () => writes++);
  await page.goto('/control-pcg-cdmx-2026/blog/1/edit');
  const title = page.getByPlaceholder('Ej: Mi primer artículo');
  await expect(title).toHaveValue('Versión actual');
  await page.getByRole('button', { name: 'Ver historial de versiones', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir versión 7', exact: true }).click();
  await expect(title).toHaveValue('Versión anterior');
  await expect(page.getByPlaceholder('mi-primer-articulo')).toHaveValue('version-actual');
  await expect(page.getByText(/abierta para revisión/)).toBeVisible();
  expect(writes).toBe(0);
});

async function setupMockEditor(page: import('@playwright/test').Page, onWrite: () => void) {
  page.on('dialog', dialog => dialog.accept());
  await page.addInitScript(() => localStorage.setItem('pcgamercdmx_directus_access_token', 'test-editor-session'));
  const post = { id: 1, title: 'Versión actual', slug: 'version-actual', summary: 'Resumen válido de prueba editorial.',
    category: 1, tags: [], published: false, published_at: null, date_updated: '2026-10-25T12:00:00Z',
    sections: [{ title: 'Sección', text: '<p>Contenido actual</p>', images: [] }], cover_image: null };
  await page.route('https://cms.test.pcgamercdmx.com/**', async route => {
    if (!['GET', 'OPTIONS'].includes(route.request().method())) onWrite();
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === '/users/me') data = { id: 'test-editor' };
    if (path === '/items/pc_blog_posts/1') data = post;
    if (path === '/items/pc_blog_categories') data = [{ id: 1, name: 'Guías', slug: 'guias' }];
    if (path === '/revisions') data = [{ id: 7, activity: { timestamp: '2026-10-24T12:00:00Z' } }];
    if (path === '/revisions/7') data = { collection: 'pc_blog_posts', item: '1', data: { ...post, title: 'Versión anterior', slug: 'url-antigua' } };
    await route.fulfill({ json: { data }, headers: { 'access-control-allow-origin': '*' } });
  });
}
